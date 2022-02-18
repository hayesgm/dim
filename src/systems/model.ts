import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, Scene } from "three";

const loader = new GLTFLoader();

export type Vec3 = [number, number, number];

function uniformVec3(x: number): Vec3 {
  return [x, x, x];
}

interface LoadOpts {
  position?: Vec3;
  scale?: number | Vec3;
}

export function loadModel(path: string, opts: LoadOpts = {}): Promise<Group> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      function (gltf) {
        if (opts.position) {
          gltf.scene.position.set(...opts.position);
        }
        if (opts.scale) {
          let scale = typeof opts.scale === "number" ? uniformVec3(opts.scale) : opts.scale;
          gltf.scene.scale.set(...scale);
        }
        resolve(gltf.scene);
      },
      function (xhr) {},
      function (error) {
        reject(error);
      }
    );
  });
}
