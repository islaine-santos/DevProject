import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProfessionalProfile, Review } from '../types';
import { StarRating } from '../components/StarRating';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PLAN_LABELS, PLAN_COLORS } from '../lib/constants';
import { formatDate, getInitials, classNames } from '../lib/utils';

export function PerfilProfissional() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!id) return;

      const { data: prof } = await supabase
        .from('professional_profiles')
        .select('*, user:users!user_id(id, nome, email, avatar_url, created_at)')
        .eq('user_id', id)
        .single();

      if (prof) {
        setProfile(prof);

        const { data: revs } = await supabase
          .from('reviews')
          .select('*, avaliador:users!avaliador_id(nome)')
          .eq('avaliado_id', id)
          .order('created_at', { ascending: false })
          .limit(20);

        setReviews(revs ?? []);
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!profile || !profile.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Profissional não encontrado.</p>
      </div>
    );
  }

  const user = profile.user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/categorias" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.nome} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-gray-500">{getInitials(user.nome)}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.nome}</h1>
              {profile.plano !== 'free' && (
                <span className={classNames(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  PLAN_COLORS[profile.plano]
                )}>
                  <CheckCircle className="w-3 h-3" />
                  {PLAN_LABELS[profile.plano]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.cidade}, {profile.estado}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {profile.avaliacao_media.toFixed(1)} ({profile.total_avaliacoes} avaliações)
              </span>
            </div>

            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.categorias.map((cat) => (
                <span key={cat} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>

            <div className="mt-3">
              {profile.disponivel ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Disponível
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Indisponível no momento</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Avaliações ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewerName =
                review.avaliador && typeof review.avaliador === 'object' && 'nome' in review.avaliador
                  ? (review.avaliador as { nome: string }).nome
                  : 'Anônimo';

              return (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{reviewerName}</span>
                    <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                  </div>
                  <StarRating rating={review.nota} size="sm" />
                  {review.comentario && (
                    <p className="text-sm text-gray-600 mt-2">{review.comentario}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
