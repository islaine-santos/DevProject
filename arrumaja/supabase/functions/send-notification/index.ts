import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
}

Deno.serve(async (req) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload: WebhookPayload = await req.json();
  const { record, old_record } = payload;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const newStatus = record.status as string;
  const oldStatus = old_record?.status as string | undefined;

  // Only send notifications on status changes we care about
  if (newStatus === oldStatus) {
    return new Response(JSON.stringify({ message: 'No status change' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let recipientId: string | null = null;
  let subject = '';
  let body = '';
  const titulo = record.titulo as string;

  if (newStatus === 'aceito' && oldStatus === 'aguardando') {
    // Notify client that a professional accepted
    recipientId = record.cliente_id as string;
    subject = `Pedido aceito: ${titulo}`;
    body = `Boas notícias! Um profissional aceitou seu pedido "${titulo}". Acesse a plataforma para ver os detalhes e iniciar o chat.`;
  } else if (newStatus === 'concluido') {
    // Notify client that service is complete
    recipientId = record.cliente_id as string;
    subject = `Serviço concluído: ${titulo}`;
    body = `O serviço "${titulo}" foi marcado como concluído. Acesse a plataforma para avaliar o profissional.`;
  } else if (newStatus === 'em_andamento') {
    // Notify client that service started
    recipientId = record.cliente_id as string;
    subject = `Serviço iniciado: ${titulo}`;
    body = `O profissional iniciou o serviço "${titulo}". Acompanhe pelo chat na plataforma.`;
  }

  if (!recipientId) {
    return new Response(JSON.stringify({ message: 'No notification needed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch recipient email
  const { data: user } = await supabase
    .from('users')
    .select('email, nome')
    .eq('id', recipientId)
    .single();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Send email via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'ArrumaJá <noreply@arrumaja.com.br>',
      to: [user.email],
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">ArrumaJá</h2>
          <p>Olá, ${user.nome}!</p>
          <p>${body}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">
            Este e-mail foi enviado automaticamente pela plataforma ArrumaJá.
          </p>
        </div>
      `,
    }),
  });

  const emailResult = await emailRes.json();

  return new Response(JSON.stringify({ message: 'Notification sent', result: emailResult }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
