import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../hooks/AuthContext';
import { getInitials } from '../lib/utils';

interface AvatarUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUploaded }: AvatarUploadProps) {
  const { user } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Imagem deve ter no máximo 2MB.');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao enviar imagem.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);

    const url = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('users')
      .update({ avatar_url: url })
      .eq('id', user.id);

    onUploaded(url);
    setUploading(false);
  }

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-gray-500">
            {user ? getInitials(user.nome) : '?'}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
