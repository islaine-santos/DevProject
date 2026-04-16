import { PawPrint } from 'lucide-react';

interface PetsIndicatorProps {
  animaisNoLocal: boolean;
  compact?: boolean;
}

export function PetsIndicator({ animaisNoLocal, compact = false }: PetsIndicatorProps) {
  if (!animaisNoLocal) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
        <PawPrint className="w-3.5 h-3.5" />
        Animais no local
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm font-medium">
      <PawPrint className="w-4 h-4 shrink-0" />
      <span>Há animais de estimação no local</span>
    </div>
  );
}
