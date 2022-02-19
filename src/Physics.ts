import type * as Rapier from '@dimforge/rapier3d';
import { Entity } from './Entity';

export class Physics {
  rapier: typeof Rapier;
  world: Rapier.World;

  constructor(rapier: typeof Rapier, world: Rapier.World) {
    this.rapier = rapier;
    this.world = world;
  }

  static async boot(): Promise<Physics> {
    let rapier = await import('@dimforge/rapier3d');
    let gravity = { x: 0.0, y: -9.81, z: 0.0 };
    let world = new rapier.World(gravity);
    return new Physics(rapier, world);
  }

  trackEntity(entity: Entity) {
    let rigidBodyDesc = this.rapier.RigidBodyDesc.newDynamic();
    let body = this.world.createRigidBody(rigidBodyDesc);
    let colliderDesc = this.rapier.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    let collider = this.world.createCollider(colliderDesc, body.handle);
  }
}
