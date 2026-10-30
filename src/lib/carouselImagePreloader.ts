/**
 * CAROUSEL IMAGE PRELOADER & MEMORY CACHE
 * 
 * Provides instant, zero-delay image loading, in-memory caching,
 * link preloading in <head>, and decoded bitmap warming for carousel transitions.
 * Eliminates blank cards, black flashes, and loading gaps.
 */

import { CarouselSceneItem, INDIAN_LUXURY_SCENES } from './carouselTransitions';

// Global In-Memory Cache for HTMLImageElements to keep bitmaps warm in RAM/GPU
const memoryImageCache = new Map<string, HTMLImageElement>();
const preloadedUrlSet = new Set<string>();
const loadingPromises = new Map<string, Promise<boolean>>();

/**
 * Check if an image URL is fully loaded, decoded, and in memory
 */
export function isImageFullyPreloaded(url: string): boolean {
  if (!url) return false;
  if (preloadedUrlSet.has(url)) return true;
  const cached = memoryImageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    preloadedUrlSet.add(url);
    return true;
  }
  return false;
}

/**
 * Preload and decode a single image URL into memory
 */
export function preloadCarouselImage(url: string): Promise<boolean> {
  if (!url || typeof window === 'undefined') {
    return Promise.resolve(true);
  }

  // Already cached & decoded
  if (isImageFullyPreloaded(url)) {
    return Promise.resolve(true);
  }

  // Deduplicate ongoing request
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const promise = new Promise<boolean>((resolve) => {
    // Inject high-priority link preload in <head> if not already present
    try {
      const existingLink = document.querySelector(`link[rel="preload"][href="${url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        (link as any).fetchPriority = 'high';
        document.head.appendChild(link);
      }
    } catch {
      // Ignore head injection errors
    }

    const img = new Image();
    img.decoding = 'sync'; // Request synchronous decode once downloaded
    (img as any).fetchPriority = 'high';

    const handleSuccess = () => {
      memoryImageCache.set(url, img);
      preloadedUrlSet.add(url);
      loadingPromises.delete(url);
      resolve(true);
    };

    const handleError = () => {
      loadingPromises.delete(url);
      resolve(false);
    };

    img.onload = () => {
      // Decode image bitmap into GPU memory if decode API is available
      if (typeof img.decode === 'function') {
        img.decode()
          .then(handleSuccess)
          .catch(() => {
            // Even if decode() throws on older WebKit, img.complete is true
            handleSuccess();
          });
      } else {
        handleSuccess();
      }
    };

    img.onerror = handleError;
    img.src = url;

    // In case the image was already cached by browser disk cache
    if (img.complete && img.naturalWidth > 0) {
      if (typeof img.decode === 'function') {
        img.decode().then(handleSuccess).catch(handleSuccess);
      } else {
        handleSuccess();
      }
    }
  });

  loadingPromises.set(url, promise);
  return promise;
}

/**
 * Preload and warm all carousel scenes simultaneously
 */
export async function preloadAllCarouselScenes(
  scenes: CarouselSceneItem[] = INDIAN_LUXURY_SCENES
): Promise<boolean[]> {
  if (typeof window === 'undefined' || !scenes || scenes.length === 0) {
    return [];
  }

  const promises = scenes.map((scene) => {
    const primaryPromise = preloadCarouselImage(scene.image);
    // Also preload fallback URL if different
    if (scene.fallbackUrl && scene.fallbackUrl !== scene.image) {
      preloadCarouselImage(scene.fallbackUrl).catch(() => {});
    }
    return primaryPromise;
  });

  return Promise.all(promises);
}

// Immediately warm all standard Indian Luxury scenes upon script parsing
if (typeof window !== 'undefined') {
  // Use requestIdleCallback or immediate setTimeout to kick off preloading
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      preloadAllCarouselScenes(INDIAN_LUXURY_SCENES);
    }, { timeout: 1000 });
  } else {
    setTimeout(() => {
      preloadAllCarouselScenes(INDIAN_LUXURY_SCENES);
    }, 50);
  }
}
