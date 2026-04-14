export type UserType = 'cliente' | 'profissional';

export type PlanType = 'free' | 'boost' | 'pro_boost';

export type OrderStatus =
  | 'aguardando'
  | 'aceito'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'expirado';

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone: string;
  tipo: UserType;
  avatar_url: string | null;
  created_at: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  bio: string;
  categorias: string[];
  cidade: string;
  estado: string;
  plano: PlanType;
  avaliacao_media: number;
  total_avaliacoes: number;
  disponivel: boolean;
  created_at: string;
  user?: User;
}

export interface ServiceCategory {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  descricao: string;
  ativa: boolean;
}

export interface Order {
  id: string;
  cliente_id: string;
  profissional_id: string | null;
  categoria_id: string;
  titulo: string;
  descricao: string;
  endereco: string;
  cidade: string;
  estado: string;
  valor_estimado: number | null;
  status: OrderStatus;
  criado_em: string;
  aceito_em: string | null;
  concluido_em: string | null;
  expira_em: string;
  cliente?: User;
  profissional?: User;
  categoria?: ServiceCategory;
}

export interface Review {
  id: string;
  order_id: string;
  avaliador_id: string;
  avaliado_id: string;
  nota: number;
  comentario: string;
  created_at: string;
  avaliador?: User;
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
