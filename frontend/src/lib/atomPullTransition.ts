export function applyAtomPullOffset<T extends { id: string; position: [number, number, number] }>(
  atoms: T[],
  pullingAtomId: string | undefined,
  progress: number,
): T[] {
  if (!pullingAtomId || progress <= 0) return atoms;
  return atoms.map((candidate) => {
    if (candidate.id !== pullingAtomId) return candidate;
    const length = Math.hypot(...candidate.position);
    const direction: [number, number, number] = length < 0.001
      ? [0.82, 0.46, 0.34]
      : candidate.position.map((value) => value / length) as [number, number, number];
    return {
      ...candidate,
      position: candidate.position.map(
        (value, index) => value + direction[index] * 0.58 * progress,
      ) as [number, number, number],
    };
  });
}
