import { Link } from 'react-router-dom';
import { Search, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useServices } from '../hooks/useServices';

export function Home() {
  const { services, loading } = useServices();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Encontre o profissional ideal para o seu serviço
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              Conectamos você a profissionais qualificados de serviços domésticos.
              Receba propostas, compare e escolha com confiança.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/servicos"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Buscar Serviço
              </Link>
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-400 transition-colors border border-primary-400"
              >
                Sou Profissional
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Nossos Serviços
          </h2>
          <p className="text-gray-500">
            Escolha o serviço e receba propostas de profissionais prontos para ajudar
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {services.map((svc) => (
              <Link
                key={svc.id}
                to={`/profissionais?service=${svc.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-2 block">{svc.icone || '🔧'}</span>
                <span className="text-sm font-medium text-gray-900">{svc.nome}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profissionais Verificados</h3>
              <p className="text-sm text-gray-500">
                Avaliações reais de outros clientes para você escolher com confiança.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Resposta Rápida</h3>
              <p className="text-sm text-gray-500">
                Profissionais recebem seu pedido e enviam propostas rapidamente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sem Taxas Obrigatórias</h3>
              <p className="text-sm text-gray-500">
                Conectamos você diretamente ao profissional, sem cobranças escondidas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
