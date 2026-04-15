import { WalletIcon } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface WalletBalanceProps {
  saldo: number;
}

export function WalletBalance({ saldo }: WalletBalanceProps) {
  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <WalletIcon className="w-4 h-4 text-green-600" />
      <span className="font-medium">{formatCurrency(saldo)}</span>
    </div>
  );
}
