export function pickOne<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}
