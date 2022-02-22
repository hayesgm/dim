import {
  AnimationMixer,
  Object3D,
  Euler,
  Event,
  MathUtils,
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

function getRotation(x: number, y: number, z: number, order='XYZ'): Quaternion {
  let q = new Quaternion();
  let euler = new Euler(MathUtils.degToRad(x), MathUtils.degToRad(y), MathUtils.degToRad(z), order)
  q.setFromEuler(euler);
  return q;
}

export class Hoop extends Entity {
  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
    physics: Physics
  ) {
    super('hoop', [object], rigidBodyDesc, colliderDescs, false, physics);
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

    let rimRadius = 0.12 / 2;
    let segmentCount = 50;
    let rimCollider = [...new Array(segmentCount)].map((el, i) => {
      let angle = i * 2 * Math.PI / segmentCount;
      let pX = Math.sin(angle) * rimRadius;
      let pZ = Math.cos(angle) * rimRadius;
      console.log({angle, pX, pZ})
      return ColliderDesc.ball(size * 0.003, size * 0.003, size * 0.003)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Max)
          .setTranslation(size * (0 + pX), size * 0.695, size * ( -0.38 - rimRadius + pZ ));
    });

    return new Hoop(
      object,
      RigidBodyDesc.newDynamic()
        .setTranslation(position.x, position.y, position.z)
        .setRotation(q)
        .setCcdEnabled(true)
        .setLinearDamping(0.5)
        .setAngularDamping(1.0),
      [
        // Base
        ColliderDesc.cuboid(size * 0.25, size * 0.2, size * 0.25)
          .setDensity(10)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.125, size * 0.25),
        // Spine Base
        ColliderDesc.cuboid(size * 0.1, size * 0.4, size * 0.05)
          .setDensity(3)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.4, size * 0.23),
        // Spine Turn
        ColliderDesc.cuboid(size * 0.02, size * 0.25, size * 0.04)
          .setDensity(3)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.6, size * 0.23)
          .setRotation(getRotation(0, 0, 48)),
        // Spine Top
        ColliderDesc.cuboid(size * 0.02, size * 0.25, size * 0.04)
          .setDensity(3)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.68, size * 0)
          .setRotation(getRotation(0, 0, 90)),
        // Spine Connector
        ColliderDesc.cuboid(size * 0.03, size * 0.25, size * 0.04)
          .setDensity(3)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.68, size * -0.2)
          .setRotation(getRotation(0, 0, 90)),
        // Backboard
        ColliderDesc.cuboid(size * 0.42, size * 0.25, size * 0.03)
          .setDensity(3)
          .setRestitution(1.5)
          .setRestitutionCombineRule(CoefficientCombineRule.Min)
          .setTranslation(size * 0, size * 0.78, size * -0.35),
        ...rimCollider
      ],
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
  }
}
