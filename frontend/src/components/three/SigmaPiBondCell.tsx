import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { type Group } from "three";
import { CameraRig } from "@/components/three/CameraRig";
import {
  AxisTriad,
  GuideCylinder,
  POrbitalPair,
  PiCloudBand,
  SOrbitalCloud,
} from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { teachingSceneLabelClass } from "@/components/three/teachingLabelStyles";
import { SceneLighting } from "@/components/three/SceneLighting";
import { getOrbitalBondModeInfo } from "@/data/sigmaPiBonds";
import type { OrbitalBondLessonType, PiBondMode, SigmaBondMode } from "@/data/sigmaPiBonds";

type Vec3 = [number, number, number];

type SigmaPiBondCellProps =
  | {
      lessonType: "sigma";
      mode: SigmaBondMode;
      loading?: boolean;
      showLabels?: boolean;
    }
  | {
      lessonType: "pi";
      mode: PiBondMode;
      loading?: boolean;
      playing?: boolean;
      showLabels?: boolean;
    };

export function SigmaPiBondCell(props: SigmaPiBondCellProps) {
  const modeInfo =
    props.lessonType === "sigma"
      ? getOrbitalBondModeInfo("sigma", props.mode)
      : getOrbitalBondModeInfo("pi", props.mode);
  const isPiPlaying = props.lessonType === "pi" ? props.playing ?? false : false;

  return (
    <ThreeViewerFrame
      loading={props.loading ?? false}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId={`${props.lessonType}-bond-orbitals-canvas`}
      summary={modeInfo.viewerSummary}
      title={modeInfo.viewerTitle}
      viewerTestId={`${props.lessonType}-bond-orbitals-viewer`}
    >
      <Canvas
        camera={{ position: getCameraPosition(props.lessonType), fov: 42 }}
        frameloop={isPiPlaying ? "always" : "demand"}
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <CameraRig
          fov={42}
          position={getCameraPosition(props.lessonType)}
          resetKey={`${props.lessonType}-${props.mode}`}
        />
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting ambient={0.74} mainIntensity={1.28} mainPosition={[3.4, 4.6, 4.2]} secondaryIntensity={0.34} secondaryPosition={[-3.2, -2.4, 2.6]} />
        <group rotation={[-0.18, 0.1, 0]} scale={1.12}>
          <CoordinateAxes showLabels={props.showLabels ?? false} />
          {props.lessonType === "sigma" ? (
            <SigmaBondScene mode={props.mode} showLabels={props.showLabels ?? false} />
          ) : (
            <PiBondScene
              mode={props.mode}
              playing={isPiPlaying}
              showLabels={props.showLabels ?? false}
            />
          )}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={8}
          minDistance={2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function SigmaBondScene({ mode, showLabels }: { mode: SigmaBondMode; showLabels: boolean }) {
  if (mode === "sp") {
    return (
      <>
        <Nucleus position={[-0.82, 0, 0]} label="原子核 A" showLabel={showLabels} />
        <Nucleus position={[0.86, 0, 0]} label="原子核 B" showLabel={showLabels} />
        <SOrbital center={[-0.82, 0, 0]} />
        <POrbitalX center={[0.86, 0, 0]} />
        <SigmaOverlap center={[0.02, 0, 0]} scale={[0.76, 0.2, 0.2]} />
        <BondAxis showLabel={showLabels} />
        {showLabels ? (
          <>
            <SceneLabel color="#B96320" position={[0, 0.46, 0.28]} text="s-p 头碰头重叠" />
            <SceneLabel color="#1F6F68" position={[1.3, -0.38, 0.3]} text="p 轨道沿 X 轴取向" />
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Nucleus position={[-0.72, 0, 0]} label="原子核 A" showLabel={showLabels} />
      <Nucleus position={[0.72, 0, 0]} label="原子核 B" showLabel={showLabels} />
      <SOrbital center={[-0.72, 0, 0]} />
      <SOrbital center={[0.72, 0, 0]} />
      <SigmaOverlap center={[0, 0, 0]} scale={[0.86, 0.22, 0.22]} />
      <BondAxis showLabel={showLabels} />
      {showLabels ? (
        <SceneLabel color="#B96320" position={[0, 0.46, 0.28]} text="s-s 轴向重叠形成 σ 键" />
      ) : null}
    </>
  );
}

function PiBondScene({
  mode,
  playing,
  showLabels,
}: {
  mode: PiBondMode;
  playing: boolean;
  showLabels: boolean;
}) {
  const leftRef = useRef<Group>(null);
  const rightRef = useRef<Group>(null);
  const upperCloudRef = useRef<Group>(null);
  const lowerCloudRef = useRef<Group>(null);
  const fixedConfig = getPiStageConfig(mode);

  useFrame(({ clock }) => {
    if (!playing) return;
    const progress = (Math.sin(clock.elapsedTime * 1.35 - Math.PI / 2) + 1) / 2;
    const separation = 1.22 - progress * 0.5;
    const cloudScaleX = 0.18 + progress * 0.9;
    const cloudVisible = progress > 0.18;

    if (leftRef.current) leftRef.current.position.x = -separation;
    if (rightRef.current) rightRef.current.position.x = separation;
    for (const ref of [upperCloudRef, lowerCloudRef]) {
      if (!ref.current) continue;
      ref.current.visible = cloudVisible;
      ref.current.scale.x = cloudScaleX;
    }
  });

  return (
    <>
      <group ref={leftRef} position={[-fixedConfig.separation, 0, 0]}>
        <Nucleus position={[0, 0, 0]} label="原子核 A" showLabel={showLabels} />
        <POrbitalZ center={[0, 0, 0]} />
      </group>
      <group ref={rightRef} position={[fixedConfig.separation, 0, 0]}>
        <Nucleus position={[0, 0, 0]} label="原子核 B" showLabel={showLabels} />
        <POrbitalZ center={[0, 0, 0]} />
      </group>
      <group
        ref={upperCloudRef}
        position={[0, 0, 0.58]}
        scale={[fixedConfig.cloudScaleX, 1, 1]}
        visible={fixedConfig.cloudVisible}
      >
        <PiOverlapCloud tone="top" />
      </group>
      <group
        ref={lowerCloudRef}
        position={[0, 0, -0.58]}
        scale={[fixedConfig.cloudScaleX, 1, 1]}
        visible={fixedConfig.cloudVisible}
      >
        <PiOverlapCloud tone="bottom" />
      </group>
      <BondAxis showLabel={showLabels} />
      {showLabels ? (
        <>
          <SceneLabel color="#1F6F68" position={[0, 0.5, 0.88]} text="π 电子云" />
          <SceneLabel color="#1F6F68" position={[0, -0.42, -0.9]} text="p-p 肩并肩重叠" />
        </>
      ) : null}
    </>
  );
}

function CoordinateAxes({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      <AxisTriad length={2.2} opacity={0.52} origin={[-2.2, -1.05, -1.05]} />
      {showLabels ? (
        <SceneLabel color="#B96320" position={[0, -1.28, -1.05]} text="X 轴：键轴 / 两核连线" />
      ) : null}
    </group>
  );
}

function Nucleus({ position, label, showLabel }: { position: Vec3; label: string; showLabel: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshStandardMaterial color="#1F2933" roughness={0.34} />
      </mesh>
      {showLabel ? (
        <SceneLabel color="#1F2933" position={[0, -0.26, 0]} text={label} />
      ) : null}
    </group>
  );
}

function SOrbital({ center }: { center: Vec3 }) {
  return <SOrbitalCloud center={center} opacity={0.28} radius={0.46} seed={43} tone="primary" />;
}

function POrbitalX({ center }: { center: Vec3 }) {
  return <POrbitalPair center={center} direction={[1, 0, 0]} length={0.64} opacity={0.42} seed={89} width={0.19} />;
}

function POrbitalZ({ center }: { center: Vec3 }) {
  return <POrbitalPair center={center} direction={[0, 0, 1]} length={0.76} opacity={0.42} seed={121} width={0.2} />;
}

function SigmaOverlap({ center, scale }: { center: Vec3; scale: Vec3 }) {
  return (
    <mesh position={center} scale={scale}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshPhysicalMaterial
        clearcoat={0.24}
        color="#F4A261"
        depthWrite={false}
        emissive="#FFF0D8"
        emissiveIntensity={0.08}
        opacity={0.22}
        roughness={0.32}
        transparent
      />
    </mesh>
  );
}

function PiOverlapCloud({ tone }: { tone: "top" | "bottom" }) {
  return (
    <PiCloudBand
      cloudStyle="overlap-lobes"
      length={1}
      opacity={0.34}
      orientation="xy"
      particleCount={280}
      particleOpacity={0.46}
      particleSize={0.022}
      seed={tone === "top" ? 173 : 211}
      showParticles
      thickness={0.13}
      tone={tone === "top" ? "primary" : "warm"}
      waist={0.24}
      width={0.28}
    />
  );
}

function BondAxis({ showLabel }: { showLabel: boolean }) {
  return (
    <>
      <GuideCylinder color="#F4A261" end={[1.35, 0, 0]} opacity={0.78} radius={0.012} start={[-1.35, 0, 0]} />
      {showLabel ? (
        <SceneLabel color="#B96320" position={[0, -0.28, 0.24]} text="键轴" />
      ) : null}
    </>
  );
}

function SceneLabel({ position, text, color }: { position: Vec3; text: string; color: string }) {
  return (
    <Html center distanceFactor={6.5} pointerEvents="none" position={position}>
      <span
        className={teachingSceneLabelClass}
        style={{ color }}
      >
        {text}
      </span>
    </Html>
  );
}

function getCameraPosition(lessonType: OrbitalBondLessonType): Vec3 {
  if (lessonType === "sigma") return [3.4, -4.8, 2.9];
  return [3.25, -4.9, 3.25];
}

function getPiStageConfig(mode: PiBondMode) {
  if (mode === "before") {
    return { separation: 1.22, cloudScaleX: 0.18, cloudVisible: false };
  }
  if (mode === "forming") {
    return { separation: 0.95, cloudScaleX: 0.62, cloudVisible: true };
  }
  return { separation: 0.72, cloudScaleX: 1.08, cloudVisible: true };
}
