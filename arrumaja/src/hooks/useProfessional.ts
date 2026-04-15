import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Professional } from '../types';

export function useProfessional(userId?: string) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfessional = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('professionals')
      .select('*, user:users!user_id(*), services:professional_services(service:services(*))')
      .eq('user_id', userId)
      .single();

    setProfessional(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfessional();
  }, [fetchProfessional]);

  async function updateProfile(updates: Partial<Pick<Professional, 'bio' | 'cidade' | 'estado' | 'regiao_atuacao' | 'disponivel'>>) {
    if (!professional) return { error: new Error('No professional profile') };
    const { data, error } = await supabase
      .from('professionals')
      .update(updates)
      .eq('id', professional.id)
      .select()
      .single();

    if (!error && data) {
      setProfessional((prev) => prev ? { ...prev, ...data } : data);
    }
    return { data, error };
  }

  async function submitKycDocs(docs: Record<string, string>) {
    if (!professional) return { error: new Error('No professional profile') };
    const { data, error } = await supabase
      .from('professionals')
      .update({ kyc_docs: docs, kyc_status: 'em_analise' })
      .eq('id', professional.id)
      .select()
      .single();

    if (!error && data) {
      setProfessional((prev) => prev ? { ...prev, ...data } : data);
    }
    return { data, error };
  }

  return { professional, loading, fetchProfessional, updateProfile, submitKycDocs };
}

export function useProfessionals(filters?: { serviceId?: string; cidade?: string; estado?: string; selo?: string }) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from('professionals')
        .select('*, user:users!user_id(*), services:professional_services(service:services(*))')
        .eq('ativo', true)
        .eq('disponivel', true)
        .order('avaliacao_media', { ascending: false });

      if (filters?.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters?.cidade) {
        query = query.ilike('cidade', `%${filters.cidade}%`);
      }
      if (filters?.selo) {
        query = query.eq('selo', filters.selo);
      }

      const { data } = await query;

      let result = data ?? [];

      // Filter by service on client-side (join table)
      if (filters?.serviceId) {
        result = result.filter((p) => {
          const svcList = (p as Record<string, unknown>).services as Array<{ service: { id: string } }> | undefined;
          return svcList?.some((ps) => ps.service?.id === filters.serviceId);
        });
      }

      setProfessionals(result);
      setLoading(false);
    }
    fetch();
  }, [filters?.serviceId, filters?.cidade, filters?.estado, filters?.selo]);

  return { professionals, loading };
}
