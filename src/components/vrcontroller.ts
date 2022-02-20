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
  event: 'selectstart' | 'selectend';
  orientation: {
    origin: Vector3;
    direction: Vector3;
  };
}

export class VRController extends Entity {
  controller: Group;
  grip: Group;
  viewGroup: Group;
  tracker: Object3D<Event> | undefined;
  triggerHandler: (event: TriggerEvent) => void;
  stage: Stage;

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
    let colliderDesc = ColliderDesc.ball(0.1).setDensity(0.5);
    super(id, [], rigidBodyDesc, colliderDesc, physics);

    let controller = renderer.xr.getController(index);
    let vrcontroller = this;
    controller.addEventListener('connected', function (event) {
      let tracker = getPointerObject(event.data);
      vrcontroller.tracker = tracker;
      controller.add(tracker);
    });
    controller.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller.addEventListener('selectend', this.onSelectEnd.bind(this));
    this.controller = controller;

    viewGroup.add(controller);

    this.viewGroup = viewGroup;

    this.grip = grip;
    this.triggerHandler = triggerHandler;
    this.stage = stage;
  }

  tick(delta: number) {
    // super.tick(delta); // Don't do standard procedures
    // let bodyPosition = new Vector3();
    // this.grip.getWorldPosition(bodyPosition);
    // // this.stage.debug(`x: ${bodyPosition.x}, y: ${bodyPosition.y}, z: ${bodyPosition.z}`)
    // this.rigidBody.setTranslation(bodyPosition, true);
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
}
