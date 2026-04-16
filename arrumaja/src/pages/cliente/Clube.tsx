import { Shield, Check, Gift, Percent } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useSubscriptionB2C } from '../../hooks/useSubscription';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../../lib/utils';
import { CLUBE_MONTHLY_PRICE, CLUBE_FREE_VISIT_MONTH, CLUBE_CASHBACK_PERCENT } from '../../lib/constants';

export function ClienteClube() {
  const { user } = useAuthContext();
  const { subscription, loading, subscribe, cancel } = useSubscriptionB2C(user?.id);

  if (loading) return <LoadingSpinner />;

  const benefits = [
    { icon: Gift, text: `Visita técnica gratuita após ${CLUBE_FREE_VISIT_MONTH} meses` },
    { icon: Percent, text: `${CLUBE_CASHBACK_PERCENT}% de cashback em serviços` },
    { icon: Shield, text: 'Acesso prioritário a profissionais premium' },
    { icon: Check, text: 'Suporte preferencial' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">Clube Casa Segura</h1>
        <p className="text-gray-500 mt-1">Benefícios exclusivos para clientes</p>
      </div>

      {subscription ? (
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Ativo</span>
            <span className="text-sm text-gray-500">Desde {formatDate(subscription.inicio)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Meses ativos</span>
              <p className="font-semibold text-gray-900">{subscription.meses_ativos}</p>
            </div>
            <div>
              <span className="text-gray-500">Cashback acumulado</span>
              <p className="font-semibold text-green-600">{formatCurrency(subscription.cashback_acumulado)}</p>
            </div>
            <div>
              <span className="text-gray-500">Visita gratuita</span>
              <p className="font-semibold text-gray-900">{subscription.visita_gratuita_disponivel ? 'Disponível' : 'Não disponível'}</p>
            </div>
          </div>
          <button onClick={() => cancel()}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
            Cancelar assinatura
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-200 p-8 mb-6 text-center">
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(CLUBE_MONTHLY_PRICE)}<span className="text-lg font-normal text-gray-500">/mês</span></p>
          <button onClick={() => subscribe()}
            className="mt-4 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Assinar agora
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefícios</h2>
        <ul className="space-y-4">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <b.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-700">{b.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
