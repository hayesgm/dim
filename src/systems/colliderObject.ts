import {
  BoxBufferGeometry,
  BufferGeometry,
  Event,
  LineSegments,
  Object3D,
  SphereGeometry,
  WireframeGeometry,
} from 'three';
import { Ball, ColliderDesc, Cuboid } from '@dimforge/rapier3d-compat';

export function getColliderObject(desc: ColliderDesc): Object3D<Event> {
  let geometry: BufferGeometry;
  if (desc.shape instanceof Cuboid) {
    geometry = new BoxBufferGeometry(
      desc.shape.halfExtents.x,
      desc.shape.halfExtents.y,
      desc.shape.halfExtents.z
    );
  } else if (desc.shape instanceof Ball) {
    geometry = new SphereGeometry(
      desc.shape.radius,
      10,
      10
    );
  } else {
    throw new Error(`Cannot compute collider object for collider: ${desc}`);
  }
  const wireframe = new WireframeGeometry(geometry);
  const line = new LineSegments(wireframe);
  return line;
}
