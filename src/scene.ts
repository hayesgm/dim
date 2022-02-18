import {
  Camera,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { loadModel } from "./model";
import { ambientLight } from "./light";
import { DirectionalLight, HemisphereLight } from "three";
import { buildController, buildControllerGrip } from "./control";

export async function loadSceneGeometry(
  scene: Scene,
  camera: Camera,
  renderer: WebGLRenderer
) {
  const geometry = new BoxGeometry();
  const material = new MeshBasicMaterial({ color: 0xff0000 });
  const cube = new Mesh(geometry, material);
  cube.position.z = -10;
  cube.position.y = 5;
  scene.add(cube);
  scene.add(ambientLight(0x404040, 100));
  let hemiLight = new HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 300, 0);
  scene.add(hemiLight);

  let dirLight = new DirectionalLight(0xffffff);
  dirLight.position.set(75, 300, -75);
  scene.add(dirLight);

  camera.position.z = 5;
  camera.position.y = 0;

  
  scene.add(sub);

  let controllerGrip0 = buildControllerGrip(renderer, 0);
  let controllerGrip1 = buildControllerGrip(renderer, 1);

  scene.add(controllerGrip0);
  scene.add(controllerGrip1);

  buildController(renderer, 0, scene);
  buildController(renderer, 1, scene);

  renderer.setAnimationLoop(() => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    sub.rotation.y += 0.0003;
    renderer.render(scene, camera);
  });
}
