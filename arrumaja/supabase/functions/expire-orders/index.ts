import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'expirado' })
    .eq('status', 'aguardando')
    .lt('expira_em', new Date().toISOString())
    .select('id');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      message: `${data?.length ?? 0} pedido(s) expirado(s).`,
      expired_ids: data?.map((o) => o.id) ?? [],
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
