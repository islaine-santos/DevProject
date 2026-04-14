import { CategoryCard } from '../components/CategoryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCategories } from '../hooks/useCategories';

export function Categorias() {
  const { categories, loading } = useCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Categorias de Serviço
      </h1>
      <p className="text-gray-500 mb-8">
        Escolha a categoria do serviço que você precisa
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
