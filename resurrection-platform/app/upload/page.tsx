'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { halloweenToast } from '@/lib/toast';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file extension
    const validExtensions = ['.abap', '.txt'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      halloweenToast.upload.invalidFormat();
      return `👻 Spooky error: ${file.name} must be .abap or .txt format`;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      halloweenToast.upload.tooLarge('10MB');
      return `🦇 File too large: ${file.name} exceeds 10MB`;
    }

    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);

      if (error) {
        errors.push(error);
      } else {
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          file: file,
        });
      }
    }

    setValidationErrors(errors);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    
    const uploadToastId = halloweenToast.upload.started();

    try {
      const uploadedObjectIds: string[] = [];
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));
        
        // Read file content
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (!fileInput?.files?.[i]) {
          throw new Error(`File ${file.name} not found`);
        }
        
        const actualFile = fileInput.files[i];
        const formData = new FormData();
        formData.append('file', actualFile);

        // Upload to API
        const response = await fetch('/api/abap/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        uploadedObjectIds.push(result.object.id);
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Create resurrection with uploaded objects
      const resurrectionName = files.length === 1 
        ? files[0].name.replace(/\.[^/.]+$/, '')
        : `Resurrection ${new Date().toLocaleDateString()}`;
      
      const resurrectionResponse = await fetch('/api/resurrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resurrectionName,
          description: `Uploaded ${files.length} ABAP file(s)`,
          module: 'CUSTOM', // Will be determined from files
          abapObjectIds: uploadedObjectIds,
        }),
      });

      if (!resurrectionResponse.ok) {
        const error = await resurrectionResponse.json();
        throw new Error(error.message || 'Failed to create resurrection');
      }

      const resurrection = await resurrectionResponse.json();

      // Success notification
      halloweenToast.upload.success(files.length);

      // Start the transformation workflow automatically
      const resurrectionId = resurrection.resurrection.id;
      
      try {
        const startResponse = await fetch(`/api/resurrections/${resurrectionId}/start`, {
          method: 'POST',
        });

        if (!startResponse.ok) {
          console.warn('Failed to start workflow automatically');
        }
      } catch (error) {
        console.warn('Failed to start workflow:', error);
      }

      // Navigate to resurrection detail page
      router.push(`/resurrections/${resurrectionId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      halloweenToast.error(
        '🦇 Upload Ritual Failed',
        error instanceof Error ? error.message : 'The spirits rejected your offering. Please try again.'
      );
      setValidationErrors([`🔴 Haunted error: ${error instanceof Error ? error.message : 'Upload failed'}`]);
    } finally {
      setUploading(false);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#0a0a0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <span className="text-8xl animate-pulse-glow">🎃</span>
          </div>
          <h1 className="text-5xl font-bold text-[#FF6B35] mb-4">
            Summon Your ABAP Code
          </h1>
          <p className="text-xl text-[#a78bfa]">
            Upload your legacy ABAP files to begin the resurrection ritual
          </p>
        </div>

        {/* Upload Zone */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF6B35] flex items-center gap-2">
              <span>📜</span>
              Upload ABAP Files
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Drag and drop your .abap or .txt files, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300
                ${
                  isDragging
                    ? 'border-[#FF6B35] bg-[#2e1065]/50 shadow-[0_0_30px_rgba(255,107,53,0.4)]'
                    : 'border-[#5b21b6] hover:border-[#8b5cf6] hover:bg-[#2e1065]/20'
                }
              `}
            >
              {/* Ghost Animation */}
              <div className="absolute top-4 right-4">
                <span className="text-4xl animate-float">👻</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#2e1065] border-2 border-[#5b21b6] flex items-center justify-center">
                    <span className="text-4xl">📤</span>
                  </div>
                </div>

                <div>
                  <p className="text-lg text-[#F7F7FF] mb-2">
                    {isDragging ? '👻 Release to summon files...' : 'Drop your ABAP files here'}
                  </p>
                  <p className="text-sm text-[#a78bfa]">
                    or
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    accept=".abap,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label htmlFor="file-input">
                    <Button
                      type="button"
                      className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <span className="mr-2">🔮</span>
                      Browse Files
                    </Button>
                  </label>
                </div>

                <p className="text-xs text-[#6b7280]">
                  Supported formats: .abap, .txt (max 10MB per file)
                </p>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-[#dc2626]/10 border border-[#dc2626] rounded-lg">
                <h4 className="text-[#dc2626] font-semibold mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  Haunted Warnings
                </h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-[#dc2626]">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-[#FF6B35] flex items-center gap-2">
                  <span>⚰️</span>
                  Summoned Files ({files.length})
                </CardTitle>
                <Badge variant="outline" className="border-[#8b5cf6] text-[#a78bfa]">
                  Total: {formatSize(totalSize)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#1a0f2e] border border-[#5b21b6] rounded-lg hover:border-[#8b5cf6] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1">
                        <p className="text-[#F7F7FF] font-medium">{file.name}</p>
                        <p className="text-sm text-[#a78bfa]">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
                    >
                      <span>🗑️</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-float">👻</span>
                    <div>
                      <p className="text-[#F7F7FF] font-semibold">
                        Summoning spirits...
                      </p>
                      <p className="text-sm text-[#a78bfa]">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl animate-pulse-glow">🔮</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
          >
            ← Back to Crypt
          </Button>

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] shadow-[0_0_20px_rgba(255,107,53,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">🎃</span>
            {uploading ? 'Summoning...' : `Begin Resurrection (${files.length} files)`}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20 mt-8">
          <CardContent className="pt-6">
            <h3 className="text-[#FF6B35] font-semibold mb-3 flex items-center gap-2">
              <span>💀</span>
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-[#a78bfa]">
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35]">1.</span>
                <span>Your ABAP files will be parsed and analyzed by our spectral analyzer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35]">2.</span>
                <span>Business logic and dependencies will be extracted from the ancient code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35]">3.</span>
                <span>You'll see the Intelligence Dashboard with insights and resurrection options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B35]">4.</span>
                <span>Choose which objects to resurrect into modern SAP CAP applications</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
