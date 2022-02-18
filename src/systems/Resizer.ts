import { PerspectiveCamera, WebGLRenderer } from 'three';

const setSize = (
  container: Element,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
};

export class Resizer {
  constructor(
    container: Element,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer
  ) {
    // Set the camera's aspect ratio
    setSize(container, camera, renderer);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(container, camera, renderer);
    });
  }
}
