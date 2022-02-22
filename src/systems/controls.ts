import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createControls(camera: PerspectiveCamera, canvas: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  console.log({controls});
  controls.enableDamping = true;
  (controls as any).tick = () => controls.update();
  return controls;
}
