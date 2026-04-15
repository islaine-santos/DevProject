import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Wallet, WalletTransaction } from '../types';

export function useWallet(professionalId?: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: walletData } = await supabase
      .from('wallet')
      .select('*')
      .eq('professional_id', professionalId)
      .single();

    setWallet(walletData);

    if (walletData) {
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(txData ?? []);
    }

    setLoading(false);
  }, [professionalId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  async function requestWithdraw(valor: number) {
    if (!wallet) return { error: new Error('Sem carteira') };
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        tipo: 'saque',
        valor,
        descricao: 'Solicitação de saque',
      })
      .select()
      .single();

    if (!error) {
      await supabase
        .from('wallet')
        .update({ saldo: wallet.saldo - valor })
        .eq('id', wallet.id);

      setWallet((prev) => prev ? { ...prev, saldo: prev.saldo - valor } : prev);
      setTransactions((prev) => data ? [data, ...prev] : prev);
    }
    return { data, error };
  }

  return { wallet, transactions, loading, fetchWallet, requestWithdraw };
}
