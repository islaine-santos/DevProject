import { CheckCircle, Clock, XCircle, ShieldAlert } from 'lucide-react';
import { classNames } from '../../lib/utils';
import type { KycStatus } from '../../types';

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; bg: string; text: string; message: string }> = {
  pendente: { icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-800', message: 'Sua verificação está pendente. Envie seus documentos para começar a receber pedidos.' },
  em_analise: { icon: Clock, bg: 'bg-blue-50', text: 'text-blue-800', message: 'Seus documentos estão em análise. Prazo: até 24h úteis.' },
  aprovado: { icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-800', message: 'Verificação aprovada! Você está visível para clientes.' },
  reprovado: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-800', message: 'Verificação reprovada. Verifique seus documentos e tente novamente.' },
  suspenso: { icon: ShieldAlert, bg: 'bg-red-50', text: 'text-red-800', message: 'Sua conta está suspensa. Entre em contato com o suporte.' },
};

interface KycStatusBannerProps {
  status: KycStatus;
}

export function KycStatusBanner({ status }: KycStatusBannerProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente;
  const Icon = config.icon;

  return (
    <div className={classNames('rounded-lg p-4 flex items-start gap-3', config.bg)}>
      <Icon className={classNames('w-5 h-5 shrink-0 mt-0.5', config.text)} />
      <p className={classNames('text-sm font-medium', config.text)}>{config.message}</p>
    </div>
  );
}
