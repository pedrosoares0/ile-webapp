import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function SheetModal({ isOpen, title, subtitle, onClose, children }: SheetModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-[430px] max-h-[90vh] overflow-y-auto rounded-t-[45px] bg-white p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[32px] font-black" style={{ color: 'var(--theme-color, #BF2429)' }}>{title}</h2>
                {subtitle ? (
                  <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-color, #BF2429)', opacity: 0.4 }}>
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(var(--theme-color-rgb, 191, 36, 41), 0.08)', color: 'var(--theme-color, #BF2429)' }}
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
