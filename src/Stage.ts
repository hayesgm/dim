import {
  Object3D,
  Event,
  Group,
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
import { VRController, TriggerEvent } from './components/VRController';

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
import { Entity } from './Entity';
import { buildNumber } from './systems/build';

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
  private entities: Map<string, Entity>;

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
    this.debugPanel = new Panel(
      new Vector2(1.2, 1.2),
      new Vector3(-0.5, 0.6, -0.5)
    );
    this.debug('Build ' + buildNumber);
    this.rose = getRose();
    this.rose.visible = false;
    this.entities = new Map();
    container.append(this.renderer.domElement);
    container.appendChild(VRButton.createButton(this.renderer));

    const resizer = new Resizer(container, this.camera, this.renderer);

    this.renderer.domElement.addEventListener('click', (event) =>
      this.handlePointer(container, event.clientX, event.clientY)
    );

    window.addEventListener('keypress', (event) =>
      this.handleKeycode(event.code)
    );
  }

  async load() {
    const { ambientLight, mainLight } = createLights();
    let targets: Object3D<Event>[] = [];
    let targeted = false;

    let entities = await Promise.all([
      Bird.load('Parrot', new Vector3(0, 0, 0.25), this.physics),
      new VRController(
        'lcontroller',
        1,
        this.renderer,
        this.handleTrigger.bind(this),
        this.cameraGroup,
        this.physics,
        this
      ),
      new VRController(
        'rcontroller',
        0,
        this.renderer,
        this.handleTrigger.bind(this),
        this.cameraGroup,
        this.physics,
        this
      ),
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
        this.entities.set(entity.id, entity);
        this.loop.updatables.push(entity);
        console.log(entity.id, entity.sceneObjects());
        let sceneObjects: Object3D<Event>[] = entity.sceneObjects();
        for (let sceneObject of sceneObjects) {
          this.scene.add(sceneObject);
        }

        if (!targeted) {
          this.controls.target.copy(entity.objects[0].position);
          targeted = true;
        }
      }
    }

    this.loop.updatables.push(this, this.controls as any, this.physics); // TODO

    this.scene.add(
      ambientLight,
      mainLight,
      this.rose,
      this.cameraGroup,
      ...this.debugPanel.sceneObjects()
    );
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
    console.debug(message);
    this.debugPanel.appendText('Debug: ' + message);
  }

  handlePointer(container: Element, cx: number, cy: number) {
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

  handleTrigger({ id, event, orientation }: TriggerEvent) {
    if (event === 'squeezestart' && id === 'lcontroller') {
      this.toggleDebugPanel();
    } else if (event === 'selectstart' && id === 'lcontroller') {
      this.physics.toggleColliders();
    } else if (event === 'squeezestart' && id === 'rcontroller') {
      let ball = this.entities.get('ball')!;
      let rcontroller = this.entities.get('rcontroller')!;
      console.log({ ball, rcontroller });
      if (ball) {
        ball.track(rcontroller);
      }
    } else if (event === 'squeezeend' && id === 'rcontroller') {
      let ball = this.entities.get('ball')!;
      let rcontroller = this.entities.get('rcontroller')! as VRController;
      if (ball) {
        let velocity = rcontroller.getAverageVelocity().multiplyScalar(1.3);
        this.debug(`Velocity+: x=${velocity.x.toFixed(3)},y=${velocity.y.toFixed(3)},z=${velocity.z.toFixed(3)}`);
        ball.rigidBody.setTranslation(rcontroller.position(), false);
        ball.rigidBody.setLinvel(velocity, true);
        ball.track(null);
      }
    } else if (event === 'selectstart' && id === 'rcontroller') {
      let entity = this.physics.castRay(
        orientation.origin,
        orientation.direction
      );
      if (entity) {
        entity.debug();
      }
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
        this.toggleRose();
        break;
      case 'KeyD':
        this.toggleDebugPanel();
      case 'KeyC':
        this.physics.toggleColliders();
      default:
        break;
    }
  }

  toggleRose() {
    this.rose.visible = !this.rose.visible;
  }

  toggleDebugPanel() {
    this.debugPanel.toggleVisibility();
  }
}
