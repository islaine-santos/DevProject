import { ORDER_STATUS_LABELS } from '../../lib/constants';
import { classNames } from '../../lib/utils';
import type { OrderStatus } from '../../types';

const STATUSES: OrderStatus[] = ['aguardando_profissional', 'proposta_enviada', 'aceito', 'em_andamento', 'concluido'];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIdx = STATUSES.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-0">
      {STATUSES.map((status, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={classNames(
                'w-3 h-3 rounded-full border-2 shrink-0',
                done ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300',
                active && 'ring-4 ring-primary-100'
              )} />
              {i < STATUSES.length - 1 && (
                <div className={classNames('w-0.5 h-8', done ? 'bg-primary-600' : 'bg-gray-200')} />
              )}
            </div>
            <span className={classNames(
              'text-sm -mt-0.5',
              active ? 'font-semibold text-primary-700' : done ? 'text-gray-700' : 'text-gray-400'
            )}>
              {ORDER_STATUS_LABELS[status]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
