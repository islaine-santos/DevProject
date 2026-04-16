export const ORDER_STATUS_LABELS: Record<string, string> = {
  criado: 'Criado',
  aguardando_profissional: 'Aguardando Propostas',
  aceito: 'Aceito',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  criado: 'bg-gray-100 text-gray-800',
  aguardando_profissional: 'bg-yellow-100 text-yellow-800',
  aceito: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-purple-100 text-purple-800',
  concluido: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  expirado: 'bg-gray-100 text-gray-500',
};

export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aceita: 'Aceita',
  recusada: 'Recusada',
  expirada: 'Expirada',
};

export const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-indigo-100 text-indigo-800',
  aceita: 'bg-green-100 text-green-800',
  recusada: 'bg-red-100 text-red-700',
  expirada: 'bg-gray-100 text-gray-500',
};

export const MAX_PROPOSALS_PER_ORDER = 3;

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  boost: 'Boost',
  pro_boost: 'Pro Boost',
};

export const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  boost: 'bg-orange-100 text-orange-700',
  pro_boost: 'bg-amber-100 text-amber-700',
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  suspenso: 'Suspenso',
};

export const SELO_LABELS: Record<string, string> = {
  novo: 'Novo',
  verificado: 'Verificado',
  premium: 'Premium',
  suspenso: 'Suspenso',
};

export const SELO_COLORS: Record<string, string> = {
  novo: 'bg-gray-100 text-gray-600',
  verificado: 'bg-green-100 text-green-700',
  premium: 'bg-amber-100 text-amber-700',
  suspenso: 'bg-red-100 text-red-700',
};

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const ORDER_EXPIRATION_HOURS = 48;
export const WALLET_CREDIT_PER_VISIT = 40;
export const CLUBE_MONTHLY_PRICE = 14.9;
export const BOOST_MONTHLY_PRICE = 29.9;
export const PRO_BOOST_MONTHLY_PRICE = 59.9;
export const CLUBE_FREE_VISIT_MONTH = 3;
export const CLUBE_CASHBACK_PERCENT = 10;
export const WALLET_MIN_WITHDRAW = 100;
