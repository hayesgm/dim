import { Vector2, Vector3 } from 'three';
import type * as Rapier from '@dimforge/rapier3d';
import { Entity } from './Entity';
import {
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
  collider: Collider;
}

const stepDelta = 0.003;

export class Physics {
  world: World;
  entities: Map<string, PhysicalEntity>;
  colliderIndex: Map<number, string>;
  lastStep: number;

  constructor() {
    let gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new World(gravity);
    this.world.timestep = stepDelta;
    this.entities = new Map();
    this.colliderIndex = new Map();
    this.lastStep = 0;
  }

  track(entity: Entity) {
    let rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
    let collider = this.world.createCollider(
      entity.colliderDesc,
      rigidBody.handle
    );
    this.colliderIndex.set(collider.handle, entity.uuid);
    this.entities.set(entity.uuid, {
      uuid: entity.uuid,
      entity,
      rigidBody,
      collider,
    });
    return {
      rigidBody,
      collider
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
    this.lastStep = this.lastStep + delta;
    if (this.lastStep > stepDelta) {
      this.world.step();
      this.lastStep = 0;
    }
  }
}
