import { Link } from 'react-router-dom';
import {
  Zap, Droplets, Sparkles, Paintbrush, TreePine,
  Hammer, HardHat, Shield, Wind, Truck,
} from 'lucide-react';
import type { ServiceCategory } from '../types';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  eletricista: <Zap className="w-8 h-8" />,
  encanador: <Droplets className="w-8 h-8" />,
  faxineira: <Sparkles className="w-8 h-8" />,
  pintor: <Paintbrush className="w-8 h-8" />,
  jardineiro: <TreePine className="w-8 h-8" />,
  marceneiro: <Hammer className="w-8 h-8" />,
  pedreiro: <HardHat className="w-8 h-8" />,
  serralheiro: <Shield className="w-8 h-8" />,
  ar_condicionado: <Wind className="w-8 h-8" />,
  mudanca: <Truck className="w-8 h-8" />,
};

interface CategoryCardProps {
  category: ServiceCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/categorias/${category.slug}`}
      className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <div className="text-primary-500 group-hover:text-primary-600 transition-colors">
        {CATEGORY_ICONS[category.slug] ?? <Hammer className="w-8 h-8" />}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
        {category.nome}
      </span>
    </Link>
  );
}
