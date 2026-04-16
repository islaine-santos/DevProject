import { ShieldCheck, Crown, Star } from 'lucide-react';
import { SELO_LABELS, SELO_COLORS } from '../../lib/constants';
import { classNames } from '../../lib/utils';

interface SeloBadgeProps {
  selo: string;
}

export function SeloBadge({ selo }: SeloBadgeProps) {
  if (selo === 'suspenso') return null;
  const Icon = selo === 'premium' ? Crown : selo === 'verificado' ? ShieldCheck : Star;

  return (
    <span className={classNames('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', SELO_COLORS[selo] ?? 'bg-gray-100 text-gray-600')}>
      <Icon className="w-3 h-3" />
      {SELO_LABELS[selo] ?? selo}
    </span>
  );
}
