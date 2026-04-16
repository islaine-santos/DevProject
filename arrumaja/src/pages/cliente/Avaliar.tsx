import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/AuthContext';
import { ReviewForm } from '../../components/ReviewForm';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Order } from '../../types';

export function ClienteAvaliar() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    async function fetch() {
      if (!id || !user) return;
      const { data } = await supabase
        .from('orders')
        .select('*, service:services(*), profissional:users!profissional_id(*)')
        .eq('id', id)
        .single();
      setOrder(data);

      if (data) {
        const { data: review } = await supabase
          .from('reviews')
          .select('id')
          .eq('order_id', id)
          .eq('avaliador_id', user.id)
          .maybeSingle();
        setHasReviewed(!!review);
      }
      setLoading(false);
    }
    fetch();
  }, [id, user]);

  if (loading) return <LoadingSpinner />;
  if (!order || order.status !== 'concluido' || !order.profissional_id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Pedido não disponível para avaliação.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/cliente/pedido/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar ao pedido
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900">Avaliar Profissional</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {order.titulo} — {order.profissional?.nome}
        </p>

        {hasReviewed ? (
          <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl">
            Você já avaliou este serviço. Obrigado!
          </div>
        ) : (
          <ReviewForm
            orderId={order.id}
            avaliadoId={order.profissional_id}
            onSubmitted={() => {
              setHasReviewed(true);
              setTimeout(() => navigate(`/cliente/pedido/${id}`), 2000);
            }}
          />
        )}
      </div>
    </div>
  );
}
