"use client";

/**
 * TasteMapMascot — 3D Cube Character (Three.js)
 * ─────────────────────────────────────────────────────────────────
 * A cute animated square-space mascot that acts as the AI assistant.
 * Built with @react-three/fiber + drei for React-native Three.js.
 *
 * The mascot is a rounded cube with:
 * - Animated eyes (blinking)
 * - Floating/breathing idle animation
 * - Subtle rotation following mouse
 * - Chef hat on top
 * - Happy expression that changes contextually
 */
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  RoundedBox,
  Float,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

// ─── Eye component ───────────────────────────────────────────────
const Eye: React.FC<{
  position: [number, number, number];
  blinkPhase: number;
}> = ({ position, blinkPhase }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Blink every ~3 seconds
    const blinkCycle = (t + blinkPhase) % 3;
    const scaleY = blinkCycle < 0.1 ? 0.1 : 1;
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y,
      scaleY,
      0.3,
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
    </mesh>
  );
};

// ─── Mouth (smile arc) ──────────────────────────────────────────
const Mouth: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = (i / 20) * Math.PI;
      points.push(
        new THREE.Vector3(
          Math.cos(t) * 0.12 - 0.12,
          -Math.sin(t) * 0.04,
          0,
        ),
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <mesh position={position}>
      <tubeGeometry args={[curve, 20, 0.015, 8, false]} />
      <meshStandardMaterial color="#e74c6f" roughness={0.5} />
    </mesh>
  );
};

// ─── Cheek blush ─────────────────────────────────────────────────
const Blush: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => (
  <mesh position={position}>
    <circleGeometry args={[0.06, 16]} />
    <meshStandardMaterial
      color="#ff9eb5"
      transparent
      opacity={0.5}
      side={THREE.DoubleSide}
    />
  </mesh>
);

// ─── Chef Hat ────────────────────────────────────────────────────
const ChefHat: React.FC = () => {
  return (
    <group position={[0, 0.55, 0]}>
      {/* Hat base (cylinder) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 0.08, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Hat puff (sphere cluster) */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.2, 0.05]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-0.12, 0.18, -0.05]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ─── Sparkle particles ──────────────────────────────────────────
const SparkleParticle: React.FC<{
  delay: number;
  radius: number;
  speed: number;
}> = ({ delay, radius, speed }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + delay;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t * 1.3) * 0.3 + 0.5;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.scale.setScalar(
      (Math.sin(t * 2) * 0.5 + 0.5) * 0.04 + 0.01,
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// ─── Main Cube Mascot ────────────────────────────────────────────
const CubeMascot: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    // Subtle follow mouse
    const targetRotY = pointer.x * 0.3;
    const targetRotX = -pointer.y * 0.15;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.05,
    );
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Body — rounded cube */}
        <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            color="#8b5cf6"
            roughness={0.35}
            metalness={0.1}
          />
        </RoundedBox>

        {/* Face elements — slightly in front */}
        <group position={[0, 0.02, 0.46]}>
          {/* Eyes */}
          <Eye position={[-0.15, 0.1, 0]} blinkPhase={0} />
          <Eye position={[0.15, 0.1, 0]} blinkPhase={1.5} />

          {/* Eye highlights */}
          <mesh position={[-0.13, 0.12, 0.05]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0.17, 0.12, 0.05]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Mouth */}
          <Mouth position={[0.12, -0.08, 0]} />

          {/* Blush cheeks */}
          <Blush position={[-0.28, -0.02, 0.01]} />
          <Blush position={[0.28, -0.02, 0.01]} />
        </group>

        {/* Chef Hat */}
        <ChefHat />

        {/* Sparkle particles orbiting */}
        {[0, 1, 2, 3].map((i) => (
          <SparkleParticle
            key={i}
            delay={(i * Math.PI) / 2}
            radius={0.7 + i * 0.1}
            speed={0.5 + i * 0.15}
          />
        ))}
      </group>
    </Float>
  );
};

// ─── Exported Canvas wrapper ─────────────────────────────────────
export const TasteMapMascot: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1} color="#ffffff" />
        <directionalLight
          position={[-2, 1, -3]}
          intensity={0.3}
          color="#8b5cf6"
        />
        <pointLight position={[0, 2, 0]} intensity={0.4} color="#c4b5fd" />

        <CubeMascot />

        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.25}
          scale={2}
          blur={2}
          far={1}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
