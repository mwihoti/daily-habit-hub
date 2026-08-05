/**
 * Map over items with at most `limit` promises in flight. Rejections resolve
 * to null so one bad item can't sink the batch. Preserves input order.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<(R | null)[]> {
  const results = new Array<R | null>(items.length)
  let next = 0

  async function runLane(): Promise<void> {
    while (next < items.length) {
      const i = next++
      try {
        results[i] = await fn(items[i], i)
      } catch {
        results[i] = null
      }
    }
  }

  const lanes = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, runLane)
  await Promise.all(lanes)
  return results
}
