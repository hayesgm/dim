import { AmbientLight, DirectionalLight, HemisphereLight } from 'three';

export function createLights(): { ambientLight: HemisphereLight, mainLight: DirectionalLight } {
  const ambientLight = new HemisphereLight(
    'white', // bright sky color
    'darkslategrey', // dim ground color
    2, // intensity
  );

  const mainLight = new DirectionalLight('gray', 8);
  mainLight.position.set(10, 10, 10);
  mainLight.target.position.set(7.5, 0, -5);

  return { ambientLight, mainLight };
}
