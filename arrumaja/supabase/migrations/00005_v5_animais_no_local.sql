-- ArrumaJá v5: Add animais_no_local field to orders
-- Clients can indicate if there are pets at the service location.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS animais_no_local BOOLEAN DEFAULT false;
