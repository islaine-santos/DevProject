import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, Briefcase, Megaphone, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface Stats {
  users: number;
  orders: number;
  professionals: number;
  campaigns: number;
  kycPending: number;
  incidents: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [users, orders, professionals, campaigns, kyc, incidents] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('professionals').select('id', { count: 'exact', head: true }),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('ativa', true),
        supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('kyc_status', 'em_analise'),
        supabase.from('security_incidents').select('id', { count: 'exact', head: true }).eq('status', 'aberto'),
      ]);

      setStats({
        users: users.count ?? 0,
        orders: orders.count ?? 0,
        professionals: professionals.count ?? 0,
        campaigns: campaigns.count ?? 0,
        kycPending: kyc.count ?? 0,
        incidents: incidents.count ?? 0,
      });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Usuários', value: stats.users, icon: Users, color: 'bg-blue-100 text-blue-600', link: '/admin/profissionais' },
    { label: 'Pedidos', value: stats.orders, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', link: '/admin/pedidos' },
    { label: 'Profissionais', value: stats.professionals, icon: Briefcase, color: 'bg-green-100 text-green-600', link: '/admin/profissionais' },
    { label: 'Campanhas Ativas', value: stats.campaigns, icon: Megaphone, color: 'bg-pink-100 text-pink-600', link: '/admin/campanhas' },
    { label: 'KYC Pendentes', value: stats.kycPending, icon: ShieldCheck, color: 'bg-amber-100 text-amber-600', link: '/admin/kyc' },
    { label: 'Incidentes Abertos', value: stats.incidents, icon: AlertTriangle, color: 'bg-red-100 text-red-600', link: '/admin/incidentes' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.link}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/servicos" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">Gerenciar Serviços</h3>
          <p className="text-sm text-gray-500">Adicionar, editar ou desativar serviços da plataforma</p>
        </Link>
        <Link to="/admin/kyc" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">Revisar KYC</h3>
          <p className="text-sm text-gray-500">Aprovar ou reprovar verificações de profissionais</p>
        </Link>
      </div>
    </div>
  );
}
