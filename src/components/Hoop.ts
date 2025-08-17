import {
  AnimationMixer,
  Object3D,
  Euler,
  Event,
  MathUtils,
  Quaternion,
  Vector3,
} from 'three';
import { loadModel, splitOff } from '../systems/model';
import { Physics } from '../Physics';
import {
  ActiveEvents,
  RigidBodyDesc,
  ColliderDesc,
  CoefficientCombineRule,
} from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';
import { Stage } from '../Stage';

function getRotation(
  x: number,
  y: number,
  z: number,
  order = 'XYZ'
): Quaternion {
  let q = new Quaternion();
  let euler = new Euler(
    MathUtils.degToRad(x),
    MathUtils.degToRad(y),
    MathUtils.degToRad(z),
    order
  );
  q.setFromEuler(euler);
  return q;
}

export class Rim extends Entity {
  stage: Stage;
  intersectingTop: boolean;

  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
    physics: Physics,
    stage: Stage
  ) {
    super('rim', [object], rigidBodyDesc, colliderDescs, false, physics);
    this.stage = stage;
    this.intersectingTop = false;
  }

  handleCollision(handle1: number, handle2: number, intersecting: boolean) {
    // this.stage.debug(`hoop: ${this.id}, handle1: ${handle1}, handle2: ${handle2}, intersecting: ${intersecting}`);
    let upperRimSensor = this.colliders[0].handle;
    let lowerRimSensor = this.colliders[1].handle;
    // TODO: Check other handle is ball

    if (
      intersecting &&
      (handle1 === upperRimSensor || handle2 === upperRimSensor)
    ) {
      this.intersectingTop = true;
      // this.stage.debug("Intersecting top...");
    }

    if (
      intersecting &&
      (handle1 === lowerRimSensor || handle2 === lowerRimSensor)
    ) {
      if (this.intersectingTop) {
        this.stage.points += 2;
        this.stage.debug(`Bucket! Points: ${this.stage.points}`);
      } else {
        // this.stage.debug(`No shooting low`);
      }
      this.intersectingTop = false;
    }
  }
}

