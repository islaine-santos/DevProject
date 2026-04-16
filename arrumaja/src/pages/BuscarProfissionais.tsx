import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, CheckCircle } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useProfessionals } from '../hooks/useProfessional';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StarRating } from '../components/StarRating';
import { SeloBadge } from '../components/professionals/SeloBadge';
import { ESTADOS_BR, PLAN_LABELS, PLAN_COLORS } from '../lib/constants';
import { getInitials, classNames } from '../lib/utils';

export function BuscarProfissionais() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { services } = useServices();
  const [showFilters, setShowFilters] = useState(false);

  const serviceFilter = searchParams.get('service') ?? '';
  const cidadeFilter = searchParams.get('cidade') ?? '';
  const estadoFilter = searchParams.get('estado') ?? '';
  const seloFilter = searchParams.get('selo') ?? '';

  const { professionals, loading } = useProfessionals({
    serviceId: serviceFilter || undefined,
    cidade: cidadeFilter || undefined,
    estado: estadoFilter || undefined,
    selo: seloFilter || undefined,
  });

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-500 text-sm mt-1">{professionals.length} profissional(is) encontrado(s)</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="md:hidden inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 px-3 py-2 rounded-lg">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className={classNames('w-full md:w-64 shrink-0 space-y-4', !showFilters && 'hidden md:block')}>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
              <select value={serviceFilter} onChange={(e) => updateFilter('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Todos</option>
                {services.map((svc) => <option key={svc.id} value={svc.id}>{svc.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={cidadeFilter} onChange={(e) => updateFilter('cidade', e.target.value)}
                  placeholder="Buscar cidade..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={estadoFilter} onChange={(e) => updateFilter('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Todos</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selo</label>
              <select value={seloFilter} onChange={(e) => updateFilter('selo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="">Todos</option>
                <option value="verificado">Verificado</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {(serviceFilter || cidadeFilter || estadoFilter || seloFilter) && (
              <button onClick={() => setSearchParams({})} className="w-full text-sm text-red-500 hover:text-red-600">
                Limpar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : professionals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">Nenhum profissional encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {professionals.map((prof) => {
                const userName = prof.user?.nome ?? 'Profissional';
                const userAvatar = prof.user?.avatar_url ?? null;

                return (
                  <Link key={prof.id} to={`/profissional/${prof.user_id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-gray-500">{getInitials(userName)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                        <SeloBadge selo={prof.selo} />
                        {prof.plano !== 'free' && (
                          <span className={classNames('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0', PLAN_COLORS[prof.plano])}>
                            <CheckCircle className="w-2.5 h-2.5" /> {PLAN_LABELS[prof.plano]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prof.cidade}, {prof.estado}</span>
                        <span className="flex items-center gap-1">
                          <StarRating rating={prof.avaliacao_media} size="sm" />
                          <span className="text-xs">({prof.total_avaliacoes})</span>
                        </span>
                      </div>
                      {prof.bio && <p className="text-xs text-gray-400 line-clamp-1">{prof.bio}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
