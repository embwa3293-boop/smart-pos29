import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function GlassModal({ isOpen, onClose, title, children }: GlassModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-xl" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface/90 backdrop-blur-md rounded-t-2xl border border-[rgba(192,192,192,0.15)] shadow-modal animate-slide-up max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(192,192,192,0.1)]">
          <h2 className="text-lg font-semibold text-silver font-body">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
