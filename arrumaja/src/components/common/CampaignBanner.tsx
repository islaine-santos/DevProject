import { Heart } from 'lucide-react';
import type { Campaign } from '../../types';

interface CampaignBannerProps {
  campaign: Campaign;
}

export function CampaignBanner({ campaign }: CampaignBannerProps) {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 flex items-center gap-4">
      <Heart className="w-8 h-8 text-pink-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm">{campaign.nome}</h3>
        <p className="text-xs text-gray-500 truncate">{campaign.descricao}</p>
        {campaign.ong_nome && <p className="text-xs text-pink-600 mt-0.5">Apoiando: {campaign.ong_nome}</p>}
      </div>
    </div>
  );
}
