import { WebGLRenderer } from 'three';

export function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });

  renderer.xr.enabled = true;
  renderer.physicallyCorrectLights = true;

  return renderer;
}
