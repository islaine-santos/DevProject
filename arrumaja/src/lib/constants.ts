export const ORDER_STATUS_LABELS: Record<string, string> = {
  aguardando: 'Aguardando',
  aceito: 'Aceito',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  aguardando: 'bg-yellow-100 text-yellow-800',
  aceito: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-purple-100 text-purple-800',
  concluido: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  expirado: 'bg-gray-100 text-gray-800',
};

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

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const ORDER_EXPIRATION_HOURS = 48;
