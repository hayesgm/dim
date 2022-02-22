import {
  AnimationMixer,
  Object3D,
  Euler,
  Event,
  Quaternion,
  Vector3,
} from 'three';
import { loadModel } from '../systems/model';
import { Physics } from '../Physics';
import {
  RigidBodyDesc,
  ColliderDesc,
  CoefficientCombineRule,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';

export class Hoop extends Entity {
  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc[],
    physics: Physics
  ) {
    super('hoop', [object], rigidBodyDesc, colliderDesc, false, physics);
  }

  static async load(
    size: number,
    position: Vector3,
    rotation: Euler,
    physics: Physics
  ) {
    let object = await loadModel(`assets/models/Hoop/scene.gltf`, { size });
    let q = new Quaternion();
    q.setFromEuler(rotation);
    return new Hoop(
      object,
      RigidBodyDesc.newDynamic()
        .setTranslation(position.x, position.y, position.z)
        .setRotation(q)
        .setCcdEnabled(true)
        .setLinearDamping(0.5)
        .setAngularDamping(1.0),
      ColliderDesc.cuboid(size * 0.5, size * 0.5, size * 0.05)
        .setDensity(3)
        .setRestitution(1.5)
        .setRestitutionCombineRule(CoefficientCombineRule.Min)
        .setTranslation(0, 1, 0),
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
  }
}
