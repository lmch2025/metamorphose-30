"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { getPose, type HumanoidPose } from "@/lib/exercise-poses";

/* ---------- Matériaux ---------- */

const SKIN_COLOR = "#d4a574";
const SKIN_COLOR_DARK = "#a67c52";
const CLOTH_COLOR = "#1a1a2e";
const CLOTH_COLOR_ACCENT = "#e8a04a";

function useBodyMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SKIN_COLOR,
        roughness: 0.55,
        metalness: 0.05,
      }),
    [],
  );
}

function useClothMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CLOTH_COLOR,
        roughness: 0.7,
        metalness: 0.05,
      }),
    [],
  );
}

function useAccentMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CLOTH_COLOR_ACCENT,
        roughness: 0.4,
        metalness: 0.2,
        emissive: CLOTH_COLOR_ACCENT,
        emissiveIntensity: 0.15,
      }),
    [],
  );
}

/* ---------- Segments de membre (capsules via cylindres) ---------- */

function Limb({
  length,
  radius,
  material,
  position,
  rotation,
}: {
  length: number;
  radius: number;
  material: THREE.Material;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow>
      <capsuleGeometry args={[radius, length, 8, 16]} />
    </mesh>
  );
}

function Joint({
  radius,
  material,
  position,
}: {
  radius: number;
  material: THREE.Material;
  position: [number, number, number];
}) {
  return (
    <mesh position={position} material={material} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
    </mesh>
  );
}

/* ---------- Humanoïde articulé ---------- */

interface HumanoidProps {
  pose: HumanoidPose;
  animate?: boolean;
}

