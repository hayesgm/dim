import { Physics } from '../Physics';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';
import {
  AdditiveBlending,
  BufferGeometry,
  Event,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RingGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRInputSource } from 'webxr';
import { Stage } from '../Stage';

const controllerModelFactory = new XRControllerModelFactory();

function getPointerObject(source: XRInputSource): Line {
  let geometry;
  let material = new LineBasicMaterial({
    vertexColors: true,
    blending: AdditiveBlending,
    color: 'darkslateblue',
  });

  switch (source.targetRayMode) {
    case 'tracked-pointer':
      geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        'color',
        new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      return new Line(geometry, material);

    default:
      throw new Error(`Unknown targetRayMode: ${source.targetRayMode}`);
  }
}

export interface TriggerEvent {
  id: string;
  event: 'selectstart' | 'selectend' | 'squeezestart' | 'squeezeend';
  orientation: {
    origin: Vector3;
    direction: Vector3;
  };
}

const positionCount = 20;
const skipTime = 0.025;

export class VRController extends Entity {
  controller: Group;
  grip: Group;
  viewGroup: Group;
  gamepad: Gamepad | undefined;
  tracker: Object3D<Event> | undefined;
  triggerHandler: (event: TriggerEvent) => void;
  stage: Stage;
  positionsX: Float32Array;
  positionsY: Float32Array;
  positionsZ: Float32Array;
  positionsTime: Float32Array;
  positionsIndex: number;
  skippedTime: number;

  constructor(
    id: string,
    index: number,
    renderer: WebGLRenderer,
    triggerHandler: (event: TriggerEvent) => void,
    viewGroup: Group,
    physics: Physics,
    stage: Stage,
  ) {
    let grip = renderer.xr.getControllerGrip(index);
    grip.add(controllerModelFactory.createControllerModel(grip));
    console.log({grip});
    viewGroup.add(grip);
    let bodyPosition = new Vector3();
    grip.getWorldPosition(bodyPosition);
    let rigidBodyDesc =
      RigidBodyDesc.newKinematicPositionBased().setTranslation(
        bodyPosition.x,
        bodyPosition.y,
        bodyPosition.z
      );
    let colliderDesc = ColliderDesc.ball(0.1).setCollisionGroups(0);
    super(id, [], rigidBodyDesc, colliderDesc, false, physics);

    let controller = renderer.xr.getController(index);
    let vrcontroller = this;
    controller.addEventListener('connected', function (event) {
      let tracker = getPointerObject(event.data);
      vrcontroller.tracker = tracker;
      controller.add(tracker);
      vrcontroller.gamepad = event.data.gamepad;
    });
    controller.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller.addEventListener('selectend', this.onSelectEnd.bind(this));
    controller.addEventListener('squeezestart', this.onSqueezeStart.bind(this));
    controller.addEventListener('squeezeend', this.onSqueezeEnd.bind(this));
    this.controller = controller;

    viewGroup.add(controller);

    this.viewGroup = viewGroup;

    this.grip = grip;
    this.triggerHandler = triggerHandler;
    this.stage = stage;

    this.positionsX = new Float32Array(positionCount);
    this.positionsY = new Float32Array(positionCount);
    this.positionsZ = new Float32Array(positionCount);
    this.positionsTime = new Float32Array(positionCount);
    this.positionsIndex = 0;
    this.skippedTime = 0;
  }

  tick(delta: number) {
    super.tick(delta); // Don't do standard procedures
    let bodyPosition = new Vector3();
    this.grip.getWorldPosition(bodyPosition);
    this.rigidBody.setTranslation(bodyPosition, true);

    if (document.location.host === 'localhost:8000') {
      bodyPosition = bodyPosition.add(new Vector3(Math.random() * 0.1, Math.random() * 0.1, 2 * Math.random() * 0.1));
    }

    this.skippedTime += delta;

    if (this.skippedTime > skipTime) {
      let pi = this.positionsIndex;
      this.positionsX[pi % positionCount] = bodyPosition.x;
      this.positionsY[pi % positionCount] = bodyPosition.y;
      this.positionsZ[pi % positionCount] = bodyPosition.z;
      this.positionsTime[pi % positionCount] = (this.positionsTime[(positionCount + pi - 1) % positionCount] ?? 0) + this.skippedTime;
      this.positionsIndex++;
      this.skippedTime = 0;
    }
  }

  getOrientation(): { origin: Vector3; direction: Vector3 } {
    let tempMatrix = new Matrix4();
    tempMatrix.identity().extractRotation(this.controller.matrixWorld);
    let origin = new Vector3();

    origin.setFromMatrixPosition(this.controller.matrixWorld);
    let direction = new Vector3(0, 0, -1).applyMatrix4(tempMatrix).normalize();

    return { origin, direction };
  }

  onSelectStart() {
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'selectstart',
    });
  }

  onSelectEnd() {
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'selectend',
    });
  }

  onSqueezeStart() {
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'squeezestart',
    });
  }

  onSqueezeEnd() {
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'squeezeend',
    });
  }

  getAverageVelocity(): Vector3 {
    let pi = this.positionsIndex - 1;
    let deltaX = (this.positionsX[pi % positionCount] ?? 0) - (this.positionsX[(positionCount + pi - 1) % positionCount] ?? 0);
    let deltaY = (this.positionsY[pi % positionCount] ?? 0) - (this.positionsY[(positionCount + pi - 1) % positionCount] ?? 0);
    let deltaZ = (this.positionsZ[pi % positionCount] ?? 0) - (this.positionsZ[(positionCount + pi - 1) % positionCount] ?? 0);
    let deltaTime = (this.positionsTime[pi % positionCount] ?? 0) - (this.positionsTime[(positionCount + pi - 1) % positionCount] ?? 0);

    // console.log({deltaX, deltaY, deltaZ, deltaTime, pi, pt: this.positionsTime, px: this.positionsX, ax: this.positionsX[pi % positionCount], bx: this.positionsX[(positionCount + pi - 1) % positionCount]})
    if (deltaTime === 0) {
      return new Vector3(0, 0, 0);
    } else {
      return new Vector3(deltaX, deltaY, deltaZ).multiplyScalar(1 / deltaTime);
    }
  }
}
