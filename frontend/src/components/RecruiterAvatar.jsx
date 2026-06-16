import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

function AvatarModel() {
  const { scene } = useGLTF("/models/recruiter.glb");

  scene.traverse((obj) => {
    if (obj.isMesh) {
      console.log("Mesh:", obj.name);
      console.log("Morph Targets:", obj.morphTargetDictionary);
    }
  });

  return <primitive object={scene} />;
}

export default function RecruiterAvatar() {
  return (
    <Canvas camera={{ position: [0, 1.5, 2], fov: 50 }}>
      <ambientLight intensity={3} />
      <directionalLight position={[5, 5, 5]} intensity={3} />

      <Environment preset="city" />

      <AvatarModel />
<OrbitControls
  enableZoom={true}
  autoRotate
  autoRotateSpeed={1}
/>
      <OrbitControls />
    </Canvas>
  );
}