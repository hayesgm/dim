import { Box3, Group, Object3D, Event, Vector2, Vector3 } from 'three';
import { MathUtils } from 'three';
import { getColliderObject } from './systems/colliderObject';
import { Panel } from './components/Panel';
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
  debugPanel: Panel;
  initialBoundingBox: Box3;
  animated: boolean;

  constructor(
    id: string,
    objects: Object3D<Event>[],
    rigidBodyDesc: RigidBodyDesc,
    colliderDesc: ColliderDesc,
    animated: boolean,
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
    let initialBoundingBox = new Box3();
    initialBoundingBox.setFromObject(this.group, true);
    this.initialBoundingBox = initialBoundingBox;
    this.rigidBodyDesc = rigidBodyDesc;
    this.colliderDesc = colliderDesc;
    let { geometry, line } = getColliderObject(this.colliderDesc);
    this.colliderObject = line;
    let { rigidBody, collider } = physics.track(this);
    this.rigidBody = rigidBody;
    this.collider = collider;
    this.debugging = false;
    this.trackEntity = null;
    geometry.computeBoundingBox();
    let colliderBoundingBox = geometry.boundingBox!;
    let width = colliderBoundingBox.max.x - colliderBoundingBox.min.x;
    this.debugPanel = new Panel(new Vector2(0.2, 0.3), new Vector3(colliderBoundingBox.max.x + width * 1.2, colliderBoundingBox.max.y, colliderBoundingBox.min.z));    
    this.animated = animated;
  }

  debug(message: string) {
    this.debugPanel.appendText(message);
  }

  toggleDebug() {
    this.debugging = !this.debugging;

    if (this.debugging) {
      this.group.add(...this.debugPanel.sceneObjects());
    } else {
      this.group.remove(...this.debugPanel.sceneObjects());
    }
    console.log(this);
    console.log("Entity stored in 'entity' var...");
    (window as any).entity = this;
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
      this.rigidBody.sleep();
      this.rigidBody.setTranslation(this.trackEntity.position(), false);
    }

    if (this.animated) {
      let boundingBox = new Box3();
      boundingBox.setFromObject(this.group, true);

      let initMin = this.initialBoundingBox.min.clone();
      initMin.applyMatrix4(this.group.matrixWorld)

      let translation = boundingBox.min.clone().sub(initMin);
      let initialTranslation = this.colliderDesc.translation;
      let initialTranslationVec3 = new Vector3(initialTranslation.x, initialTranslation.y, initialTranslation.z)
      let final = initialTranslationVec3.clone().add(translation);
      this.collider.setTranslationWrtParent(final);
      this.colliderObject.position.set(translation.x, translation.y, translation.z);
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
