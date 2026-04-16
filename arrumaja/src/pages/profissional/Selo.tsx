import { Shield, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useProfessional } from '../../hooks/useProfessional';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SeloBadge } from '../../components/professionals/SeloBadge';
import { SELO_LABELS } from '../../lib/constants';

const SELO_TIERS = [
  {
    selo: 'novo' as const,
    label: 'Novo',
    description: 'Profissional recém-cadastrado.',
    icon: Shield,
    requirements: ['Cadastro completo', 'KYC Tier 1 aprovado'],
  },
  {
    selo: 'verificado' as const,
    label: 'Verificado',
    description: 'Profissional com histórico comprovado.',
    icon: CheckCircle,
    requirements: ['5+ serviços concluídos', 'Média ≥ 4.8', '0 incidentes', 'KYC Tier 2 aprovado'],
  },
  {
    selo: 'premium' as const,
    label: 'Premium',
    description: 'Excelência reconhecida pela plataforma.',
    icon: Star,
    requirements: ['20+ serviços concluídos', 'Média ≥ 4.9', 'KYC Tier 3', 'Plano Boost ou superior'],
  },
];

export function ProfissionalSelo() {
  const { user } = useAuthContext();
  const { professional, loading } = useProfessional(user?.id);

  if (loading) return <LoadingSpinner />;
  if (!professional) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Perfil profissional não encontrado.</p>
      </div>
    );
  }

  const currentSelo = professional.selo;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Selo de Verificação</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <SeloBadge selo={currentSelo} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Seu selo atual</h2>
            <p className="text-sm text-gray-500">{SELO_LABELS[currentSelo]}</p>
          </div>
        </div>
        {currentSelo === 'suspenso' && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Seu selo está suspenso. Entre em contato com o suporte para mais informações.
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Níveis de Selo</h2>
      <div className="space-y-4">
        {SELO_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrent = tier.selo === currentSelo;
          return (
            <div key={tier.selo} className={`bg-white rounded-xl border p-5 ${isCurrent ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${isCurrent ? 'text-primary-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">{tier.label}</h3>
                {isCurrent && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Atual</span>}
              </div>
              <p className="text-sm text-gray-500 mb-3">{tier.description}</p>
              <ul className="space-y-1">
                {tier.requirements.map((req) => (
                  <li key={req} className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
