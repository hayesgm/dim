import { Color, Event, Group, Intersection, MeshStandardMaterial, Matrix4, Mesh, Object3D, Raycaster } from 'three';

export type TargetAction = (target: Intersection<Object3D<Event>>) => void;

export class Interceptor {
  raycaster: Raycaster;
  tempMatrix: Matrix4;
  controller: Group;
  targets: Object3D<Event>[];
  action: TargetAction;
  currentIntersections: Map<string, () => void>

  constructor(controller: Group, targets: Object3D<Event>[], action: TargetAction) {
    this.raycaster = new Raycaster();
    this.tempMatrix = new Matrix4();
    this.controller = controller;
    this.targets = targets;
    this.action = action;
    this.currentIntersections = new Map();
  }

  getIntersections(): Intersection<Object3D<Event>>[] {
    this.tempMatrix.identity().extractRotation(this.controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(this.controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

    return this.raycaster.intersectObjects(this.targets, false);
    // return this.targets.filter((t) => Math.random() < 0.0005).map((x) => ({ object: x })) as any;
  }

  tick(delta: number) {
    let intersections = this.getIntersections();
    let intersectionsUUIDs = new Set(...intersections.map((intersection) => intersection.object.uuid));
    let newIntersections = intersections.filter((intersection) => {
      return !this.currentIntersections.has(intersection.object.uuid);
    });

    let missingIntersections = [...this.currentIntersections.keys()].filter((uuid) => {
      return !intersectionsUUIDs.has(uuid)
    });

    if (intersections.length > 0 || newIntersections.length > 0 || missingIntersections.length > 0) {
      console.log({intersections, newIntersections, missingIntersections});
    }

    missingIntersections.forEach((uuid) => {
      this.currentIntersections.get(uuid)?.();
      this.currentIntersections.delete(uuid);
    })

    newIntersections.forEach(({object}) => {
      let undo = () => {};
      if (object instanceof Mesh) {
        let oldColor = object.material.color;
        undo = () => {
          object.material.color.set(oldColor);
        };
        object.material.color.set('red');
      }
      this.currentIntersections.set(object.uuid, undo);
    });

    for (let intersection of intersections) {
      this.action(intersection);
    }
  }
}
