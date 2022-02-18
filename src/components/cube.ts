import { BoxBufferGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Updatable } from '../systems/Loop';

export function createCube() {
  // create a geometry
  const geometry = new BoxBufferGeometry(2, 2, 2);

  // create a standard material
  const material = new MeshStandardMaterial({ color: 'purple' });

  // create a Mesh containing the geometry and material
  const cube = new Mesh(geometry, material);
  cube.rotation.set(-0.5, -0.1, 0.8);

  (cube as unknown as Updatable).tick = () => {
    cube.rotation.z += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  return cube;
}
