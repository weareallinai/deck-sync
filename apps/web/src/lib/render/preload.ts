import type { Slide, ImageEl, VideoEl } from '@deck/shared';

export class PreloadManager {
  private preloadedAssets = new Set<string>();
  private preloadQueue: string[] = [];

  async preloadSlide(slide: Slide): Promise<void> {
    const assets = this.extractAssets(slide);
    const newAssets = assets.filter((url) => !this.preloadedAssets.has(url));

    await Promise.allSettled(
      newAssets.map((url) => this.preloadAsset(url))
    );
  }

  private extractAssets(slide: Slide): string[] {
    const assets: string[] = [];

    // Background image
    if (slide.bg.type === 'image') {
      assets.push(slide.bg.value);
    }

    // Element assets
    for (const el of slide.elements) {
      if (el.type === 'image') {
        assets.push((el as ImageEl).src);
      } else if (el.type === 'video') {
        const videoEl = el as VideoEl;
        if (typeof videoEl.src === 'string') {
          assets.push(videoEl.src);
        }
      }
    }

    return assets;
  }

  private async preloadAsset(url: string): Promise<void> {
    if (this.preloadedAssets.has(url)) {
      return;
    }

    try {
      // Determine asset type from URL
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

      if (isVideo) {
        await this.preloadVideo(url);
      } else {
        await this.preloadImage(url);
      }

      this.preloadedAssets.add(url);
    } catch (error) {
      console.warn(`[PreloadManager] Failed to preload ${url}:`, error);
    }
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  private preloadVideo(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.onloadedmetadata = () => resolve();
      video.onerror = reject;
      video.src = url;
    });
  }

  clear() {
    this.preloadedAssets.clear();
    this.preloadQueue = [];
  }
}

export const preloadManager = new PreloadManager();

