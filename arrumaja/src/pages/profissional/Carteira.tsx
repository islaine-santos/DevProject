import { useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, MinusCircle } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useProfessional } from '../../hooks/useProfessional';
import { useWallet } from '../../hooks/useWallet';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { WALLET_MIN_WITHDRAW } from '../../lib/constants';

const TRANSACTION_ICONS = {
  credito: ArrowDownCircle,
  debito: ArrowUpCircle,
  saque: MinusCircle,
};

const TRANSACTION_COLORS = {
  credito: 'text-green-600',
  debito: 'text-red-600',
  saque: 'text-orange-600',
};

const TRANSACTION_LABELS = {
  credito: 'Crédito',
  debito: 'Débito',
  saque: 'Saque',
};

export function ProfissionalCarteira() {
  const { user } = useAuthContext();
  const { professional, loading: loadingProfessional } = useProfessional(user?.id);
  const { wallet, transactions, loading: loadingWallet, requestWithdraw } = useWallet(professional?.id);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loading = loadingProfessional || loadingWallet;

  async function handleWithdraw() {
    if (!wallet) return;
    setWithdrawLoading(true);
    setMessage('');

    const { error } = await requestWithdraw(wallet.saldo);

    if (error) {
      setMessage('Erro ao solicitar saque. Tente novamente.');
    } else {
      setMessage('Saque solicitado com sucesso! O valor será transferido em até 3 dias úteis.');
    }
    setWithdrawLoading(false);
  }

  if (loading) return <LoadingSpinner />;

  const saldo = wallet?.saldo ?? 0;
  const canWithdraw = saldo >= WALLET_MIN_WITHDRAW;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minha Carteira</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 opacity-80" />
          <span className="text-sm font-medium opacity-80">Saldo disponível</span>
        </div>
        <p className="text-4xl font-bold mb-6">{formatCurrency(saldo)}</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw || withdrawLoading}
            className="bg-white text-primary-700 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawLoading ? 'Solicitando...' : 'Solicitar Saque'}
          </button>
          {!canWithdraw && (
            <span className="text-sm opacity-80">
              Mínimo para saque: {formatCurrency(WALLET_MIN_WITHDRAW)}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`text-sm p-4 rounded-lg mb-6 ${
            message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Transações</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">Nenhuma transação realizada ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const Icon = TRANSACTION_ICONS[tx.tipo];
              const color = TRANSACTION_COLORS[tx.tipo];
              const label = TRANSACTION_LABELS[tx.tipo];
              const isPositive = tx.tipo === 'credito';

              return (
                <li key={tx.id} className="px-6 py-4 flex items-center gap-4">
                  <div className={`shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.descricao || label}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(tx.created_at)}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : '-'} {formatCurrency(tx.valor)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
