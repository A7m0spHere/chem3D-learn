export type Vec3 = [number, number, number];

export interface SceneLightingProps {
  ambient: number;
  mainPosition: Vec3;
  mainIntensity: number;
  secondaryPosition: Vec3;
  secondaryIntensity: number;
}

/**
 * Standard three-point lighting rig shared across the teaching cells. Each
 * cell passes its own tuned intensities/positions; values are not uniform
 * across the app, so they are not baked in as defaults.
 */
export function SceneLighting({
  ambient,
  mainPosition,
  mainIntensity,
  secondaryPosition,
  secondaryIntensity,
}: SceneLightingProps) {
  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight position={mainPosition} intensity={mainIntensity} />
      <directionalLight position={secondaryPosition} intensity={secondaryIntensity} />
    </>
  );
}
