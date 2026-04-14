import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDateTime, formatCurrency } from '../../lib/utils';

export function ClientePedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const { data } = await supabase
        .from('orders')
        .select('*, categoria:service_categories(*)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Pedido não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/cliente" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar aos pedidos
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{order.titulo}</h1>
            {order.categoria && (
              <span className="text-sm text-primary-600 font-medium">{order.categoria.nome}</span>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-gray-600 mb-6">{order.descricao}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{order.endereco}, {order.cidade} - {order.estado}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Criado em {formatDateTime(order.criado_em)}</span>
          </div>
          {order.valor_estimado && (
            <div className="text-gray-700 font-medium">
              Valor estimado: {formatCurrency(order.valor_estimado)}
            </div>
          )}
          {order.aceito_em && (
            <div className="text-gray-500">
              Aceito em {formatDateTime(order.aceito_em)}
            </div>
          )}
          {order.concluido_em && (
            <div className="text-green-600 font-medium">
              Concluído em {formatDateTime(order.concluido_em)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
