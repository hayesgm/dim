import {
  AdditiveBlending,
  BufferGeometry,
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

const controllerModelFactory = new XRControllerModelFactory();

export interface TriggerEvent {
  id: string;
  event: 'selectstart' | 'selectend';
  orientation: {
    origin: Vector3;
    direction: Vector3;
  };
}

export class VRController {
  id: string;
  triggerHandler: (event: TriggerEvent) => void;

  constructor(
    id: string,
    index: number,
    renderer: WebGLRenderer,
    onColor: string,
    triggerHandler: (event: TriggerEvent) => void
  ) {
    this.id = id;

    let controller = renderer.xr.getController(index);
    let vrcontroller = this;
    controller.addEventListener('connected', function (event) {
      let tracker = getTrackingObject(event.data, vrcontroller.offMaterial);
      vrcontroller.tracker = tracker;
      controller.add(tracker);
    });
    controller.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller.addEventListener('selectend', this.onSelectEnd.bind(this));
    this.controller = controller;

    this.grip = renderer.xr.getControllerGrip(index);
    this.grip.add(controllerModelFactory.createControllerModel(this.grip));

    this.triggerHandler = triggerHandler;

    this.selecting = false;
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
    console.log('sel start', this.id, this.selecting, this.tracker);
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'selectstart',
    });
    this.selecting = true;
    if (this.tracker) {
      this.tracker.material = this.onMaterial;
    }
  }

  onSelectEnd() {
    console.log('sel end', this.id, this.selecting, this.tracker);
    this.triggerHandler({
      id: this.id,
      orientation: this.getOrientation(),
      event: 'selectend',
    });
    this.selecting = false;
    if (this.tracker) {
      this.tracker.material = this.offMaterial;
    }
  }

  sceneObjects(): Group[] {
    return [this.controller, this.grip];
  }
}