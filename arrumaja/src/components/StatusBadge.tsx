import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../lib/constants';
import { classNames } from '../lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
