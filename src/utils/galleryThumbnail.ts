import { GalleryItem } from '../types';

/**
 * Resolves the best image URL to use for a *small* on-screen slot (a grid
 * card, a mini preview strip, a thumbnail-bar dot) for a gallery item.
 *
 * PERFORMANCE (2026-09-16): gallery photos are uploaded at up to 1200px,
 * but several places on the site show them as small as 26-36px. Before
 * this, every one of those small slots still downloaded the full
 * original file. New uploads now also get a small (<=320px) thumbnail
 * generated alongside the original (see processGalleryImageFile in
 * AdminModal.tsx); this helper prefers that thumbnail and falls back to
 * the full image for older items that don't have one yet, so nothing
 * breaks for existing gallery data.
 */
export function getGalleryThumbnail(item: Pick<GalleryItem, 'imageUrl' | 'images' | 'thumbnailUrl' | 'thumbnails'>, index: number = 0): string {
  const images = (item.images && item.images.length > 0) ? item.images : (item.imageUrl ? [item.imageUrl] : []);

  if (item.thumbnails && item.thumbnails[index]) {
    return item.thumbnails[index];
  }
  if (index === 0 && item.thumbnailUrl) {
    return item.thumbnailUrl;
  }
  return images[index] || item.imageUrl || '';
}
