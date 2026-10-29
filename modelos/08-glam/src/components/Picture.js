import { attrs } from '../lib/html.js';

/** Imagem responsiva a partir de `{ src, srcset?, alt, width, height }`. */
export const Picture = (photo, { className, sizes = '100vw', priority = false } = {}) =>
  `<img ${attrs({
    class: className,
    src: photo.src,
    srcset: photo.srcset,
    sizes: photo.srcset ? sizes : null,
    alt: photo.alt ?? '',
    width: photo.width,
    height: photo.height,
    loading: priority ? null : 'lazy',
    fetchpriority: priority ? 'high' : null,
    decoding: 'async',
  })}>`;
