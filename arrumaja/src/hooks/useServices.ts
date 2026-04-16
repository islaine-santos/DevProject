import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      setServices(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { services, loading };
}
