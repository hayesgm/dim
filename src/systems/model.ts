import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationClip, AnimationMixer, Box3, Euler, Group, Object3D, Matrix4, Quaternion, Vector3, Scene } from "three";

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

function splitBy<A>(els: A[], pred: (x: A) => boolean): [A[], A[]] {
  return els.reduce(([pass, fail]: [A[], A[]], el) => {
    if (pred(el)) {
      return [[...pass, el], fail];
    } else {
      return [pass, [...fail, el]];
    }
  }, [[], []]);
}

export async function loadModel(path: string, opts: LoadOpts = {}): Promise<Object3D> {
  let data: GLTF = await loader.loadAsync(path);
  console.log({path, children: data.scene.children[0]});
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
  console.log("scale", opts.scale);
  return model;
}

export function splitOff(model: Object3D, split: string): Object3D {
  model.updateMatrixWorld();
  let res = splitOffInternal([[model, []]], [], split);
  console.log({split, res});
  if (res.length === 0) {
    throw new Error(`Cannot find split off ${split}`);
  } else if (res.length === 1) {
    let [model, matrixPath] = res[0];
    //let matrix = new Matrix4();
    // console.log({matrixPath});
    // let matrix = matrixPath.reduce((m0, m1) => {
    //   let position0 = new Vector3();
    //   position0.setFromMatrixPosition(m0);
    //   let position1 = new Vector3();
    //   position1.setFromMatrixPosition(m1);
    //   console.log({position0, position1})
    //   let rotation0 = new Euler();
    //   rotation0.setFromRotationMatrix(m0);
    //   let rotation1 = new Euler();
    //   rotation1.setFromRotationMatrix(m1);
    //   console.log({rotation0, rotation1})
    //   console.log(m0, m1);
    //   let v = m0.clone().multiply(m1.clone());
    //   console.log(v);
    //   return v.clone();
    // }, new Matrix4());
    // console.log({matrix});
    // model.matrix = matrix;
    // model.updateMatrixWorld();
    // console.log(model.matrix.elements[0]);
    // let position = new Vector3();
    // position.setFromMatrixPosition(model.matrix);
    // let rotation = new Euler();
    // rotation.setFromRotationMatrix(model.matrix);
    // console.log("Position: ", position, rotation);
    let head = new Group();
    let group = matrixPath.reverse().reduce((acc, m) => {
      let el = new Group();
      el.matrix.copy(m);
      acc.add(el);
      return el;
    }, head);
    group.add(model);
    console.log(head);
    head.updateMatrixWorld();
    console.log(model.matrixWorld);
    let position = new Vector3();
    position.setFromMatrixPosition(head.matrixWorld);
    let rotation = new Euler();
    rotation.setFromRotationMatrix(head.matrixWorld);
    console.log("Position: ", position.toArray(), rotation.toArray());
    return head;
  } else {
    throw new Error(`Found multiple splits for ${split}`);
  }
}

type ObjectMatrixPath = [Object3D, Matrix4[]];

export function splitOffInternal(models: ObjectMatrixPath[], found: ObjectMatrixPath[], split: string): ObjectMatrixPath[] {
  if (models.length === 0) {
    return found;
  } else {
    let [[model, matrices], ...modelsRest] = models;
    let matrixPath = [...matrices, model.matrix];
    console.log(`checking split off ${model.name} for ${split}`)
    let childrenMatrices = model.children.map<ObjectMatrixPath>((child) => [child, matrixPath]);
    let [match, els] = splitBy(childrenMatrices, ([child, matrixPath]) => child.name === split);
    if (match.length > 0) {
      // let matrix = model.matrixWorld.clone();
      // console.log(model.matrixWorld);
      // console.log(model.matrixWorld.elements[0]);
      // console.log(matrix.elements[0]);
      model.remove(...match.map((m) => m[0]));
      //model.matrix.copy(matrix);
      //model.matrixWorld.copy(new Matrix4());
      // console.log(model.matrix.elements[0]);
    }
    return splitOffInternal([...modelsRest, ...els], [...found, ...match], split);
  }
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
