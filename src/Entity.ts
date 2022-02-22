import { Box3, Group, Object3D, Event, Vector2, Vector3, SkeletonHelper, Quaternion } from 'three';
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
  colliderObjects: Object3D<Event>[];
  rigidBodyDesc: RigidBodyDesc;
  colliderDescs: ColliderDesc[];
  rigidBody: RigidBody;
  colliders: Collider[];
  debugging: boolean;
  trackEntity: Entity | null;
  debugPanel: Panel | undefined;
  initialBoundingBox: Box3;
  animated: boolean;
  skeleton?: SkeletonHelper;

  constructor(
    id: string,
    objects: Object3D<Event>[],
    rigidBodyDesc: RigidBodyDesc,
    colliderDescs: ColliderDesc[],
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
    this.colliderDescs = colliderDescs;
    this.colliderObjects = [];
    for (let colliderDesc of this.colliderDescs) {
      let { geometry, line } = getColliderObject(colliderDesc);
      this.colliderObjects.push(line);  

      // TODO: Improve this -- or scrap it?
      geometry.computeBoundingBox();
      let colliderBoundingBox = geometry.boundingBox!;
      let width = colliderBoundingBox.max.x - colliderBoundingBox.min.x;
      this.debugPanel = new Panel(new Vector2(0.2, 0.3), new Vector3(colliderBoundingBox.max.x + width * 1.2, colliderBoundingBox.max.y, colliderBoundingBox.min.z));    
    }

    let { rigidBody, colliders } = physics.track(this);
    this.rigidBody = rigidBody;
    this.colliders = colliders;
    this.debugging = false;
    this.trackEntity = null;
    this.animated = animated;
  }

  generateSkeleton() {
    this.group.updateMatrixWorld(true);
    this.skeleton = new SkeletonHelper(this.group);
    console.log(this.skeleton);
  }

  debug(message: string) {
    this.debugPanel!.appendText(message);
  }

  toggleDebug() {
    this.debugging = !this.debugging;

    if (this.debugging) {
      this.group.add(...this.debugPanel!.sceneObjects());
    } else {
      this.group.remove(...this.debugPanel!.sceneObjects());
    }
    console.log(this);
    console.log("Entity stored in 'entity' var...");
    (window as any).entity = this;
    this.showCollider(this.debugging);
    this.showSkeleton(this.debugging);
  }

  showSkeleton(show: boolean = true) {
    if (!this.skeleton) {
      this.generateSkeleton();
    }
    this.group.remove(this.group.children[0]);
    this.group.add(this.skeleton!);
  }

  showCollider(show: boolean = true) {
    if (show) {
      this.group.add(...this.colliderObjects);
    } else {
      this.group.remove(...this.colliderObjects);
    }
    this.group.updateMatrixWorld(true);
  }

  position(): Vector3 {
    let transaction = this.rigidBody.translation();
    return new Vector3(transaction.x, transaction.y, transaction.z);
  }

  rotation(): Quaternion {
    let rotation = this.rigidBody.rotation();
    return new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  track(entity: Entity | null) {
    this.trackEntity = entity;
  }

  tick(delta: number) {
    if (this.trackEntity) {
      this.rigidBody.sleep();
      this.rigidBody.setTranslation(this.trackEntity.position(), false);
    }

    // if (false) {
    //   let boundingBox = new Box3();
    //   boundingBox.setFromObject(this.group, true);

    //   let initMin = this.initialBoundingBox.min.clone();
    //   initMin.applyMatrix4(this.group.matrixWorld)

    //   let translation = boundingBox.min.clone().sub(initMin);
    //   let initialTranslation = this.colliderDesc.translation;
    //   let initialTranslationVec3 = new Vector3(initialTranslation.x, initialTranslation.y, initialTranslation.z)
    //   let final = initialTranslationVec3.clone().add(translation);
    //   this.collider.setTranslationWrtParent(final);
    //   this.colliderObjects[0].position.set(translation.x, translation.y, translation.z);
    // }

    this.group.position.copy(this.position());
    this.group.rotation.setFromQuaternion(this.rotation());

  }

  sceneObjects(): Object3D<Event>[] {
    return [
      this.group
    ];
  }
}
