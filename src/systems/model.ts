import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationClip, AnimationMixer, Box3, Group, Object3D, Vector3, Scene } from "three";

const loader = new GLTFLoader();

export type Vec3 = [number, number, number];

function uniformVec3(x: number): Vec3 {
  return [x, x, x];
}

interface LoadOpts {
  scale?: number | Vec3;
  size?: number;
  animation?: number;
}

export async function loadModel(path: string, opts: LoadOpts = {}): Promise<Object3D> {
  let data: GLTF = await loader.loadAsync(path);
  const model = data.scene.children[0];
  if (opts.size) {
    let bounds = new Box3().setFromObject(model);
    let size = bounds.getSize(new Vector3());
    let maxAxis = Math.max(size.x, size.y, size.z);
    console.log('sz', opts.size, size, maxAxis, 1.0/maxAxis);
    opts.scale = opts.size * 1.0 / maxAxis;
  }
  if (opts.scale) {
    let scale = typeof opts.scale === "number" ? uniformVec3(opts.scale) : opts.scale;
    model.scale.set(...scale);
  }
  console.log(opts.scale);
  return model;
}

export async function loadAnimatedModel(path: string, opts: LoadOpts = {}): Promise<{model: Object3D, animations: AnimationClip[], mixer: AnimationMixer}> {
  let data: GLTF = await loader.loadAsync(path);
  const model = data.scene.children[0];
  if (opts.size) {
    let bounds = new Box3().setFromObject(model);
    let size = bounds.getSize(new Vector3());
    let maxAxis = Math.max(size.x, size.y, size.z);
    opts.scale = 1.0 / maxAxis;
  }
  if (opts.scale) {
    let scale = typeof opts.scale === "number" ? uniformVec3(opts.scale) : opts.scale;
    model.scale.set(...scale);
  }
  let animations = data.animations;
  const clip = data.animations[opts.animation ?? 0];

  const mixer = new AnimationMixer(model);
  const action = mixer.clipAction(clip);
  action.play();

  return {model, animations, mixer};
}
