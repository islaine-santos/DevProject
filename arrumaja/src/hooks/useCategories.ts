import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ServiceCategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('service_categories')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      setCategories(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { categories, loading };
}
