import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../hooks/AuthContext';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  orderId: string;
  avaliadoId: string;
  onSubmitted: () => void;
}

export function ReviewForm({ orderId, avaliadoId, onSubmitted }: ReviewFormProps) {
  const { user } = useAuthContext();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || nota === 0) return;
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('reviews').insert({
      order_id: orderId,
      avaliador_id: user.id,
      avaliado_id: avaliadoId,
      nota,
      comentario,
    });

    if (err) {
      setError(err.code === '23505' ? 'Você já avaliou este pedido.' : 'Erro ao enviar avaliação.');
      setSubmitting(false);
    } else {
      onSubmitted();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nota</label>
        <StarRating rating={nota} size="md" interactive onChange={setNota} />
        {nota === 0 && (
          <p className="text-xs text-gray-400 mt-1">Clique nas estrelas para avaliar</p>
        )}
      </div>

      <div>
        <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
          Comentário (opcional)
        </label>
        <textarea
          id="comentario"
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          placeholder="Como foi sua experiência?"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || nota === 0}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </form>
  );
}