export class Hoop extends Entity {
  stage: Stage;

  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
    physics: Physics,
    stage: Stage
  ) {
    super('hoop', [object], rigidBodyDesc, colliderDescs, false, physics);
    this.stage = stage;
  }

  static async load(
    size: number,
    position: Vector3,
    rotation: Euler,
    physics: Physics,
    stage: Stage
  ): Promise<[Hoop, Rim]> {
    let hoopModel = await loadModel(`assets/models/Hoop/scene.gltf`, { size });
    let rimModel = splitOff(hoopModel, 'Ring');
    rimModel.scale.copy(hoopModel.scale);
    // todo: split off net
    let q = new Quaternion();
    q.setFromEuler(rotation);

    let rimRadius = 0.12 / 2;
    let segmentCount = 50;
    let rimCollider = [...new Array(segmentCount)].map((el, i) => {
      let angle = (i * 2 * Math.PI) / segmentCount;
      let pX = Math.sin(angle) * rimRadius;
      let pZ = Math.cos(angle) * rimRadius;
      return ColliderDesc.ball(size * 0.003)
        .setRestitution(1.5)
        .setRestitutionCombineRule(CoefficientCombineRule.Max)
        .setCollisionGroups(0)
        .setTranslation(
          size * (0 + pX),
          0,
          size * (-rimRadius + pZ)
        );
    });

    let rimOffset = new Vector3(0, size * -0.13, size * -0.01);
    let rimPosition = new Vector3(position.x + rimOffset.x, position.y + rimOffset.y, position.z + rimOffset.z);
    let jointPosition = new Vector3(rimPosition.x, rimPosition.y + size * 0.83, rimPosition.z + size * 0.415);
    let rimColliderTranslation = new Vector3(size * 0, size * 0, -size * rimRadius);
    let rimColliderOffsetY = size * 0.1;
    let rimLocation = new Vector3(jointPosition.x, jointPosition.y, jointPosition.z + 5);
    console.log("Joint Position", jointPosition.x, jointPosition.y, jointPosition.z);
    console.log("Collider Position", (size * 0) - jointPosition.x, (size * 0.78) - jointPosition.y, (size * 0.01) - jointPosition.z);
    let hoop = new Hoop(
      hoopModel,
      RigidBodyDesc.newDynamic()
        .setTranslation(jointPosition.x, jointPosition.y, jointPosition.z),
      [
        // Base
        // ColliderDesc.cuboid(size * 0.25, size * 0.2, size * 0.25)
        //   .setDensity(10)
        //   .setRestitution(1.5)
        //   .setRestitutionCombineRule(CoefficientCombineRule.Min)
        //   .setTranslation(size * 0, size * 0.125, size * 0.25),
        // // Spine Base
        // ColliderDesc.cuboid(size * 0.1, size * 0.4, size * 0.05)
        //   .setDensity(3)
        //   .setRestitution(1.5)
        //   .setRestitutionCombineRule(CoefficientCombineRule.Min)
        //   .setTranslation(size * 0, size * 0.4, size * 0.23),
        // // Spine Turn
        // ColliderDesc.cuboid(size * 0.02, size * 0.25, size * 0.04)
        //   .setDensity(3)
        //   .setRestitution(1.5)
        //   .setRestitutionCombineRule(CoefficientCombineRule.Min)
        //   .setTranslation(size * 0, size * 0.6, size * 0.23)
        //   .setRotation(getRotation(0, 0, 48)),
        // // Spine Top
        // ColliderDesc.cuboid(size * 0.02, size * 0.25, size * 0.04)
        //   .setDensity(3)
        //   .setRestitution(1.5)
        //   .setRestitutionCombineRule(CoefficientCombineRule.Min)
        //   .setTranslation(size * 0, size * 0.68, size * 0)
        //   .setRotation(getRotation(0, 0, 90)),
        // // Spine Connector
        // ColliderDesc.cuboid(size * 0.03, size * 0.25, size * 0.04)
        //   .setDensity(3)
        //   .setRestitution(1.5)
        //   .setRestitutionCombineRule(CoefficientCombineRule.Min)
        //   .setTranslation(size * 0, size * 0.68, size * -0.2)
        //   .setRotation(getRotation(0, 0, 90)),
        // Backboard
        ColliderDesc.cuboid(size * 0.42, size * 0.25, size * 0.03)
          .setTranslation((size * 0) - jointPosition.x, (size * 0.78) - jointPosition.y, (size * 0.01) - jointPosition.z),
        // ColliderDesc.ball(size * 0.04)
        //   .setTranslation(0, 0, 0)
        //   .setActiveEvents(0)
        //   .setSensor(true),
      ],
      physics,
      stage
    );

    let rim = new Rim(
      rimModel,
      RigidBodyDesc.newDynamic()
        .setTranslation(rimLocation.x, rimLocation.y, rimLocation.z),
      [
        // Uppper Rim Sensor
        // ColliderDesc.ball(size * 0.03)
        //   .setTranslation(rimColliderTranslation.x, rimColliderTranslation.y + rimColliderOffsetY / 2, rimColliderTranslation.z)
        //   .setActiveEvents(ActiveEvents.INTERSECTION_EVENTS)
        //   .setSensor(true),
        // // Lower Rim Sensor
        // ColliderDesc.ball(size * 0.03)
        //   .setTranslation(rimColliderTranslation.x, rimColliderTranslation.y - rimColliderOffsetY / 2, rimColliderTranslation.z)
        //   .setActiveEvents(ActiveEvents.INTERSECTION_EVENTS)
        //   .setSensor(true),
        // ColliderDesc.ball(size * 0.04)
        //   .setTranslation(0, 0, 0)
        //   .setActiveEvents(0)
        //   .setSensor(true),
        //...rimCollider,
      ],
      physics,
      stage
    );
    hoop.jointLocation = jointPosition;
    rim.jointLocation = rimPosition;

    return [hoop, rim];
  }

  tick(delta: number) {
    super.tick(delta);
  }
}
