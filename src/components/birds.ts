import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D } from 'three';

import { setupModel } from './setupModel';

export async function loadBirds(): Promise<{ parrot: Object3D, flamingo: Object3D, stork: Object3D }> {
  const loader = new GLTFLoader();

  const [parrotData, flamingoData, storkData] = await Promise.all([
    loader.loadAsync('/assets/models/Parrot.glb'),
    loader.loadAsync('/assets/models/Flamingo.glb'),
    loader.loadAsync('/assets/models/Stork.glb'),
  ]);

  console.log('Squaaawk!', parrotData);

  const parrot = setupModel(parrotData);
  parrot.position.set(0, 0, 2.5);
  parrot.scale.multiplyScalar(0.02);

  const flamingo = setupModel(flamingoData);
  flamingo.position.set(7.5, 0, -10);
  flamingo.scale.multiplyScalar(0.02);

  const stork = setupModel(storkData);
  stork.position.set(0, -2.5, -10);
  stork.scale.multiplyScalar(0.02);

  return {
    parrot,
    flamingo,
    stork,
  };
}
