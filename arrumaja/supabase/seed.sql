-- ArrumaJá: Seed data — Services + Campaigns

INSERT INTO public.services (nome, slug, icone, descricao) VALUES
  ('Eletricista', 'eletricista', 'zap', 'Instalações elétricas, troca de tomadas, disjuntores, fiação e reparos elétricos.'),
  ('Encanador', 'encanador', 'droplets', 'Reparos hidráulicos, desentupimento, instalação de torneiras e chuveiros.'),
  ('Faxineira', 'faxineira', 'sparkles', 'Limpeza residencial, limpeza pós-obra, higienização profunda.'),
  ('Pintor', 'pintor', 'paintbrush', 'Pintura interna e externa, textura, grafiato e acabamentos.'),
  ('Jardineiro', 'jardineiro', 'tree-pine', 'Manutenção de jardins, poda, plantio e paisagismo.'),
  ('Marceneiro', 'marceneiro', 'hammer', 'Móveis sob medida, reparos em madeira, instalação de portas e armários.'),
  ('Pedreiro', 'pedreiro', 'hard-hat', 'Construção, reformas, revestimentos, contra-piso e alvenaria.'),
  ('Serralheiro', 'serralheiro', 'shield', 'Portões, grades, janelas de alumínio, soldas e estruturas metálicas.'),
  ('Ar Condicionado', 'ar_condicionado', 'wind', 'Instalação, manutenção, limpeza e conserto de ar condicionado.'),
  ('Mudança', 'mudanca', 'truck', 'Transporte de mudanças residenciais e comerciais, carreto e frete.')
ON CONFLICT (slug) DO NOTHING;

-- Sample campaigns
INSERT INTO public.campaigns (nome, slug, descricao, ong_nome, ativa) VALUES
  ('Outubro Rosa', 'outubro-rosa', 'Campanha de conscientização sobre câncer de mama', 'Instituto Rosa', false),
  ('Novembro Azul', 'novembro-azul', 'Campanha de conscientização sobre câncer de próstata', 'Instituto Azul', false),
  ('Setembro Amarelo', 'setembro-amarelo', 'Campanha de prevenção ao suicídio', 'CVV', false)
ON CONFLICT (slug) DO NOTHING;
