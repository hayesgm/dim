import { AnimationMixer, Object3D, Event, Vector3 } from 'three';
import { loadModel } from '../systems/model';
import { Physics } from '../Physics';
import {
  RigidBodyDesc,
  ColliderDesc,
  CoefficientCombineRule,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';

export class Ball extends Entity {
  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc[],
    physics: Physics
  ) {
    super('ball', [object], rigidBodyDesc, colliderDesc, false, physics);
  }

  static async load(size: number, position: Vector3, physics: Physics) {
    let object = await loadModel(`assets/models/Ball/scene.gltf`, { size });
    return new Ball(
      object,
      RigidBodyDesc.newDynamic()
        .setTranslation(position.x, position.y, position.z)
        .setCcdEnabled(true)
        .setLinearDamping(0.5)
        .setAngularDamping(1.0),
      [
        ColliderDesc.ball(size * 0.5)
          .setDensity(0.5)
          .setRestitution(0.7)
          .setRestitutionCombineRule(CoefficientCombineRule.Max),
      ],
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
  }
}
