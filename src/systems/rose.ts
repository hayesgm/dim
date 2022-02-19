import {
  BufferGeometry,
  Event,
  Group,
  Line,
  LineBasicMaterial,
  Object3D,
  Vector3,
} from 'three';

export function getRose(): Object3D<Event> {
  let group = new Group();
  const material = new LineBasicMaterial({
    color: 0x0000ff,
  });

  [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
  ].forEach((dir) => {
    const points = [];
    points.push(new Vector3(0, 0, 0));
    points.push(dir);

    const geometry = new BufferGeometry().setFromPoints(points);
    let line = new Line(geometry, material);
    group.add(line);
  });

  return group;
}
