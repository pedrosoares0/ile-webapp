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
            className="relative w-full max-w-[430px] max-h-[90vh] overflow-y-auto rounded-t-[45px] bg-[#fef7e7] p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[32px] font-black text-[#941c1c]">{title}</h2>
                {subtitle ? (
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#941c1c]/40">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#941c1c]/5 text-[#941c1c]"
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
