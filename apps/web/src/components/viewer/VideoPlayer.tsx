'use client';

import { useEffect, useRef } from 'react';
import type { VideoEl } from '@deck/shared';
import { buildYouTubeEmbedUrl, buildVimeoEmbedUrl } from '@/lib/utils/video';

interface VideoPlayerProps {
  element: VideoEl;
  isVisible: boolean;
  onVideoEnd?: () => void;
}

export function VideoPlayer({ element, isVisible, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle direct video playback
  useEffect(() => {
    if (element.videoType !== 'direct') return;
    
    const video = videoRef.current;
    if (!video) return;

    // Handle video end event
    const handleEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [element.videoType, onVideoEnd]);

  useEffect(() => {
    if (element.videoType !== 'direct') return;
    
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      // Auto-play when visible
      video.play().catch(err => {
        console.warn('[VideoPlayer] Autoplay failed:', err);
      });
    } else {
      // Pause when not visible
      video.pause();
      video.currentTime = element.startAt || 0;
    }
  }, [isVisible, element.startAt, element.videoType]);

  // Render YouTube embed
  if (element.videoType === 'youtube' && element.youtubeId) {
    const embedUrl = buildYouTubeEmbedUrl(
      element.youtubeId,
      isVisible,
      element.startAt || 0
    );
    
    return (
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      />
    );
  }

  // Render Vimeo embed
  if (element.videoType === 'vimeo' && element.vimeoId) {
    const embedUrl = buildVimeoEmbedUrl(
      element.vimeoId,
      isVisible,
      element.startAt || 0
    );
    
    return (
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video player"
      />
    );
  }

  // Render direct video file (MP4, WebM, etc.)
  return (
    <video
      ref={videoRef}
      src={element.src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
      loop={element.loop}
      playsInline
      muted // Muted for autoplay
    />
  );
}

