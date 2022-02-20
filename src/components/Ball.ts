import { AnimationMixer, Object3D, Event, Vector3 } from 'three';
import { loadModel } from '../systems/model';
import { Physics } from '../Physics';
import {
  RigidBodyDesc,
  ColliderDesc,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';

export class Ball extends Entity {

  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc,
    physics: Physics,
  ) {
    super('ball', [object], rigidBodyDesc, colliderDesc, physics);
  }

  static async load(size: number, position: Vector3, physics: Physics) {
    let object = await loadModel(
      `assets/models/Ball/scene.gltf`,
      { size }
    );
    return new Ball(
      object,
      RigidBodyDesc.newDynamic().setTranslation(
        position.x,
        position.y,
        position.z
      ).setCcdEnabled(true),
      ColliderDesc.ball(size * 0.5).setDensity(0.5),
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
  }

  tossUp(power: number = 0.5) {
    this.toss(new Vector3(0, 1, 0), power);
  }

  toss(dir: Vector3, power: number) {
    this.rigidBody?.applyForce(dir.normalize().multiplyScalar(power * 20), true);
  }
}
