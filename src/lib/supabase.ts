import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase credentials are configured
export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

// Supabase client instance (or null dummy if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Uploads a base64 or blob photo to Supabase Storage private bucket 'attendance-photos'
 * Returns the signed URL (or base64 fallback in demo mode).
 */
export async function uploadAttendancePhoto(
  base64DataUrl: string,
  fileName: string,
  bucketName: string = 'attendance-photos'
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    // In demo/local persistence mode, store as data URL directly
    return base64DataUrl;
  }

  try {
    // Convert base64 to Blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();

    const filePath = `records/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to local data URL:', uploadError);
      return base64DataUrl;
    }

    // Since the bucket is private per prompt specifications:
    // Generate signed URL valid for 24 hours (86400 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 86400);

    if (signedError || !signedData?.signedUrl) {
      console.warn('Failed to create signed URL, fallback:', signedError);
      return base64DataUrl;
    }

    return signedData.signedUrl;
  } catch (err) {
    console.error('Failed to upload photo to Supabase:', err);
    return base64DataUrl;
  }
}
