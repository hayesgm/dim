import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { loadBirds } from './components/birds';
import { createCamera } from './components/camera';
import { createMeshGroup } from './components/meshGroup';
import { createScene } from './components/scene';
import { createLights } from './components/lights';
import { buildController, buildControllerGrip } from './components/vrcontroller';

import { OrbitControls, createControls } from './systems/controls';
import { Loop } from './systems/Loop';
import { createRenderer } from './systems/renderer';
import { Resizer } from './systems/Resizer';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class World {
  private container: Element;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private renderer: WebGLRenderer;
  private loop: Loop;
  private controls: OrbitControls;

  constructor(container: Element) {
    this.container = container;
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    this.controls = createControls(this.camera, this.renderer.domElement);
    container.append(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    const resizer = new Resizer(container, this.camera, this.renderer);
  }

  async load() {
    let controllerGrip0 = buildControllerGrip(this.renderer, 0);
    let controllerGrip1 = buildControllerGrip(this.renderer, 1);

    buildController(this.renderer, 0, this.scene);
    buildController(this.renderer, 1, this.scene);

    const meshGroup = new Group(); // createMeshGroup();
    const { ambientLight, mainLight } = createLights();
    const { parrot, flamingo, stork } = await loadBirds();

    this.loop.updatables.push(this.controls as any, parrot as any, flamingo as any, stork as any); // TODO
    // this.loop.updatables.push(cube as any); // TODO

    this.controls.target.copy(parrot.position);
    console.log(parrot);

    this.scene.add(meshGroup, ambientLight, mainLight, parrot, flamingo, stork, controllerGrip0, controllerGrip1);
  }

  start() {
    this.loop.start();
  }

  stop () {
    this.loop.stop();
  }
}
