/**
 * Halloween-themed toast notifications
 * Provides spooky, immersive feedback for user actions
 */

import { toast } from 'sonner';

// Halloween-themed toast messages
export const halloweenToast = {
  /**
   * Success toast with spooky celebration
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: '✨',
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #10B981',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
      },
    });
  },

  /**
   * Error toast with haunted styling
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: '🦇',
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #DC2626',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)',
      },
    });
  },

  /**
   * Warning toast with mystical styling
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: '⚠️',
      duration: 5000,
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #FF6B35',
        boxShadow: '0 0 20px rgba(255, 107, 53, 0.4)',
      },
    });
  },

  /**
   * Info toast with spectral styling
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: '👻',
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #8b5cf6',
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    });
  },

  /**
   * Loading toast for resurrection in progress
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      icon: '🕸️',
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #a78bfa',
        boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
      },
    });
  },

  /**
   * Promise toast for async operations with spooky states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      style: {
        background: 'linear-gradient(135deg, #2e1065 0%, #1a0f2e 100%)',
        color: '#F7F7FF',
        border: '2px solid #8b5cf6',
      },
    });
  },

  /**
   * Resurrection-specific toasts
   */
  resurrection: {
    started: (name: string) => {
      halloweenToast.info('🎃 Resurrection Ritual Begun', `Summoning ${name} from the graveyard...`);
    },

    analyzing: () => {
      halloweenToast.loading('🔮 Spectral Analysis', 'Parsing ancient ABAP incantations...');
    },

    planning: () => {
      halloweenToast.info('📋 Crafting Transformation Plan', 'Consulting the dark arts of modernization...');
    },

    generating: () => {
      halloweenToast.loading('⚡ Summoning CAP Application', 'Weaving CDS models and services...');
    },

    validating: () => {
      halloweenToast.info('✅ Exorcising Bugs', 'Checking for cursed code and haunted logic...');
    },

    deploying: () => {
      halloweenToast.loading('🚀 Releasing Spirit', 'Creating GitHub repository...');
    },

    completed: (githubUrl: string) => {
      halloweenToast.success(
        '⚰️ Resurrection Complete!',
        `Your ABAP has risen from the dead. View at ${githubUrl}`
      );
    },

    failed: (error: string) => {
      halloweenToast.error(
        '🦇 Dark Magic Failed',
        `The resurrection ritual was interrupted: ${error}`
      );
    },
  },

  /**
   * Upload-specific toasts
   */
  upload: {
    started: () => {
      return halloweenToast.loading('📤 Summoning Code', 'Uploading ABAP files from the crypt...');
    },

    success: (fileCount: number) => {
      halloweenToast.success(
        '✨ Code Summoned Successfully',
        `${fileCount} ABAP ${fileCount === 1 ? 'file' : 'files'} ready for resurrection`
      );
    },

    invalidFormat: () => {
      halloweenToast.error(
        '🦇 Invalid Incantation',
        'Only .abap, .txt, or .zip files can be summoned'
      );
    },

    tooLarge: (maxSize: string) => {
      halloweenToast.error(
        '🦇 File Too Cursed',
        `Maximum file size is ${maxSize}. Your file is too powerful!`
      );
    },
  },

  /**
   * GitHub-specific toasts
   */
  github: {
    creating: () => {
      return halloweenToast.loading('🪦 Creating GitHub Tomb', 'Preparing eternal resting place...');
    },

    created: (repoUrl: string) => {
      halloweenToast.success(
        '🪦 GitHub Repository Created',
        `Your resurrection lives at ${repoUrl}`
      );
    },

    failed: (error: string) => {
      halloweenToast.error(
        '🦇 GitHub Ritual Failed',
        `Could not create repository: ${error}`
      );
    },
  },

  /**
   * Validation-specific toasts
   */
  validation: {
    passed: () => {
      halloweenToast.success(
        '✅ Quality Exorcism Complete',
        'All bugs have been banished. Code is Clean Core compliant!'
      );
    },

    failed: (errorCount: number) => {
      halloweenToast.error(
        '🦇 Haunted Code Detected',
        `Found ${errorCount} ${errorCount === 1 ? 'issue' : 'issues'} lurking in the shadows`
      );
    },

    warning: (warningCount: number) => {
      halloweenToast.warning(
        '⚠️ Spectral Warnings',
        `${warningCount} potential ${warningCount === 1 ? 'issue' : 'issues'} detected`
      );
    },
  },
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
