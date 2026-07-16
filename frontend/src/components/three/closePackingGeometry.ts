export type ClosePackedLayerId = "A" | "B" | "C";

export type ClosePackedPatchAtom = {
  id: string;
  position: [number, number, number];
  q: number;
  r: number;
};

export function createClosePackingGeometry(nearestDistance: number) {
  const basisA: [number, number] = [nearestDistance, 0];
  const basisB: [number, number] = [
    nearestDistance / 2,
    (Math.sqrt(3) * nearestDistance) / 2,
  ];
  const layerGap = Math.sqrt(2 / 3) * nearestDistance;
  const layerOffsets: Record<ClosePackedLayerId, [number, number]> = {
    A: [0, 0],
    B: [(basisA[0] + basisB[0]) / 3, (basisA[1] + basisB[1]) / 3],
    C: [(2 * (basisA[0] + basisB[0])) / 3, (2 * (basisA[1] + basisB[1])) / 3],
  };

  function generateHexPatch(radius: number): ClosePackedPatchAtom[] {
    const atoms: ClosePackedPatchAtom[] = [];
    for (let q = -radius; q <= radius; q += 1) {
      const rMin = Math.max(-radius, -q - radius);
      const rMax = Math.min(radius, -q + radius);
      for (let r = rMin; r <= rMax; r += 1) {
        atoms.push({
          id: `${q}-${r}`,
          position: [
            q * basisA[0] + r * basisB[0],
            0,
            q * basisA[1] + r * basisB[1],
          ],
          q,
          r,
        });
      }
    }
    return atoms;
  }

  return {
    basisA,
    basisB,
    generateHexPatch,
    layerGap,
    layerOffsets,
    nearestDistance,
  };
}

export function getAxialHexDistance(q: number, r: number) {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
}
