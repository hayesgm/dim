import { Group, Object3D, Event, Vector3 } from 'three';
import { MathUtils } from 'three';
import { getColliderObject } from './systems/colliderObject';
import { Physics } from './Physics';
import {
  Collider,
  RigidBody,
  RigidBodyDesc,
  ColliderDesc,
  Cuboid,
} from '@dimforge/rapier3d-compat';

export class Entity {
  uuid: string;
  id: string;
  group: Group;
  objects: Object3D<Event>[];
  colliderObject: Object3D<Event>;
  rigidBodyDesc: RigidBodyDesc;
  colliderDesc: ColliderDesc;
  rigidBody: RigidBody;
  collider: Collider;
  debugging: boolean;
  trackEntity: Entity | null;

  constructor(
    id: string,
    objects: Object3D<Event>[],
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc,
    physics: Physics,
  ) {
    this.uuid = MathUtils.generateUUID();
    this.id = id;
    // TODO: Handle group better
    this.group = new Group();
    this.objects = objects;
    for (let object of objects) {
      this.group.add(object);
    }
    this.rigidBodyDesc = rigidBodyDesc;
    this.colliderDesc = colliderDesc;
    this.colliderObject = getColliderObject(this.colliderDesc);
    let { rigidBody, collider } = physics.track(this);
    this.rigidBody = rigidBody;
    this.collider = collider;
    this.debugging = false;
    this.trackEntity = null;
  }

  debug() {
    console.log(this);
    console.log("Entity stored in 'entity' var...");
    (window as any).entity = this;
    this.debugging = !this.debugging;
    this.showCollider(this.debugging);
  }

  showCollider(show: boolean = true) {
    console.log({show});
    if (show) {
      this.group.add(this.colliderObject);
    } else {
      this.group.remove(this.colliderObject);
    }
    this.group.updateMatrixWorld(true);
  }

  position(): Vector3 {
    let transaction = this.rigidBody.translation();
    return new Vector3(transaction.x, transaction.y, transaction.z);
  }

  track(entity: Entity | null) {
    this.trackEntity = entity;
  }

  tick(delta: number) {
    if (this.trackEntity) {
      this.rigidBody.setTranslation(this.trackEntity.position(), true);
    }

    let position = this.position();
    this.group.position.set(position.x, position.y, position.z);
  }

  sceneObjects(): Object3D<Event>[] {
    return [
      this.group
    ];
  }
}
