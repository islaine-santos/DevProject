import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ProposalFormProps {
  orderId: string;
  profissionalId: string;
  onSubmit: (proposal: {
    order_id: string;
    profissional_id: string;
    valor_estimado_min: number | null;
    valor_estimado_max: number | null;
    necessita_visita_tecnica: boolean;
    mensagem?: string;
  }) => Promise<{ error: unknown }>;
  disabled?: boolean;
}

export function ProposalForm({ orderId, profissionalId, onSubmit, disabled }: ProposalFormProps) {
  const [valorMin, setValorMin] = useState('');
  const [valorMax, setValorMax] = useState('');
  const [necessitaVisita, setNecessitaVisita] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!necessitaVisita) {
      const min = parseFloat(valorMin);
      const max = parseFloat(valorMax);
      if (isNaN(min) || min <= 0) {
        setError('Informe um valor mínimo válido.');
        return;
      }
      if (isNaN(max) || max <= 0) {
        setError('Informe um valor máximo válido.');
        return;
      }
      if (max < min) {
        setError('O valor máximo deve ser maior ou igual ao mínimo.');
        return;
      }
    }

    setSubmitting(true);
    const { error: submitErr } = await onSubmit({
      order_id: orderId,
      profissional_id: profissionalId,
      valor_estimado_min: necessitaVisita ? null : parseFloat(valorMin),
      valor_estimado_max: necessitaVisita ? null : parseFloat(valorMax),
      necessita_visita_tecnica: necessitaVisita,
      mensagem: mensagem || undefined,
    });

    if (submitErr) {
      setError('Erro ao enviar proposta. Verifique se o pedido ainda aceita propostas.');
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-6 text-center">
        <p className="text-green-700 font-medium">Proposta enviada com sucesso!</p>
        <p className="text-green-600 text-sm mt-1">O cliente será notificado e poderá aceitar ou recusar.</p>
      </div>
    );
  }

  return (
    <div className="border border-primary-200 bg-primary-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-primary-600" />
        Enviar Proposta
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            id="necessitaVisita"
            type="checkbox"
            checked={necessitaVisita}
            onChange={(e) => setNecessitaVisita(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="necessitaVisita" className="text-sm text-gray-700">
            Necessita visita técnica antes do serviço
          </label>
        </div>

        {!necessitaVisita && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="valorMin" className="block text-sm font-medium text-gray-700 mb-1">
                Valor mínimo (R$)
              </label>
              <input
                id="valorMin"
                type="number"
                step="0.01"
                min="0"
                value={valorMin}
                onChange={(e) => setValorMin(e.target.value)}
                placeholder="Ex: 150.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="valorMax" className="block text-sm font-medium text-gray-700 mb-1">
                Valor máximo (R$)
              </label>
              <input
                id="valorMax"
                type="number"
                step="0.01"
                min="0"
                value={valorMax}
                onChange={(e) => setValorMax(e.target.value)}
                placeholder="Ex: 300.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem (opcional)
          </label>
          <textarea
            id="mensagem"
            rows={3}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Descreva sua experiência com esse tipo de serviço..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting || disabled}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar Proposta'}
        </button>
      </form>
    </div>
  );
}
