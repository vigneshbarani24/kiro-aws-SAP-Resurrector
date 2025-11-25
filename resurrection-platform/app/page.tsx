'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e] relative overflow-hidden">
      {/* Fog Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2e1065]/20 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <span className="text-9xl animate-pulse-glow">🎃</span>
          </div>
          
          <h1 className="text-7xl font-bold text-[#FF6B35] mb-6 tracking-tight">
            Resurrect Your Legacy ABAP
          </h1>
          
          <p className="text-2xl text-[#a78bfa] mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform haunted ABAP code into modern SAP CAP applications. 
            Bring your legacy systems back from the dead! 👻
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/upload">
              <Button 
                size="lg"
                className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] text-lg px-8 py-6 shadow-[0_0_30px_rgba(255,107,53,0.5)] transition-all hover:shadow-[0_0_40px_rgba(255,107,53,0.7)]"
              >
                <span className="mr-2 text-2xl">🎃</span>
                Start Resurrection
              </Button>
            </Link>
            <Link href="/docs">
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50 text-lg px-8 py-6"
              >
                <span className="mr-2">📖</span>
                View Grimoire (Docs)
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
            <CardHeader>
              <div className="text-5xl mb-4 text-center">🔮</div>
              <CardTitle className="text-[#FF6B35] text-center">
                Spectral Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] text-center">
                AI-powered parsing extracts business logic, dependencies, and patterns from your ancient ABAP code
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
            <CardHeader>
              <div className="text-5xl mb-4 text-center">⚗️</div>
              <CardTitle className="text-[#FF6B35] text-center">
                Transformation Ritual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] text-center">
                5-step workflow generates production-ready SAP CAP applications with CDS models, services, and Fiori UI
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
            <CardHeader>
              <div className="text-5xl mb-4 text-center">🪦</div>
              <CardTitle className="text-[#FF6B35] text-center">
                GitHub Resurrection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] text-center">
                Automatically creates GitHub repositories with complete CAP projects, ready to deploy to SAP BTP
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20 mb-16">
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-[#FF6B35] mb-2">75%</div>
                <p className="text-[#a78bfa]">Productivity Boost</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-[#FF6B35] mb-2">50%</div>
                <p className="text-[#a78bfa]">Cost Reduction</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-[#FF6B35] mb-2">100%</div>
                <p className="text-[#a78bfa]">Clean Core Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-[#FF6B35] text-center mb-12">
            The Resurrection Ritual
          </h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              { step: 1, icon: '📤', title: 'Upload ABAP', desc: 'Summon your legacy code files' },
              { step: 2, icon: '🔍', title: 'Analyze', desc: 'Parse and extract business logic' },
              { step: 3, icon: '📋', title: 'Plan', desc: 'Create transformation architecture' },
              { step: 4, icon: '⚡', title: 'Generate', desc: 'Build CAP models, services, and UI' },
              { step: 5, icon: '✅', title: 'Validate', desc: 'Check quality and compliance' },
              { step: 6, icon: '🚀', title: 'Deploy', desc: 'Create GitHub repo and BAS link' },
            ].map((item) => (
              <Card 
                key={item.step}
                className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#2e1065] border-2 border-[#FF6B35] flex items-center justify-center text-2xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#F7F7FF] font-semibold text-lg mb-1">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-[#a78bfa]">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-2 border-[#FF6B35] bg-gradient-to-br from-[#2e1065]/50 to-[#1a0f2e] shadow-[0_0_40px_rgba(255,107,53,0.3)]">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold text-[#FF6B35] mb-4">
              Ready to Resurrect Your ABAP?
            </h2>
            <p className="text-xl text-[#a78bfa] mb-8">
              Join the modernization revolution. Transform legacy code into Clean Core applications.
            </p>
            <Link href="/upload">
              <Button 
                size="lg"
                className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] text-xl px-12 py-8 shadow-[0_0_30px_rgba(255,107,53,0.5)]"
              >
                <span className="mr-3 text-3xl">🎃</span>
                Begin Your Resurrection
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Floating Ghosts */}
      <div className="fixed top-20 right-20 text-6xl animate-float opacity-20 pointer-events-none">
        👻
      </div>
      <div className="fixed bottom-20 left-20 text-6xl animate-float opacity-20 pointer-events-none" style={{ animationDelay: '1s' }}>
        👻
      </div>
    </div>
  );
}
