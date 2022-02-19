import { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { loadBirds } from './components/birds';
import { createCamera } from './components/camera';
import { createMeshGroup } from './components/meshGroup';
import { createScene } from './components/scene';
import { createLights } from './components/lights';
import { Controller } from './components/vrcontroller';

import { OrbitControls, createControls } from './systems/controls';
import { Interceptor } from './systems/Interceptor';
import { Loop } from './systems/Loop';
import { createRenderer } from './systems/renderer';
import { Resizer } from './systems/Resizer';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Physics } from './Physics';

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
    let physics = await Physics.boot();
    console.log({physics});
    let controllerLeft = new Controller('left', 1, this.renderer, 'darkslateblue');
    let controllerRight = new Controller('right', 0, this.renderer, 'firebrick');

    const meshGroup = new Group(); // createMeshGroup();
    const { ambientLight, mainLight } = createLights();
    const { parrot, flamingo, stork } = await loadBirds();
    let targets = [parrot, flamingo, stork];
    console.log({parrot});

    // Shrink ray
    let interceptor0 = new Interceptor(controllerLeft.controller, targets, ({object}) => {
      if (controllerLeft.selecting) {
        object.scale.multiplyScalar(0.99);
      }
    });

    // Grow ray
    let interceptor1 = new Interceptor(controllerRight.controller, targets, ({object}) => {
      if (controllerRight.selecting) {
        object.scale.multiplyScalar(1.01);
      }
    });

    this.loop.updatables.push(
      this.controls as any,
      parrot as any,
      flamingo as any,
      stork as any,
      interceptor0,
      interceptor1
    ); // TODO
    // this.loop.updatables.push(cube as any); // TODO

    this.controls.target.copy(parrot.position);
    console.log(parrot);

    this.scene.add(
      meshGroup,
      ambientLight,
      mainLight,
      parrot,
      flamingo,
      stork,
      ...controllerLeft.sceneObjects(),
      ...controllerRight.sceneObjects()
    );
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }
}
