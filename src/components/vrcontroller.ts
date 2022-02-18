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
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRInputSource } from "webxr";

const controllerModelFactory = new XRControllerModelFactory();

export function getTrackingObject(source: XRInputSource): Object3D {
  let geometry, material;

  switch (source.targetRayMode) {
    case "tracked-pointer":
      geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        "color",
        new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      material = new LineBasicMaterial({
        vertexColors: true,
        blending: AdditiveBlending,
      });

      return new Line(geometry, material);

    case "gaze":
      geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new MeshBasicMaterial({ opacity: 0.5, transparent: true });
      return new Mesh(geometry, material);
    default:
      throw new Error(`Unknown targetRayMode: ${source.targetRayMode}`);
  }
}

export function buildControllerGrip(
  renderer: WebGLRenderer,
  index: number
): Group {
  let controllerGrip = renderer.xr.getControllerGrip(index);
  controllerGrip.add(
    controllerModelFactory.createControllerModel(controllerGrip)
  );
  return controllerGrip;
}

export function buildController(
  renderer: WebGLRenderer,
  index: number,
  group: Group
) {
  let controller = renderer.xr.getController(index);
  // controller.addEventListener('selectstart', onSelectStart);
  // controller.addEventListener('selectend', onSelectEnd);
  controller.addEventListener("connected", function (event) {
    let tracker = getTrackingObject(event.data);
    console.log({tracker});
    group.add(tracker);
  });
}
