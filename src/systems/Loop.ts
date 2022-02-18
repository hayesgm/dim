import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export interface Updatable {
  tick: (delta: number) => void;
}

export class Loop {
  private clock: Clock;
  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  updatables: Updatable[];

  constructor(camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer) {
    this.clock = new Clock();
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
    const delta = this.clock.getDelta();

    for (let updatable of this.updatables) {
      updatable.tick(delta);
    }
  }
}
