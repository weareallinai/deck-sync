'use client';

import { useEffect, useRef } from 'react';
import type { VideoEl } from '@deck/shared';

interface VideoPlayerProps {
  element: VideoEl;
  isVisible: boolean;
  onVideoEnd?: () => void;
}

export function VideoPlayer({ element, isVisible, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle video end event
    const handleEnded = () => {
      console.log('[VideoPlayer] Video ended');
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [onVideoEnd]);

  useEffect(() => {
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
  }, [isVisible, element.startAt]);

  // Handle YouTube/Vimeo embeds
  if (typeof element.src === 'object') {
    const { youtubeId, vimeoId } = element.src;
    
    if (youtubeId) {
      const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=${isVisible ? 1 : 0}&rel=0`;
      return (
        <iframe
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (vimeoId) {
      const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${isVisible ? 1 : 0}`;
      return (
        <iframe
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
  }

  // Native video element for MP4/WebM
  return (
    <video
      ref={videoRef}
      src={element.src as string}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
      loop={element.loop}
      playsInline
      muted={false}
    />
  );
}

