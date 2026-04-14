import { useState } from 'react';
import { Check, Zap, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthContext';
import type { PlanType } from '../../types';
import { classNames } from '../../lib/utils';

const PLANS = [
  {
    id: 'free' as PlanType,
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    icon: null,
    features: [
      'Perfil visível na plataforma',
      'Receber pedidos de serviço',
      'Chat com clientes',
      'Avaliações e comentários',
    ],
    cta: 'Plano atual',
    highlight: false,
  },
  {
    id: 'boost' as PlanType,
    name: 'Boost',
    price: 'R$ 29,90',
    period: '/mês',
    icon: Zap,
    features: [
      'Tudo do plano Gratuito',
      'Aparece antes dos profissionais free',
      'Badge de destaque no perfil',
      'Prioridade em notificações',
    ],
    cta: 'Assinar Boost',
    highlight: false,
  },
  {
    id: 'pro_boost' as PlanType,
    name: 'Pro Boost',
    price: 'R$ 59,90',
    period: '/mês',
    icon: Crown,
    features: [
      'Tudo do plano Boost',
      'Aparece no topo de todas as buscas',
      'Badge Pro exclusivo',
      'Destaque na página inicial',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro Boost',
    highlight: true,
  },
];

export function Planos() {
  const { user } = useAuthContext();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSelectPlan(plan: PlanType) {
    if (!user || plan === currentPlan) return;
    setLoading(true);
    setMessage('');

    // In production, this would redirect to a payment gateway
    // For now, we update the plan directly
    const { error } = await supabase
      .from('professional_profiles')
      .update({ plano: plan })
      .eq('user_id', user.id);

    if (error) {
      setMessage('Erro ao atualizar plano.');
    } else {
      setCurrentPlan(plan);
      setMessage(`Plano atualizado para ${PLANS.find((p) => p.id === plan)?.name}!`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Planos de Destaque</h1>
        <p className="text-gray-500">
          Aumente sua visibilidade e receba mais pedidos de serviço
        </p>
      </div>

      {message && (
        <div className={classNames(
          'text-sm p-3 rounded-lg mb-6 text-center',
          message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        )}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;

          return (
            <div
              key={plan.id}
              className={classNames(
                'bg-white rounded-2xl border-2 p-6 flex flex-col',
                plan.highlight
                  ? 'border-accent-500 shadow-lg shadow-accent-100 relative'
                  : 'border-gray-200',
              )}
            >
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
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent || loading}
                className={classNames(
                  'w-full py-2.5 rounded-lg font-medium transition-colors text-sm',
                  isCurrent
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : plan.highlight
                      ? 'bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50',
                )}
              >
                {isCurrent ? 'Plano atual' : loading ? 'Atualizando...' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Os planos pagos serão cobrados mensalmente. Cancele quando quiser.
      </p>
    </div>
  );
}
