'use client'

// components/three-hero-background.tsx
//
// Sfondo 3D dell'hero (landing + /home): un blob indigo che si deforma di
// continuo (MeshDistortMaterial, drei) invece dei blur-blob CSS statici.
// ssr:false obbligatorio lato chiamante — Canvas richiede WebGL/window,
// non esiste lato server. reducedMotion ferma rotazione/distorsione ma
// lascia il blob visibile e fermo, mai smontato (niente layout shift).

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import type { Mesh } from 'three'

function IndigoBlob() {
  const meshRef = useRef<Mesh>(null)
  const reduceMotion = useReducedMotion()

  useFrame((_, delta) => {
    if (reduceMotion || !meshRef.current) return
    meshRef.current.rotation.x += delta * 0.06
    meshRef.current.rotation.y += delta * 0.09
  })

  return (
    <Float speed={reduceMotion ? 0 : 1.4} rotationIntensity={reduceMotion ? 0 : 0.3} floatIntensity={reduceMotion ? 0 : 0.7}>
      <mesh ref={meshRef} scale={2.4}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#5E6AD2"
          distort={0.45}
          speed={reduceMotion ? 0 : 1.8}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>
    </Float>
  )
}

export function ThreeHeroBackground({ className = '' }: { className?: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
      className={`!absolute inset-0 h-full w-full ${className}`}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={80} color="#7A85E5" />
      <pointLight position={[-4, -2, -3]} intensity={40} color="#5E6AD2" />
      <IndigoBlob />
    </Canvas>
  )
}
