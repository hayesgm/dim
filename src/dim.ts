import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { loadSceneGeometry } from "./scene";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

let width = window.innerWidth;
let height = window.innerHeight;

const scene = new Scene();
const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

loadSceneGeometry(scene, camera, renderer);

document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;
