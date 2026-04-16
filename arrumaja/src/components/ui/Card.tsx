import type { ReactNode } from 'react';
import { classNames } from '../../lib/utils';

interface CardProps {
  title?: string;
  padding?: boolean;
  border?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({
  title,
  padding = true,
  border = true,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl',
        border && 'border border-gray-200',
        padding && 'p-4 sm:p-6',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