function Humanoid({ pose, animate = false }: HumanoidProps) {
  const skinMat = useBodyMaterial();
  const clothMat = useClothMaterial();
  const accentMat = useAccentMaterial();

  // Groupes pour les articulations (hiérarchie)
  const hipsRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const lShoulderRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const rShoulderRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const lHipRef = useRef<THREE.Group>(null);
  const lKneeRef = useRef<THREE.Group>(null);
  const rHipRef = useRef<THREE.Group>(null);
  const rKneeRef = useRef<THREE.Group>(null);

  // Applique les rotations de la pose + petite animation de respiration
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breath = animate ? Math.sin(t * 1.2) * 0.015 : 0;

    const apply = (
      ref: React.RefObject<THREE.Group | null>,
      rot: [number, number, number],
    ) => {
      if (!ref.current) return;
      const [x, y, z] = rot.map((d) => THREE.MathUtils.degToRad(d));
      ref.current.rotation.set(x + breath, y, z);
    };

    apply(hipsRef, pose.hips);
    apply(spineRef, pose.spine);
    apply(neckRef, pose.neck);
    apply(headRef, pose.head);
    apply(lShoulderRef, pose.leftShoulder);
    apply(lElbowRef, pose.leftElbow);
    apply(rShoulderRef, pose.rightShoulder);
    apply(rElbowRef, pose.rightElbow);
    apply(lHipRef, pose.leftHip);
    apply(lKneeRef, pose.leftKnee);
    apply(rHipRef, pose.rightHip);
    apply(rKneeRef, pose.rightKnee);
  });

  // Dimensions du corps (humanoïde ~1.8 unités de haut)
  const hipY = 0.95;
  const torsoLen = 0.55;
  const neckLen = 0.1;
  const headR = 0.16;
  const shoulderOffset = 0.22;
  const upperArmLen = 0.32;
  const forearmLen = 0.3;
  const armR = 0.06;
  const hipOffset = 0.12;
  const thighLen = 0.42;
  const shinLen = 0.4;
  const legR = 0.075;

  return (
    <group position={[0, -hipY, 0]}>
      {/* Hanches (racine du corps) */}
      <group ref={hipsRef} position={[0, hipY, 0]}>
        {/* Bassin */}
        <mesh material={clothMat} castShadow>
          <capsuleGeometry args={[0.16, 0.18, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.05, 0.12]} material={accentMat}>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
        </mesh>

        {/* Colonne vertébrale + torse */}
        <group ref={spineRef} position={[0, 0.15, 0]}>
          <mesh position={[0, torsoLen / 2, 0]} material={clothMat} castShadow>
            <capsuleGeometry args={[0.18, torsoLen, 8, 16]} />
          </mesh>
          {/* Pectoraux */}
          <mesh position={[-0.1, torsoLen - 0.05, 0.12]} material={skinMat}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
          <mesh position={[0.1, torsoLen - 0.05, 0.12]} material={skinMat}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>

          {/* Cou + tête */}
          <group ref={neckRef} position={[0, torsoLen + neckLen / 2, 0]}>
            <mesh material={skinMat}>
              <capsuleGeometry args={[0.05, neckLen, 8, 12]} />
            </mesh>
            <group ref={headRef} position={[0, neckLen / 2 + headR, 0]}>
              {/* Tête */}
              <mesh material={skinMat} castShadow>
                <sphereGeometry args={[headR, 24, 24]} />
              </mesh>
              {/* Visage simplifié : yeux + sourcils pour repère */}
              <mesh position={[-0.055, 0.03, headR - 0.01]}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
              </mesh>
              <mesh position={[0.055, 0.03, headR - 0.01]}>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
              </mesh>
              {/* Cheveux */}
              <mesh position={[0, 0.05, -0.02]} material={clothMat}>
                <sphereGeometry args={[headR * 1.02, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              </mesh>
            </group>
          </group>

          {/* Épaule gauche + bras */}
          <group ref={lShoulderRef} position={[-shoulderOffset, torsoLen - 0.02, 0]}>
            <Joint radius={armR * 1.2} material={skinMat} position={[0, 0, 0]} />
            <Limb
              length={upperArmLen}
              radius={armR}
              material={skinMat}
              position={[0, -upperArmLen / 2 - 0.05, 0]}
              rotation={[0, 0, 0]}
            />
            {/* Coude + avant-bras */}
            <group ref={lElbowRef} position={[0, -upperArmLen - 0.05, 0]}>
              <Joint radius={armR} material={skinMat} position={[0, 0, 0]} />
              <Limb
                length={forearmLen}
                radius={armR * 0.9}
                material={skinMat}
                position={[0, -forearmLen / 2, 0]}
                rotation={[0, 0, 0]}
              />
              {/* Main */}
              <mesh position={[0, -forearmLen - 0.04, 0]} material={skinMat}>
                <sphereGeometry args={[armR * 0.95, 12, 12]} />
              </mesh>
            </group>
          </group>

          {/* Épaule droite + bras (miroir) */}
          <group ref={rShoulderRef} position={[shoulderOffset, torsoLen - 0.02, 0]}>
            <Joint radius={armR * 1.2} material={skinMat} position={[0, 0, 0]} />
            <Limb
              length={upperArmLen}
              radius={armR}
              material={skinMat}
              position={[0, -upperArmLen / 2 - 0.05, 0]}
              rotation={[0, 0, 0]}
            />
            <group ref={rElbowRef} position={[0, -upperArmLen - 0.05, 0]}>
              <Joint radius={armR} material={skinMat} position={[0, 0, 0]} />
              <Limb
                length={forearmLen}
                radius={armR * 0.9}
                material={skinMat}
                position={[0, -forearmLen / 2, 0]}
                rotation={[0, 0, 0]}
              />
              <mesh position={[0, -forearmLen - 0.04, 0]} material={skinMat}>
                <sphereGeometry args={[armR * 0.95, 12, 12]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Hanche gauche + jambe */}
        <group ref={lHipRef} position={[-hipOffset, -0.05, 0]}>
          <Joint radius={legR * 1.15} material={clothMat} position={[0, 0, 0]} />
          <Limb
            length={thighLen}
            radius={legR}
            material={clothMat}
            position={[0, -thighLen / 2 - 0.05, 0]}
            rotation={[0, 0, 0]}
          />
          <group ref={lKneeRef} position={[0, -thighLen - 0.05, 0]}>
            <Joint radius={legR} material={skinMat} position={[0, 0, 0]} />
            <Limb
              length={shinLen}
              radius={legR * 0.85}
              material={skinMat}
              position={[0, -shinLen / 2, 0]}
              rotation={[0, 0, 0]}
            />
            {/* Pied */}
            <mesh position={[0, -shinLen - 0.03, 0.05]} material={clothMat}>
              <boxGeometry args={[0.12, 0.06, 0.22]} />
            </mesh>
          </group>
        </group>

        {/* Hanche droite + jambe (miroir) */}
        <group ref={rHipRef} position={[hipOffset, -0.05, 0]}>
          <Joint radius={legR * 1.15} material={clothMat} position={[0, 0, 0]} />
          <Limb
            length={thighLen}
            radius={legR}
            material={clothMat}
            position={[0, -thighLen / 2 - 0.05, 0]}
            rotation={[0, 0, 0]}
          />
          <group ref={rKneeRef} position={[0, -thighLen - 0.05, 0]}>
            <Joint radius={legR} material={skinMat} position={[0, 0, 0]} />
            <Limb
              length={shinLen}
              radius={legR * 0.85}
              material={skinMat}
              position={[0, -shinLen / 2, 0]}
              rotation={[0, 0, 0]}
            />
            <mesh position={[0, -shinLen - 0.03, 0.05]} material={clothMat}>
              <boxGeometry args={[0.12, 0.06, 0.22]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ---------- Scène 3D ---------- */

interface ExerciseModel3DProps {
  exerciseId: string;
  className?: string;
  autoRotate?: boolean;
}

function Scene({
  exerciseId,
  autoRotate,
}: {
  exerciseId: string;
  autoRotate: boolean;
}) {
  const pose = getPose(exerciseId);

  return (
    <>
      {/* Éclairage */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#e8a04a" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#72d4a0" />

      {/* Humanoïde (sans Float pour éviter de masquer la pose) */}
      <Humanoid pose={pose} animate />

      {/* Ombre au sol */}
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.45}
        scale={6}
        blur={2.4}
        far={4}
        color="#000000"
      />

      {/* Environnement (reflets) — preset léger */}
      <Environment preset="studio" environmentIntensity={0.3} />

      {/* Contrôles orbitaux */}
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        target={[0, 0, 0]}
      />
    </>
  );
}

/**
 * Visualiseur 3D d'exercice : humanoïde articulé qui prend la pose
 * correspondant à l'exercice. Interactive : rotation, zoom, auto-rotation.
 */
export function ExerciseModel3D({
  exerciseId,
  className,
  autoRotate = true,
}: ExerciseModel3DProps) {
  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 4], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene exerciseId={exerciseId} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
