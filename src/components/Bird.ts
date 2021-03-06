import { AnimationMixer, Object3D, Event, Vector3 } from 'three';
import { Physics } from '../Physics';
import { loadAnimatedModel } from '../systems/model';
import {
  RigidBodyDesc,
  ColliderDesc,
  CoefficientCombineRule,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';

export class Bird extends Entity {
  mixer: AnimationMixer;
  flightLevel: number;
  deviation: number;

  constructor(
    id: string,
    object: Object3D<Event>,
    mixer: AnimationMixer,
    flightLevel: number,
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
    physics: Physics
  ) {
    super(id, [object], rigidBodyDesc, colliderDescs, false, physics);
    this.mixer = mixer;
    this.flightLevel = flightLevel;
    this.deviation = 0;
  }

  static async load(model: string, position: Vector3, physics: Physics) {
    let { model: object, mixer } = await loadAnimatedModel(
      `assets/models/${model}.glb`,
      { scale: 0.002 }
    );
    return new Bird(
      model.toLowerCase(),
      object,
      mixer,
      position.y,
      RigidBodyDesc.newDynamic().setTranslation(
        position.x,
        position.y,
        position.z
      ),
      [ColliderDesc.cuboid(0.1, 0.1, 0.1).setDensity(2.0)],
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
    this.mixer.update(delta);
    this.flap();
  }

  flap() {
    let position = this.position();
    let delta = this.flightLevel - position.y;
    let thrust = 0;
    if (delta < 0) {
      thrust = 2;
    } else {
      thrust = 2;
    }
    // this.rigidBody?.applyForce({ x: 0.0, y: thrust, z: 0.0 }, true);
  }
}
