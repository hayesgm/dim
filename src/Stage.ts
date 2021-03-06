import {
  Object3D,
  Event,
  Euler,
  Group,
  MathUtils,
  PerspectiveCamera,
  Ray,
  Quaternion,
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
import { Basketball } from './components/Basketball';
import { Hoop, Rim } from './components/Hoop';
import { Floor } from './components/Floor';
import { Puppy } from './components/Puppy';
import { Physics } from './Physics';
import { Entity } from './Entity';
import { buildNumber } from './systems/build';

import {
  JointData
} from '@dimforge/rapier3d-compat';

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
  points: number;

  constructor(container: Element) {
    this.container = container;
    let { cameraGroup, camera } = createCamera();
    this.cameraGroup = cameraGroup;
    this.camera = camera;
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer);
    container.append(this.renderer.domElement);
    this.controls = createControls(this.camera, this.renderer.domElement);
    this.physics = new Physics(this);
    this.debugPanel = new Panel(
      new Vector2(1.2, 1.2),
      new Vector3(-0.9, 0.6, -2)
    );
    this.debug('Build ' + buildNumber);
    this.rose = getRose();
    this.rose.visible = false;
    this.entities = new Map();
    this.points = 0;
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

    let ball = await Basketball.load(0.18, new Vector3(0.75, 0, -0.5), this.physics);
    let entities = (await Promise.all([
      Hoop.load(2.5, new Vector3(0, 2.5, -1), new Euler(MathUtils.degToRad(0), MathUtils.degToRad(180), MathUtils.degToRad(0), 'XYZ'), this.physics, this),
      ball,
      new VRController(
        'lcontroller',
        0,
        this.renderer,
        this.handleTrigger.bind(this),
        this.cameraGroup,
        this.physics,
        this
      ),
      new VRController(
        'rcontroller',
        1, // TODO: Figure out order
        this.renderer,
        this.handleTrigger.bind(this),
        this.cameraGroup,
        this.physics,
        this
      ),
      Floor.load(
        new Vector3(20, 0.001, 20),
        new Vector3(0, -0.5, 0),
        this.physics
      ),
    ])).flat();
    for (let entity of entities) {
      if (entity) {
        this.entities.set(entity.id, entity);
        this.loop.updatables.push(entity);
        console.log(entity.id, entity.sceneObjects(), entity.position(), entity.group);
        let sceneObjects: Object3D<Event>[] = entity.sceneObjects();
        for (let sceneObject of sceneObjects) {
          this.scene.add(sceneObject);
        }
      }
    }

    let k = { x: 1.0, y: 0.0, z: 0.0 };
    let hoop = this.entities.get('hoop')!;
    let rim = this.entities.get('rim')!;
    let rotation = new Quaternion();
    rotation.setFromEuler(new Euler(1.0, 0, 0));

    let params = JointData.revolute(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 1.0, y: 0, z: 0 }
    );
    let joint = this.physics.world.createImpulseJoint(params, hoop.rigidBody, rim.rigidBody);

    this.controls.target.copy(this.entities.get('basketball')!.position());

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
      entity.toggleDebug();
    }
  }

  handleTrigger({ id, event, orientation }: TriggerEvent) {
    if (event === 'squeezestart' && id === 'lcontroller') {
      this.toggleDebugPanel();
    } else if (event === 'selectstart' && id === 'lcontroller') {
      this.physics.toggleColliders();
    } else if (event === 'squeezestart' && id === 'rcontroller') {
      let ball = this.entities.get('basketball')!;
      let rcontroller = this.entities.get('rcontroller')!;
      console.log({ ball, rcontroller });
      if (ball) {
        ball.track(rcontroller);
      }
    } else if (event === 'squeezeend' && id === 'rcontroller') {
      let ball = this.entities.get('basketball')!;
      let rcontroller = this.entities.get('rcontroller')! as VRController;
      if (ball) {
        let velocity = rcontroller.getAverageVelocity().multiplyScalar(1.3);
        // this.debug(`Velocity+: x=${velocity.x.toFixed(3)},y=${velocity.y.toFixed(3)},z=${velocity.z.toFixed(3)}`);
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
        entity.toggleDebug();
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
