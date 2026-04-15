import { Bell, CheckCheck } from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { timeAgo, classNames } from '../../lib/utils';

export function ClienteNotificacoes() {
  const { user } = useAuthContext();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
            <CheckCheck className="w-4 h-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma notificação ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {notifications.map((n) => (
            <button key={n.id} onClick={() => { if (!n.lida) markAsRead(n.id); }}
              className={classNames(
                'w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors',
                !n.lida && 'bg-primary-50/50'
              )}>
              <div className="shrink-0 mt-1">
                <div className={classNames('w-2.5 h-2.5 rounded-full', !n.lida ? 'bg-primary-600' : 'bg-gray-300')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={classNames('text-sm', !n.lida ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>{n.titulo}</p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.mensagem}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
