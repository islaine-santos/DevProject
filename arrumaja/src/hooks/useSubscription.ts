import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SubscriptionB2B, SubscriptionB2C } from '../types';

export function useSubscriptionB2B(professionalId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionB2B | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!professionalId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('subscriptions_b2b')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(data);
      setLoading(false);
    }
    fetch();
  }, [professionalId]);

  async function subscribe(plano: 'boost' | 'pro_boost', pagamentoVia: 'stripe' | 'wallet') {
    if (!professionalId) return { error: new Error('Sem profissional') };

    const { data, error } = await supabase
      .from('subscriptions_b2b')
      .insert({
        professional_id: professionalId,
        plano,
        status: 'ativo',
        inicio: new Date().toISOString(),
        pagamento_via: pagamentoVia,
      })
      .select()
      .single();

    if (!error && data) {
      setSubscription(data);
      // Update professional plan
      await supabase
        .from('professionals')
        .update({ plano })
        .eq('id', professionalId);
    }
    return { data, error };
  }

  async function cancel() {
    if (!subscription) return { error: new Error('Sem assinatura') };
    const { error } = await supabase
      .from('subscriptions_b2b')
      .update({ status: 'cancelado', fim: new Date().toISOString() })
      .eq('id', subscription.id);

    if (!error) {
      setSubscription(null);
    }
    return { error };
  }

  return { subscription, loading, subscribe, cancel };
}

export function useSubscriptionB2C(userId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionB2C | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('subscriptions_b2c')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(data);
      setLoading(false);
    }
    fetch();
  }, [userId]);

  async function subscribe() {
    if (!userId) return { error: new Error('Sem usuário') };

    const { data, error } = await supabase
      .from('subscriptions_b2c')
      .insert({
        user_id: userId,
        status: 'ativo',
        inicio: new Date().toISOString(),
        meses_ativos: 0,
        visita_gratuita_disponivel: false,
        cashback_acumulado: 0,
      })
      .select()
      .single();

    if (!error && data) {
      setSubscription(data);
    }
    return { data, error };
  }

  async function cancel() {
    if (!subscription) return { error: new Error('Sem assinatura') };
    const { error } = await supabase
      .from('subscriptions_b2c')
      .update({ status: 'cancelado', fim: new Date().toISOString() })
      .eq('id', subscription.id);

    if (!error) {
      setSubscription(null);
    }
    return { error };
  }

  return { subscription, loading, subscribe, cancel };
}
