import { Group, PerspectiveCamera } from "three";

export function createCamera(): { cameraGroup: Group, camera: PerspectiveCamera } {
  const camera = new PerspectiveCamera(
    35, // fov = Field Of View
    1, // aspect ratio (dummy value)
    0.1, // near clipping plane
    100 // far clipping plane
  );

  let cameraGroup = new Group();
  // move the camera back so we can view the scene
  // camera.position.set(0, 0, 10);
  cameraGroup.position.set(-1.5, 0.75, 2);
  cameraGroup.add(camera);

  return { cameraGroup, camera };
}
