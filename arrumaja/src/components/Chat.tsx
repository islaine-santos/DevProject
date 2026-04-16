import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useAuthContext } from '../hooks/AuthContext';
import { timeAgo, getInitials, classNames } from '../lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatProps {
  orderId: string;
}

export function Chat({ orderId }: ChatProps) {
  const { user } = useAuthContext();
  const { messages, loading, sendMessage, markAsRead } = useMessages(orderId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const unread = messages
      .filter((m) => m.sender_id !== user.id && !m.lida)
      .map((m) => m.id);
    markAsRead(unread);
  }, [messages, user]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    await sendMessage(user.id, text.trim());
    setText('');
    setSending(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-xl border border-gray-200">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            Nenhuma mensagem ainda. Inicie a conversa!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const senderName =
              msg.sender && typeof msg.sender === 'object' && 'nome' in msg.sender
                ? (msg.sender as { nome: string }).nome
                : 'Usuário';

            return (
              <div
                key={msg.id}
                className={classNames(
                  'flex gap-2',
                  isOwn && 'flex-row-reverse'
                )}
              >
                <div
                  className={classNames(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    isOwn
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {getInitials(senderName)}
                </div>
                <div
                  className={classNames(
                    'max-w-[70%] rounded-2xl px-4 py-2',
                    isOwn
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.conteudo}</p>
                  <p
                    className={classNames(
                      'text-[10px] mt-1',
                      isOwn ? 'text-primary-200' : 'text-gray-400'
                    )}
                  >
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-primary-600 text-white p-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
