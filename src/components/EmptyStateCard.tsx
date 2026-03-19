import { ReactNode } from 'react';

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function EmptyStateCard({ icon, title, description }: EmptyStateCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-black/[0.03] bg-white/30 px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </div>
      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#414141]/30">{title}</p>
      <p className="mt-3 max-w-[260px] text-[13px] font-medium leading-relaxed text-[#414141]/50">
        {description}
      </p>
    </div>
  );
}
