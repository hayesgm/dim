import {
  BoxBufferGeometry,
  Event,
  Object3D,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three';

interface Sceneable {
  sceneObjects(): Object3D<Event>[];
}

export class Panel {
  lines: string[];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private object: Sprite;
  private texture: Texture;
  private material: SpriteMaterial;
  private size: Vector2;
  private visible_: boolean;
  private fontSize: number;
  private rendered: number;

  constructor(size: Vector2, position: Vector3, scale: number) {
    this.lines = [];
    this.canvas = document.createElement('canvas')!;
    this.size = size;
    this.canvas.width = size.x;
    this.canvas.height = size.y;
    this.context = this.canvas.getContext('2d')!;
    this.fontSize = 30;
    this.rendered = 0;

    this.texture = new Texture(this.canvas);
    this.material = new SpriteMaterial({ map: this.texture });
    this.object = new Sprite(this.material);
    this.object.position.set(position.x, position.y, position.z);
    this.object.scale.set(scale, scale, 1);
    this.visible_ = true;
    // document.body.appendChild(this.canvas);
  }

  appendText(text: string) {
    this.lines.push(text);
    this.displayText();
  }

  displayText(clear: boolean = false) {
    if (clear) {
      this.rendered = 0;
      this.context.clearRect(0, 0, this.size.x, this.size.y);
    }
    // let metrics = this.context.measureText(this.text);
    // let textWidth = metrics.width;
    // let textHeight = this.fontSize;
    this.context.font = 'normal ' + this.fontSize + 'px Arial';
    this.context.textAlign = 'left';
    this.context.textBaseline = 'top';
    this.context.fillStyle = '#ff0000';

    for (let i = this.rendered; i < this.lines.length; i++) {
      this.context.fillText(this.lines[i], 0, i * this.fontSize);
      this.texture.needsUpdate = true;
      this.material.map = this.texture;
      this.material.map!.needsUpdate = true;
    }
    this.rendered = this.lines.length;
  }

  sceneObjects(): Object3D<Event>[] {
    return [this.object];
  }

  setVisibility(show: boolean = true) {
    this.object.visible = this.visible_ = show;
  }
}
