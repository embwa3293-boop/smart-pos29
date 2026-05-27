import type { PaymentMethod } from '@/types';
import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';

interface PaymentMethodButtonProps {
  method: PaymentMethod;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  visa: CreditCard,
  instapay: Smartphone,
  wallet: Wallet,
};

export default function PaymentMethodButton({ method, label, isActive, onClick }: PaymentMethodButtonProps) {
  const Icon = methodIcons[method];

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border text-xs font-body
        transition-all duration-300 active:scale-[0.98] flex-1
        ${isActive
          ? 'bg-silver text-void border-silver shadow-elevated'
          : 'bg-transparent text-silver/60 border-[rgba(192,192,192,0.2)] hover:border-[rgba(192,192,192,0.4)] hover:text-silver'
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
