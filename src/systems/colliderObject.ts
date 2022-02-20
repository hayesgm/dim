import {
  BoxBufferGeometry,
  BufferGeometry,
  CylinderGeometry,
  Event,
  LineSegments,
  Matrix4,
  Object3D,
  SphereGeometry,
  Quaternion,
  WireframeGeometry,
} from 'three';
import { Ball, Capsule, ColliderDesc, Cuboid } from '@dimforge/rapier3d-compat';

export function getColliderObject(desc: ColliderDesc): { geometry: BufferGeometry, line: Object3D<Event> } {
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
  } else if (desc.shape instanceof Capsule) {
    geometry = new CylinderGeometry(
      desc.shape.radius,
      desc.shape.radius,
      desc.shape.halfHeight * 2
    );
  } else {
    throw new Error(`Cannot compute collider object for collider: ${desc}`);
  }
  geometry.applyQuaternion(new Quaternion(desc.rotation.w, desc.rotation.x, desc.rotation.y, desc.rotation.z));
  let translation = new Matrix4();
  translation.makeTranslation(desc.translation.x, desc.translation.y, desc.translation.z);
  geometry.applyMatrix4(translation);
  const wireframe = new WireframeGeometry(geometry);
  const line = new LineSegments(wireframe);
  return { geometry, line };
}
