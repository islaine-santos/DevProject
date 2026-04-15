import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Professional } from '../../types';
import { StarRating } from '../StarRating';
import { SeloBadge } from './SeloBadge';
import { PLAN_LABELS, PLAN_COLORS } from '../../lib/constants';
import { getInitials, classNames } from '../../lib/utils';

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional: prof }: ProfessionalCardProps) {
  const userName = prof.user?.nome ?? 'Profissional';
  const userAvatar = prof.user?.avatar_url ?? null;

  return (
    <Link to={`/profissional/${prof.user_id}`} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex gap-4">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-gray-500">{getInitials(userName)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
          <SeloBadge selo={prof.selo} />
          {prof.plano !== 'free' && (
            <span className={classNames('px-2 py-0.5 rounded-full text-[10px] font-medium', PLAN_COLORS[prof.plano])}>
              {PLAN_LABELS[prof.plano]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{prof.cidade}, {prof.estado}</span>
          <span className="flex items-center gap-1">
            <StarRating rating={prof.avaliacao_media} size="sm" />
            <span className="text-xs">({prof.total_avaliacoes})</span>
          </span>
        </div>
        {prof.services && prof.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {prof.services.slice(0, 4).map((s) => (
              <span key={s.id} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{s.nome}</span>
            ))}
            {prof.services.length > 4 && <span className="text-[10px] text-gray-400">+{prof.services.length - 4}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
