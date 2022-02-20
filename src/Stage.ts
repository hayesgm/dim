import {
  Object3D,
  Group,
  Mesh,
  PerspectiveCamera,
  Ray,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { createCamera } from './components/camera';
import { createScene } from './components/scene';
import { createLights } from './components/lights';
import { VRController, TriggerEvent } from './components/vrcontroller';

import { OrbitControls, createControls } from './systems/controls';
import { Interceptor } from './systems/Interceptor';
import { Loop } from './systems/Loop';
import { createRenderer } from './systems/renderer';
import { Resizer } from './systems/Resizer';
import { getRose } from './systems/rose';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Panel } from './components/Panel';
import { Ball } from './components/Ball';
import { Bird } from './components/Bird';
import { Floor } from './components/Floor';
import { Physics } from './Physics';

let i = 0;

export class Stage {
  private container: Element;
  private cameraGroup: Group;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private renderer: WebGLRenderer;
  private loop: Loop;
  private controls: OrbitControls;
  private physics: Physics;
  private rose: Object3D;
  private debugPanel: Panel;

  constructor(container: Element) {
    this.container = container;
    let { cameraGroup, camera } = createCamera();
    this.cameraGroup = cameraGroup;
    this.camera = camera;
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    this.controls = createControls(this.camera, this.renderer.domElement);
    this.physics = new Physics();
    this.debugPanel = new Panel(new Vector2(0.6, 0.6), new Vector3(-0.5, 0.6, -1), 1);
    this.rose = getRose();
    this.rose.visible = false;
    container.append(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    const resizer = new Resizer(container, this.camera, this.renderer);

    this.renderer.domElement.addEventListener('click', (event) =>
      this.handlePointer(container, event.clientX, event.clientY)
    );

    window.addEventListener('keypress', (event) =>
      this.handleKeycode(event.code)
    );

    this.debug("test1");
    this.debug("test2");
  }

  async load() {
    let controllerLeft = new VRController(
      'left',
      1,
      this.renderer,
      'darkslateblue',
      this.handleTrigger.bind(this)
    );
    let controllerRight = new VRController(
      'right',
      0,
      this.renderer,
      'firebrick',
      this.handleTrigger.bind(this)
    );

    const { ambientLight, mainLight } = createLights();
    let targets: Object3D<Event>[] = [];
    let targeted = false;

    let entities = await Promise.all([
      Bird.load('Parrot', new Vector3(0, 0, 0.25), this.physics),
      Bird.load('Flamingo', new Vector3(0.75, 0, -1), this.physics),
      Bird.load('Stork', new Vector3(0, -0.25, -1), this.physics),
      Floor.load(
        new Vector3(50, 0.0001, 50),
        new Vector3(0, -0.5, 0),
        this.physics
      ),
      Ball.load(0.07, new Vector3(0.75, 0, -0.5), this.physics),
    ]);
    for (let entity of entities) {
      if (entity) {
        this.loop.updatables.push(entity);
        this.scene.add(...entity.sceneObjects());
        if (!targeted) {
          this.controls.target.copy(entity.object.position);
          targeted = true;
        }
      }
    }

    // Shrink ray
    let interceptor0 = new Interceptor(
      controllerLeft.controller,
      targets,
      ({ object }) => {
        if (controllerLeft.selecting) {
          object.scale.multiplyScalar(0.99);
        }
      }
    );

    // Grow ray
    let interceptor1 = new Interceptor(
      controllerRight.controller,
      targets,
      ({ object }) => {
        if (controllerRight.selecting) {
          object.scale.multiplyScalar(1.01);
        }
      }
    );

    this.loop.updatables.push(
      this,
      this.controls as any,
      interceptor0,
      interceptor1,
      this.physics
    ); // TODO

    this.cameraGroup.add(...controllerLeft.sceneObjects(), ...controllerRight.sceneObjects());

    this.scene.add(ambientLight, mainLight, this.rose, this.cameraGroup, ...this.debugPanel.sceneObjects());
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  tick() {
    // Nothing
  }

  debug(message: string) {
    this.debugPanel.appendText("Debug: " + message);
  }

  handlePointer(container: Element, cx: number, cy: number) {
    this.debug("Click");
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    let el = this.renderer.domElement;
    let x = (cx / container.clientWidth) * 2 - 1;
    let y = -(cy / container.clientHeight) * 2 + 1;
    let entity = this.physics.castRay(
      ...this.getRayFromCamera(new Vector2(x, y))
    );
    if (entity) {
      entity.debug();
    }
  }

  handleTrigger({id, event, orientation}: TriggerEvent) {
    this.debug("Trigger " + id + " " + event);
    let entity = this.physics.castRay(
      orientation.origin,
      orientation.direction
    );
    if (entity) {
      entity.debug();
    }
  }

  getRayFromCamera(coords: Vector2): [Vector3, Vector3] {
    if (this.camera.isPerspectiveCamera) {
      let ray = new Ray();
      ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
      ray.direction
        .set(coords.x, coords.y, 0.5)
        .unproject(this.camera)
        .sub(ray.origin)
        .normalize();
      return [ray.origin, ray.direction];
    } else {
      throw new Error(
        'THREE.Raycaster: Unsupported camera type: ' + this.camera.type
      );
    }
  }

  handleKeycode(code: string) {
    switch (code) {
      case 'KeyR':
        if (this.rose) {
          this.rose.visible = !this.rose.visible;
        }
        break;
      default:
        break;
    }
  }
}
