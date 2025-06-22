import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Sphere } from "@react-three/drei";
import * as THREE from "three";

const Particle = ({ position, color, speed, size }) => {
  const mesh = useRef();

  useFrame((state, delta) => {
    mesh.current.position.y -= speed * delta;
    if (mesh.current.position.y < -10) {
      mesh.current.position.y = 10;
    }
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });

  return (
    <Sphere ref={mesh} position={position} args={[size, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        roughness={0.5}
        metalness={0.5}
      />
    </Sphere>
  );
};

const RotatingIcosahedron = () => {
  const mesh = useRef();
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.002));

  return (
    <Icosahedron ref={mesh} args={[2, 1]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#8A2BE2"
        wireframe={true}
        wireframeLinewidth={0.2}
        transparent
        opacity={0.3}
      />
    </Icosahedron>
  );
};

const ThreeDScene = () => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      const color = Math.random() > 0.5 ? "#4a00e0" : "#8e2de2";
      const speed = Math.random() * 0.5 + 0.1;
      const size = Math.random() * 0.05 + 0.02;
      temp.push({ position: [x, y, z], color, speed, size });
    }
    return temp;
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <RotatingIcosahedron />
      {particles.map((particle, i) => (
        <Particle key={i} {...particle} />
      ))}
    </Canvas>
  );
};

export default ThreeDScene;
