/**
 * Custom Image Loader for Supabase
 * Uses Supabase's native image transformation API for mobile-optimized images
 * This avoids Vercel's image optimization service and uses Supabase's free API
 */

export default function supabaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // For Supabase images, use their native transformation API
  if (src.includes('supabase.co')) {
    const q = quality || 75;
    return `${src}?width=${width}&quality=${q}`;
  }

  // For other images (Unsplash, etc), serve directly
  return src;
}
