import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Proposal } from '../types';

export function useProposals(orderId?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*, profissional:users!profissional_id(id, nome, avatar_url, genero)')
      .eq('order_id', orderId)
      .order('criado_em', { ascending: true });

    setProposals(data ?? []);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  async function sendProposal(proposal: {
    order_id: string;
    profissional_id: string;
    valor_estimado_min: number | null;
    valor_estimado_max: number | null;
    necessita_visita_tecnica: boolean;
    mensagem?: string;
  }) {
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposal)
      .select('*, profissional:users!profissional_id(id, nome, avatar_url, genero)')
      .single();

    if (!error && data) {
      setProposals((prev) => [...prev, data]);
    }
    return { data, error };
  }

  async function acceptProposal(proposalId: string, orderId: string) {
    // Accept the chosen proposal
    const { data: accepted, error: acceptErr } = await supabase
      .from('proposals')
      .update({ status: 'aceita', respondido_em: new Date().toISOString() })
      .eq('id', proposalId)
      .select('*, profissional:users!profissional_id(id, nome, avatar_url, genero)')
      .single();

    if (acceptErr) return { data: null, error: acceptErr };

    // Update the order with the accepted professional
    const { error: orderErr } = await supabase
      .from('orders')
      .update({
        profissional_id: accepted.profissional_id,
        status: 'aceito',
        aceito_em: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderErr) return { data: null, error: orderErr };

    // The DB trigger auto-rejects other pending proposals
    // Refresh local state
    await fetchProposals();
    return { data: accepted, error: null };
  }

  async function rejectProposal(proposalId: string) {
    const { data, error } = await supabase
      .from('proposals')
      .update({ status: 'recusada', respondido_em: new Date().toISOString() })
      .eq('id', proposalId)
      .select()
      .single();

    if (!error) {
      setProposals((prev) => prev.map((p) => p.id === proposalId ? { ...p, status: 'recusada' as const, respondido_em: new Date().toISOString() } : p));
    }
    return { data, error };
  }

  const pendingCount = proposals.filter((p) => p.status === 'pendente').length;

  return { proposals, loading, pendingCount, fetchProposals, sendProposal, acceptProposal, rejectProposal };
}

/** Hook for a professional to see all their proposals across orders */
export function useMyProposals(profissionalId?: string) {
  const [proposals, setProposals] = useState<(Proposal & { order?: { id: string; titulo: string; status: string; cidade: string; estado: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!profissionalId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('proposals')
        .select('*, order:orders!order_id(id, titulo, status, cidade, estado)')
        .eq('profissional_id', profissionalId)
        .order('criado_em', { ascending: false });

      setProposals(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [profissionalId]);

  return { proposals, loading };
}
