/** Share decoded assets across setup visits; failed or stalled loads remain retryable. */
const decodedImages = new Map<string, Promise<void>>();
const readyImages = new Set<string>();
/** Synchronous readiness prevents a cached scene from flashing its loading dialog. */
export const isBattleImageReady = (src: string): boolean => readyImages.has(src);
export function preloadBattleImage(src: string): Promise<void> {
  const cached = decodedImages.get(src);
  if (cached) return cached;
  const pending = new Promise<void>((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      finish(new Error('Battle image timed out'));
    }, 12000);
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error); else { readyImages.add(src); resolve(); }
    };
    image.onload = () => image.decode().then(() => finish(), finish);
    image.onerror = () => finish(new Error('Battle image unavailable'));
    image.src = src;
  }).catch(error => { decodedImages.delete(src); throw error; });
  decodedImages.set(src, pending);
  return pending;
}

/** Bound simultaneous image decodes on mobile; a battle still has one entry gate. */
export async function preloadBattleImages(sources: readonly string[]) {
  const queue = [...new Set(sources)];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (cursor < queue.length) await preloadBattleImage(queue[cursor++]);
  }));
}
