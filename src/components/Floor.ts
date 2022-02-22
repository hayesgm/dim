import {
  Mesh,
  BoxBufferGeometry,
  Object3D,
  Event,
  Vector2,
  Vector3,
  RepeatWrapping,
} from 'three';
import { Physics } from '../Physics';
import { loadModel } from '../systems/model';
import { loadMeshStandardMaterial } from '../systems/texture';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import { Entity } from '../Entity';

export class Floor extends Entity {
  constructor(
    object: Object3D<Event>,
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
    physics: Physics
  ) {
    super('floor', [object], rigidBodyDesc, colliderDescs, false, physics);
  }

  static async load(size: Vector3, position: Vector3, physics: Physics) {
    const geometry = new BoxBufferGeometry(size.x, size.y, size.z);
    const material = await loadMeshStandardMaterial(
      'assets/textures/WoodFloor049_4K-JPG/WoodFloor049_4K',
      'acg',
      {
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        repeat: new Vector2(5, 5),
        rotation: Math.PI / 2,
      }
    );
    let object = new Mesh(geometry, material);
    return new Floor(
      object,
      RigidBodyDesc.newStatic().setTranslation(
        position.x,
        position.y,
        position.z
      ),
      [ColliderDesc.cuboid(size.x, size.y, size.z).setTranslation(0, 0, 0)],
      physics
    );
  }
}
