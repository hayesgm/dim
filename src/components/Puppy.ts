import {
  AnimationClip,
  AnimationMixer,
  Object3D,
  Event,
  Vector3,
  Quaternion,
} from 'three';
import { Physics } from '../Physics';
import { loadAnimatedModel } from '../systems/model';
import {
  RigidBodyDesc,
  ColliderDesc,
  CoefficientCombineRule,
  Vector,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';
import { Ball } from './Ball';

export type Action =
  | { action: 'run'; direction: Vector3 }
  | { action: 'walk'; direction: Vector3 }
  | 'idle';

function toVector3(v: Vector): Vector3 {
  return new Vector3(v.x, v.y, v.z);
}

export class Puppy extends Entity {
  ball: Ball;
  animations: AnimationClip[];
  mixer: AnimationMixer;
  flightLevel: number;
  deviation: number;
  action: Action;
  currentClip: string | undefined;

  constructor(
    id: string,
    object: Object3D<Event>,
    ball: Ball,
    animations: AnimationClip[],
    mixer: AnimationMixer,
    flightLevel: number,
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc[],
    physics: Physics
  ) {
    super(id, [object], rigidBodyDesc, colliderDesc, true, physics);
    this.ball = ball;
    this.animations = animations;
    this.mixer = mixer;
    this.flightLevel = flightLevel;
    this.deviation = 0;
    this.action = 'idle';
    this.fadeInAnimation(this.getAnimation('idle'));
  }

  static async load(ball: Ball, position: Vector3, physics: Physics) {
    let { model, animations, mixer } = await loadAnimatedModel(
      `assets/models/Puppy/scene.gltf`,
      { scale: 0.008, animation: 15 }
    );
    return new Puppy(
      'puppy',
      model,
      ball,
      animations,
      mixer,
      position.y,
      RigidBodyDesc.newDynamic().setTranslation(
        position.x,
        position.y,
        position.z
      ),
      [
        ColliderDesc.cuboid(0.15, 0.25, 0.3)
          .setTranslation(0, 0.15, 0)
          .setDensity(1.0),
      ],
      physics
    );
  }

  tick(delta: number) {
    super.tick(delta);
    this.mixer.update(delta);
    this.act();
  }

  act() {
    let desire = this.desire(this.ball);
    // console.log(desire);
    let animation = this.getAnimation(desire);

    this.fadeInAnimation(animation);
    let mass = this.rigidBody?.mass();
    let velocity = this.getVelocity(desire);
    if (this.rigidBody && velocity.length() > 0) {
      let linvel = toVector3(this.rigidBody.linvel());
      let diff = velocity.sub(linvel);
      diff.y = 0; // Don't move in y direction
      if (diff.length() > 0.001) {
        let final = diff.multiplyScalar(mass);

        //console.log({velocity, l: velocity.length()});
        // console.log(linvel, final);
        this.rigidBody.applyImpulse(final, true);
        // TODO: Turn puppy
      }
    }
  }

  vecToBall(ball: Ball): Vector3 {
    // TODO: We should really calculate distance from our head
    let ballPosition = ball.position();
    let myPosition = this.position();
    // console.log({ballPosition, myPosition});
    return ballPosition.clone().sub(myPosition);
  }

  desire(ball: Ball): Action {
    let ballVec = this.vecToBall(ball);
    let distance = ballVec.length();
    if (distance > 2) {
      // We want to run
      return { action: 'run', direction: ballVec.normalize() };
    } else if (distance > 0.3) {
      return { action: 'walk', direction: ballVec.normalize() };
    } else {
      // We're close
      return 'idle';
    }
  }

  getAnimation(action: Action): string {
    return 'Arm_Dog|Idle_2';
    if (action === 'idle') {
      return 'Arm_Dog|Idle_2';
    } else if (action.action === 'run') {
      return 'Arm_Dog|Run_R_IP';
    } else if (action.action === 'walk') {
      return 'Arm_Dog|Walk_F_IP';
    }
    throw new Error('impossible');
  }

  getVelocity(action: Action): Vector3 {
    let upPlane = new Vector3(0, 1, 0);
    if (action === 'idle') {
      return new Vector3(0, 0, 0);
    } else if (action.action === 'run') {
      return action.direction.multiplyScalar(0.03).projectOnPlane(upPlane);
    } else if (action.action === 'walk') {
      return action.direction.multiplyScalar(0.01).projectOnPlane(upPlane);
    }
    throw new Error('impossible');
  }

  fadeInAnimation(clipName: string) {
    if (this.currentClip === clipName) {
      return;
    }
    console.log('Fading into ' + clipName);
    this.currentClip = clipName;
    let clip = this.animations.find((animation) => animation.name === clipName);
    if (!clip) {
      throw new Error('Could not find clip: ' + clipName);
    }
    const action = this.mixer.clipAction(clip);
    action.fadeIn(1);
    let puppy = this;
    this.mixer.addEventListener('loop', function (e) {
      // puppy.rigidCcolliderObject.position.set(translation.x, translation.y, translation.z);
    });
  }
}
