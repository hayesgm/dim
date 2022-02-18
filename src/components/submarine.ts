import { loadModel } from '../systems/model';

export async function createSubmarine() {
  return await loadModel("models/submarine/scene.gltf", {
    position: [0, 0, -10],
    scale: 0.005,
  });
}