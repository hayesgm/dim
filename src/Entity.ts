import { Object3D, Event } from 'three';
import { loadModel } from './systems/model';

export abstract class Entity {
  object: Object3D<Event>;
  physics: null;

  constructor(object: Object3D<Event>, physics: null) {
    this.object = object;
    this.physics = physics;
  }

  tick(delta: number) {}
}

export class Bird extends Entity {
  constructor(object: Object3D<Event>, physics: null) {
    super(object, null);
  }

  static async load(model: string) {
    let object = await loadModel(model);
    return new Bird(object, null);
  }

  tick(delta: number) {
    // Something?
  }
}

// let rigidBodyDesc = RigidBodyDesc.newDynamic();
    // let body = world.createRigidBody(rigidBodyDesc);
    // let colliderDesc = ColliderDesc.cuboid(0.5, 0.5, 0.5);
    // let collider = world.createCollider(colliderDesc, body.handle);
