import { Vector2, Vector3 } from 'three';
import type * as Rapier from '@dimforge/rapier3d';
import { Entity } from './Entity';
import { Stage } from './Stage';
import {
  EventQueue,
  World,
  Ray,
  RigidBody,
  RigidBodyDesc,
  Collider,
  ColliderDesc,
} from '@dimforge/rapier3d-compat';

interface PhysicalEntity {
  uuid: string;
  entity: Entity;
  rigidBody: RigidBody;
  colliders: Collider[];
}

export class Physics {
  world: World;
  entities: Map<string, PhysicalEntity>;
  colliderIndex: Map<number, string>;
  lastStep: number;
  collidersShowing: boolean;
  stage: Stage;

  constructor(stage: Stage) {
    let gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new World(gravity);
    this.entities = new Map();
    this.colliderIndex = new Map();
    this.lastStep = 0;
    this.collidersShowing = false;
    this.stage = stage;
  }

  track(entity: Entity) {
    let rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
    let colliders: Collider[] = [];
    for (let colliderDesc of entity.colliderDescs) {
      let collider = this.world.createCollider(
        colliderDesc,
        rigidBody.handle
      );
      this.colliderIndex.set(collider.handle, entity.uuid);
      colliders.push(collider);
    }
    this.entities.set(entity.uuid, {
      uuid: entity.uuid,
      entity,
      rigidBody,
      colliders,
    });
    return {
      rigidBody,
      colliders
    }
  }

  castRay(
    origin: Vector3,
    direction: Vector3,
    maxToi: number = 40.0,
    solid: boolean = true,
    groups: number = 0xffffffff
  ): Entity | undefined {
    let ray = new Ray(origin, direction);
    let hit = this.world.castRay(ray, maxToi, solid, groups);
    if (hit) {
      let entityUUID = this.colliderIndex.get(hit.colliderHandle);
      if (!entityUUID) {
        throw new Error(`Missing colliderIndex for ${hit.colliderHandle}`);
      }
      let entityInfo = this.entities.get(entityUUID);
      if (!entityInfo) {
        throw new Error(`Missing entityInfo for ${entityUUID}`);
      }
      return entityInfo.entity;
    }
  }

  tick(delta: number) {
    this.world.timestep = delta;
    let eventQueue = new EventQueue(true);
    this.world.step(eventQueue);
    eventQueue.drainIntersectionEvents((handle1, handle2, intersecting) => {
      let entityUUID1 = this.colliderIndex.get(handle1);
      if (entityUUID1) {
        let entity1 = this.entities.get(entityUUID1);
        if (entity1) {
          entity1.entity.handleCollision(handle1, handle2, intersecting);
        }
      }

      let entityUUID2 = this.colliderIndex.get(handle2);
      if (entityUUID2) {
        let entity2 = this.entities.get(entityUUID2);
        if (entity2) {
          entity2.entity.handleCollision(handle1, handle2, intersecting);
        }
      }
      // this.stage.debug(`handle1: ${handle1}, handle2: ${handle2}, intersecting: ${intersecting}, entityUUID1: ${entityUUID1}, entityUUID2: ${entityUUID2}`);
    });
  }

  toggleColliders() {
    this.collidersShowing = !this.collidersShowing;
    for (let entityObject of this.entities.values()) {
      entityObject.entity.showCollider(this.collidersShowing);
    }
  }
}
