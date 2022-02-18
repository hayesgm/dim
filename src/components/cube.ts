import {
  BoxBufferGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  TextureLoader,
} from 'three';
import { Updatable } from '../systems/Loop';

const rotationSpeed = MathUtils.degToRad(30);

function createMaterial() {
  const textureLoader = new TextureLoader();

  const texture = textureLoader.load(
    '/assets/textures/uv-test-bw.png',
  );

  // create a "standard" material
  const material = new MeshStandardMaterial({ map: texture });

  return material;
}

export function createCube() {
  // create a geometry
  const geometry = new BoxBufferGeometry(2, 2, 2);

  const material = createMaterial();

  // create a Mesh containing the geometry and material
  const cube = new Mesh(geometry, material);
  cube.rotation.set(-0.5, -0.1, 0.8);

  (cube as unknown as Updatable).tick = (delta) => {
    cube.rotation.z += rotationSpeed * delta;
    cube.rotation.x += rotationSpeed * delta;
    cube.rotation.y += rotationSpeed * delta;
  };

  return cube;
}
