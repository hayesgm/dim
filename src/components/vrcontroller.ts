import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RingGeometry,
  Scene,
  WebGLRenderer,
} from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRInputSource } from 'webxr';

const controllerModelFactory = new XRControllerModelFactory();

function getTrackingObject(source: XRInputSource, material: LineBasicMaterial): Line {
  let geometry;

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

export class Controller {
  name: string;
  controller: Group;
  grip: Group;
  tracker: Line | undefined;
  selecting: boolean;
  offMaterial: LineBasicMaterial;
  onMaterial: LineBasicMaterial;

  constructor(name: string, index: number, renderer: WebGLRenderer, onColor: string) {
    this.name = name;

    this.offMaterial = new LineBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
    });

    this.onMaterial = new LineBasicMaterial({
      vertexColors: true,
      blending: AdditiveBlending,
      color: onColor
    });

    let controller = renderer.xr.getController(index);
    let controllerObject = this;
    controller.addEventListener('connected', function (event) {
      let tracker = getTrackingObject(event.data, controllerObject.offMaterial);
      controllerObject.tracker = tracker;
      controller.add(tracker);
    });
    controller.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller.addEventListener('selectend', this.onSelectEnd.bind(this));
    this.controller = controller;

    this.grip = renderer.xr.getControllerGrip(index);
    this.grip.add(controllerModelFactory.createControllerModel(this.grip));

    this.selecting = false;
  }

  onSelectStart() {
    console.log('sel start', this.name, this.selecting, this.tracker);
    this.selecting = true;
    if (this.tracker) {
      this.tracker.material = this.onMaterial;
    }
  }

  onSelectEnd() {
    console.log('sel end', this.name, this.selecting, this.tracker);
    this.selecting = false;
    if (this.tracker) {
      this.tracker.material = this.offMaterial;
    }
  }

  sceneObjects(): Group[] {
    return [this.controller, this.grip];
  }
}
