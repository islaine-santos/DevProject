import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

export function useMessages(orderId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [orderId]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(id, nome, avatar_url)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    setMessages(data ?? []);
    setLoading(false);
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:users!sender_id(id, nome, avatar_url)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  async function sendMessage(senderId: string, conteudo: string) {
    const { error } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: senderId,
      conteudo,
    });
    return { error };
  }

  async function markAsRead(messageIds: string[]) {
    if (messageIds.length === 0) return;
    await supabase
      .from('messages')
      .update({ lida: true })
      .in('id', messageIds);
  }

  return { messages, loading, sendMessage, markAsRead };
}
