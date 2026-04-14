-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly readable" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
