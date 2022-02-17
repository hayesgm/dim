import { AmbientLight, PointLight, Scene } from "three";

export function ambientLight(color: number, intensity: number = 1) {
  return new AmbientLight(color); // soft white light
}

export function addPointLight(
  color: number,
  position: [number, number, number],
  scene: Scene,
  intensity = 1,
  distance = 100,
  decay = 1
) {
  const light = new PointLight(color, intensity, distance, decay);
  light.position.set(position[0], position[1], position[2]);
  scene.add(light);
}
