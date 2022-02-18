import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createCamera } from './components/camera';
import { createCube } from './components/cube';
import { createScene } from './components/scene';
import { createLights } from './components/lights.js';

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

  constructor(container: Element) {
    this.container = container;
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    container.append(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    const resizer = new Resizer(container, this.camera, this.renderer);
  }

  async load() {
    const cube = createCube();
    const light = createLights();

    this.loop.updatables.push(cube as any); // TODO

    this.scene.add(cube, light);
  }

  start() {
    this.loop.start();
  }

  stop () {
    this.loop.stop();
  }
}
