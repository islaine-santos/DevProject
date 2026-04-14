import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';

export function useOrders(filters?: { clienteId?: string; profissionalId?: string; status?: OrderStatus; categoriaId?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filters?.clienteId, filters?.profissionalId, filters?.status, filters?.categoriaId]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('orders')
      .select('*, categoria:service_categories(*)')
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
    if (filters?.categoriaId) {
      query = query.eq('categoria_id', filters.categoriaId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  }

  async function createOrder(order: Omit<Order, 'id' | 'criado_em' | 'aceito_em' | 'concluido_em' | 'expira_em' | 'status' | 'profissional_id' | 'cliente' | 'profissional' | 'categoria'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        status: 'aguardando',
      })
      .select()
      .single();

    if (!error && data) {
      setOrders((prev) => [data, ...prev]);
    }
    return { data, error };
  }

  async function acceptOrder(orderId: string, profissionalId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        profissional_id: profissionalId,
        status: 'aceito',
        aceito_em: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'aguardando')
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

  return { orders, loading, error, fetchOrders, createOrder, acceptOrder, updateOrderStatus };
}
