import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export interface Updatable {
  tick: () => void;
}

export class Loop {
  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  updatables: Updatable[];

  constructor(camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    for (let updatable of this.updatables) {
      updatable.tick();
    }
  }
}
