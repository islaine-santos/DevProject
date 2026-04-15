import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';

export function useOrders(filters?: { clienteId?: string; profissionalId?: string; status?: OrderStatus; serviceId?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filters?.clienteId, filters?.profissionalId, filters?.status, filters?.serviceId]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('orders')
      .select('*, service:services(*), cliente:users!cliente_id(*), profissional:users!profissional_id(*)')
      .order('criado_em', { ascending: false });

    if (filters?.clienteId) {
      query = query.eq('cliente_id', filters.clienteId);
    }
    if (filters?.profissionalId) {
      query = query.eq('profissional_id', filters.profissionalId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.serviceId) {
      query = query.eq('service_id', filters.serviceId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  }

  async function createOrder(order: Omit<Order, 'id' | 'criado_em' | 'proposta_em' | 'aceito_em' | 'concluido_em' | 'expira_em' | 'status' | 'profissional_id' | 'cliente' | 'profissional' | 'service'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        status: 'aguardando_profissional',
      })
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => [data, ...prev]);
    }
    return { data, error };
  }

  async function sendProposal(orderId: string, profissionalId: string, proposal: {
    valor_estimado_min: number | null;
    valor_estimado_max: number | null;
    necessita_visita_tecnica: boolean;
  }) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        profissional_id: profissionalId,
        valor_estimado_min: proposal.valor_estimado_min,
        valor_estimado_max: proposal.valor_estimado_max,
        necessita_visita_tecnica: proposal.necessita_visita_tecnica,
        status: 'proposta_enviada',
        proposta_em: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'aguardando_profissional')
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    }
    return { data, error };
  }

  async function approveProposal(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'aceito',
        aceito_em: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'proposta_enviada')
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    }
    return { data, error };
  }

  async function rejectProposal(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        profissional_id: null,
        valor_estimado_min: null,
        valor_estimado_max: null,
        necessita_visita_tecnica: false,
        status: 'aguardando_profissional',
        proposta_em: null,
      })
      .eq('id', orderId)
      .eq('status', 'proposta_enviada')
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    }
    return { data, error };
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const updates: Record<string, unknown> = { status };
    if (status === 'concluido') {
      updates.concluido_em = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    }
    return { data, error };
  }

  async function cancelOrder(orderId: string) {
    return updateOrderStatus(orderId, 'cancelado');
  }

  return { orders, loading, error, fetchOrders, createOrder, sendProposal, approveProposal, rejectProposal, updateOrderStatus, cancelOrder };
}
