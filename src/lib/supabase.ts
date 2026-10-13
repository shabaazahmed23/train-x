import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Browser/Client & Server compatible Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Upload an image file to Supabase Storage bucket
 * Bucket name defaults to 'gym-assets' or 'avatars'
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  filePath: string,
  file: File | Blob
) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
    console.warn('[Supabase Storage] Supabase credentials not configured in environment.');
    return { data: null, error: new Error('SUPABASE_NOT_CONFIGURED') };
  }

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    return { data: null, error };
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    data: {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    },
    error: null,
  };
}
