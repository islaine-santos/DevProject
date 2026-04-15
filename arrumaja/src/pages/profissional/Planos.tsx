import { Check, Zap, Crown } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useProfessional } from '../../hooks/useProfessional';
import { useSubscriptionB2B } from '../../hooks/useSubscription';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { classNames, formatCurrency } from '../../lib/utils';
import { BOOST_MONTHLY_PRICE, PRO_BOOST_MONTHLY_PRICE } from '../../lib/constants';
import type { PlanType } from '../../types';

const PLANS = [
  {
    id: 'free' as PlanType,
    name: 'Gratuito',
    price: 0,
    icon: null,
    features: ['Perfil visível na plataforma', 'Receber pedidos de serviço', 'Chat com clientes', 'Avaliações e comentários'],
    highlight: false,
  },
  {
    id: 'boost' as PlanType,
    name: 'Boost',
    price: BOOST_MONTHLY_PRICE,
    icon: Zap,
    features: ['Tudo do plano Gratuito', 'Aparece antes dos profissionais free', 'Badge de destaque no perfil', 'Prioridade em notificações'],
    highlight: false,
  },
  {
    id: 'pro_boost' as PlanType,
    name: 'Pro Boost',
    price: PRO_BOOST_MONTHLY_PRICE,
    icon: Crown,
    features: ['Tudo do plano Boost', 'Aparece no topo de todas as buscas', 'Badge Pro exclusivo', 'Destaque na página inicial', 'Suporte prioritário'],
    highlight: true,
  },
];

export function Planos() {
  const { user } = useAuthContext();
  const { professional, loading: loadingPro } = useProfessional(user?.id);
  const { subscription, loading: loadingSub, subscribe, cancel } = useSubscriptionB2B(professional?.id);

  if (loadingPro || loadingSub) return <LoadingSpinner />;

  const currentPlan = professional?.plano ?? 'free';

  async function handleSelectPlan(plan: PlanType) {
    if (plan === currentPlan) return;
    if (plan === 'free') {
      await cancel();
    } else {
      await subscribe(plan as 'boost' | 'pro_boost', 'stripe');
    }
    window.location.reload();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Planos de Destaque</h1>
        <p className="text-gray-500">Aumente sua visibilidade e receba mais pedidos de serviço</p>
      </div>

      {subscription && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 text-center">
          Você está no plano <strong>{PLANS.find((p) => p.id === subscription.plano)?.name}</strong>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;

          return (
            <div key={plan.id}
              className={classNames(
                'bg-white rounded-2xl border-2 p-6 flex flex-col',
                plan.highlight ? 'border-accent-500 shadow-lg shadow-accent-100 relative' : 'border-gray-200',
              )}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className="w-5 h-5 text-accent-500" />}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-400 text-sm">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleSelectPlan(plan.id)} disabled={isCurrent}
                className={classNames(
                  'w-full py-2.5 rounded-lg font-medium transition-colors text-sm',
                  isCurrent ? 'bg-gray-100 text-gray-500 cursor-default'
                    : plan.highlight ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-primary-600 text-white hover:bg-primary-700',
                )}>
                {isCurrent ? 'Plano atual' : plan.price === 0 ? 'Voltar ao gratuito' : `Assinar ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Os planos pagos serão cobrados mensalmente. Cancele quando quiser.</p>
    </div>
  );
}
