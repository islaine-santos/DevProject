import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCurrency } from '../../lib/utils';

interface WalletRow {
  id: string;
  saldo: number;
  professional_id: string;
  professional?: { user?: { nome: string; email: string } };
}

export function AdminWallets() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('wallet')
        .select('*, professional:professionals(user:users(nome, email))')
        .order('saldo', { ascending: false });
      setWallets((data as WalletRow[]) ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const totalSaldo = wallets.reduce((sum, w) => sum + w.saldo, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total de Wallets</p>
          <p className="text-2xl font-bold text-gray-900">{wallets.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Saldo Total</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSaldo)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Saldo Médio</p>
          <p className="text-2xl font-bold text-gray-900">{wallets.length > 0 ? formatCurrency(totalSaldo / wallets.length) : 'R$ 0,00'}</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Profissional</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wallets.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {(w.professional as Record<string, unknown>)?.user ? ((w.professional as Record<string, unknown>).user as Record<string, string>).nome : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(w.professional as Record<string, unknown>)?.user ? ((w.professional as Record<string, unknown>).user as Record<string, string>).email : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(w.saldo)}</td>
                  </tr>
                ))}
                {wallets.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Nenhuma wallet encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
