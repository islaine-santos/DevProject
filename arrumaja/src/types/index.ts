export type UserType = 'cliente' | 'profissional' | 'admin';
export type GenderType = 'masculino' | 'feminino' | 'nao_binario' | 'nao_informado';
export type PlanType = 'free' | 'boost' | 'pro_boost';
export type KycStatus = 'pendente' | 'em_analise' | 'aprovado' | 'reprovado' | 'suspenso';
export type SeloType = 'novo' | 'verificado' | 'premium' | 'suspenso';
export type GenderPreference = 'qualquer' | 'feminino';

export type OrderStatus =
  | 'criado'
  | 'aguardando_profissional'
  | 'aceito'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'expirado';

export type ProposalStatus = 'pendente' | 'aceita' | 'recusada' | 'expirada';

export type SubscriptionStatus = 'ativo' | 'cancelado' | 'expirado';
export type WalletTransactionType = 'credito' | 'debito' | 'saque';
export type IncidentStatus = 'aberto' | 'em_analise' | 'resolvido' | 'arquivado';
export type DisputeStatus = 'aberto' | 'mediacao' | 'resolvido' | 'encerrado';

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone: string;
  tipo: UserType;
  genero: GenderType;
  avatar_url: string | null;
  created_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  bio: string;
  cidade: string;
  estado: string;
  regiao_atuacao: string;
  plano: PlanType;
  avaliacao_media: number;
  total_avaliacoes: number;
  disponivel: boolean;
  kyc_status: KycStatus;
  kyc_tier: number;
  kyc_docs: Record<string, unknown>;
  selo: SeloType;
  ativo: boolean;
  created_at: string;
  user?: User;
  services?: Service[];
}

export interface Service {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  descricao: string;
  ativa: boolean;
}

export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_id: string;
}

export interface Order {
  id: string;
  cliente_id: string;
  profissional_id: string | null;
  service_id: string;
  titulo: string;
  descricao: string;
  endereco: string;
  cidade: string;
  estado: string;
  genero_preferencia: GenderPreference;
  valor_final: number | null;
  status: OrderStatus;
  criado_em: string;
  aceito_em: string | null;
  concluido_em: string | null;
  expira_em: string;
  cliente?: User;
  profissional?: User;
  service?: Service;
  proposals?: Proposal[];
}

export interface Proposal {
  id: string;
  order_id: string;
  profissional_id: string;
  valor_estimado_min: number | null;
  valor_estimado_max: number | null;
  necessita_visita_tecnica: boolean;
  mensagem: string;
  status: ProposalStatus;
  criado_em: string;
  respondido_em: string | null;
  profissional?: User;
  professional?: Professional;
}

export interface Review {
  id: string;
  order_id: string;
  avaliador_id: string;
  avaliado_id: string;
  nota: number;
  comentario: string;
  doacao_valor: number | null;
  doacao_campanha_id: string | null;
  created_at: string;
  avaliador?: User;
}

export interface Wallet {
  id: string;
  professional_id: string;
  saldo: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  tipo: WalletTransactionType;
  valor: number;
  descricao: string;
  referencia_id: string | null;
  created_at: string;
}

export interface SubscriptionB2B {
  id: string;
  professional_id: string;
  plano: 'boost' | 'pro_boost';
  status: SubscriptionStatus;
  inicio: string;
  fim: string | null;
  pagamento_via: 'stripe' | 'wallet';
  created_at: string;
}

export interface SubscriptionB2C {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  inicio: string;
  fim: string | null;
  meses_ativos: number;
  visita_gratuita_disponivel: boolean;
  cashback_acumulado: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  ong_nome: string;
  ong_url: string;
  ativa: boolean;
  inicio: string | null;
  fim: string | null;
  created_at: string;
}

export interface Donation {
  id: string;
  review_id: string | null;
  campanha_id: string;
  user_id: string;
  valor: number;
  created_at: string;
}

export interface SecurityIncident {
  id: string;
  order_id: string | null;
  reporter_id: string;
  reported_id: string;
  tipo: string;
  descricao: string;
  status: IncidentStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  referencia_id: string | null;
  referencia_tipo: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  conteudo: string;
  lida: boolean;
  created_at: string;
  sender?: User;
}

export interface Dispute {
  id: string;
  order_id: string;
  iniciado_por: string;
  motivo: string;
  status: DisputeStatus;
  resolucao: string | null;
  created_at: string;
}
