/**
 * Video utility functions for detecting and parsing video URLs
 */

export type VideoType = 'direct' | 'youtube' | 'vimeo';

export interface VideoInfo {
  type: VideoType;
  src: string;
  youtubeId?: string;
  vimeoId?: string;
}

/**
 * Detect video type from URL
 */
export function detectVideoType(url: string): VideoType {
  if (!url) return 'direct';
  
  const lowerUrl = url.toLowerCase();
  
  // YouTube patterns
  if (
    lowerUrl.includes('youtube.com/watch') ||
    lowerUrl.includes('youtu.be/') ||
    lowerUrl.includes('youtube.com/embed/')
  ) {
    return 'youtube';
  }
  
  // Vimeo patterns
  if (lowerUrl.includes('vimeo.com/')) {
    return 'vimeo';
  }
  
  // Default to direct file
  return 'direct';
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  
  // Handle various Vimeo URL formats
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Parse video URL and extract relevant information
 */
export function parseVideoUrl(url: string): VideoInfo {
  const type = detectVideoType(url);
  
  const info: VideoInfo = {
    type,
    src: url,
  };
  
  if (type === 'youtube') {
    info.youtubeId = extractYouTubeId(url) || undefined;
  } else if (type === 'vimeo') {
    info.vimeoId = extractVimeoId(url) || undefined;
  }
  
  return info;
}

/**
 * Build YouTube embed URL with minimal chrome
 * 
 * Note: YouTube's embed player will still show title/info/share on hover.
 * This is baked into the player and cannot be removed via URL parameters alone.
 * To fully remove it, you'd need YouTube IFrame API with custom controls.
 */
export function buildYouTubeEmbedUrl(videoId: string, autoplay = false, startAt = 0): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: autoplay ? '1' : '0', // Must mute for autoplay to work in browsers
    start: startAt.toString(),
    enablejsapi: '1', // Enable JS API for future control
    rel: '0', // Don't show related videos at end
    modestbranding: '1', // Minimize YouTube logo
    iv_load_policy: '3', // Hide video annotations
    cc_load_policy: '0', // Hide closed captions by default
    fs: '1', // Allow fullscreen
    disablekb: '0', // Keep keyboard controls enabled
    controls: '1', // Show minimal player controls
    playsinline: '1', // Play inline on mobile (iOS)
    color: 'white', // Use white progress bar (less branding)
    origin: typeof window !== 'undefined' ? window.location.origin : '', // Security
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Build Vimeo embed URL with minimal chrome
 */
export function buildVimeoEmbedUrl(videoId: string, autoplay = false, startAt = 0): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    muted: autoplay ? '1' : '0', // Must mute for autoplay to work in browsers
    title: '0', // Hide title
    byline: '0', // Hide author
    portrait: '0', // Hide author thumbnail
    controls: '1', // Show controls
    playsinline: '1', // Play inline on mobile
  });
  
  if (startAt > 0) {
    params.append('t', `${startAt}s`);
  }
  
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

