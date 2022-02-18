import {
  SphereBufferGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
} from 'three';

const radialSpeed = MathUtils.degToRad(30);

export function createMeshGroup() {
  const group = new Group();

  (group as any).tick = (delta) => {
    group.rotation.z -= delta * radialSpeed;
  };

  const geometry = new SphereBufferGeometry(0.25, 16, 16);
  const material = new MeshStandardMaterial({
    color: 'indigo',
  });

  const protoSphere = new Mesh(geometry, material);
  group.add(protoSphere);
  group.scale.multiplyScalar(2);

  for (let i = 0; i < 20; i++) {
    let newSphere = protoSphere.clone();
    const x = Math.cos(2 * Math.PI * i / 20);
    const y = Math.sin(2 * Math.PI * i / 20);
    newSphere.position.x = x;
    newSphere.position.y = y;
    newSphere.scale.multiplyScalar(0.01 + i / 20);
    group.add(newSphere);
  }

  return group;
}
