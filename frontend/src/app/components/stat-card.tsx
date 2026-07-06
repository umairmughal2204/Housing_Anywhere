interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  sub?: string;
}

export function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px] flex items-start gap-[14px] sm:gap-[16px]">
      <div className="w-[48px] h-[48px] rounded-[12px] bg-brand-light flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-neutral-gray text-[13px] font-medium mb-[4px]">{label}</p>
        <p className="text-neutral-black text-[22px] sm:text-[28px] font-bold leading-none">{value}</p>
        {sub && <p className="text-neutral-gray text-[12px] mt-[4px]">{sub}</p>}
      </div>
    </div>
  );
}
