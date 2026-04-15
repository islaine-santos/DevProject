import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Servicos() {
  const { services, loading } = useServices();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Serviços Disponíveis</h1>
      <p className="text-gray-500 mb-8">Escolha um serviço para encontrar profissionais qualificados</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {services.map((svc) => (
          <Link key={svc.id} to={`/profissionais?service=${svc.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group">
            <span className="text-3xl mb-3 block">{svc.icone || '🔧'}</span>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{svc.nome}</span>
            {svc.descricao && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{svc.descricao}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
