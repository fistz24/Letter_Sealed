export function nextRevealProgress(current: number, increment = 13): number {
  return Math.min(100, Math.max(0, current) + Math.max(1, increment));
}

export function isLetterComplete(progress: number): boolean {
  return progress >= 100;
}
