import {
  BoxBufferGeometry,
  DoubleSide,
  CanvasTexture,
  Event,
  Object3D,
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three';

interface Sceneable {
  sceneObjects(): Object3D<Event>[];
}

const resolution = 1000;

export class Panel {
  lines: string[];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private object: Mesh;
  private texture: Texture;
  private material: MeshBasicMaterial;
  private size: Vector2;
  private visible_: boolean;
  private fontSize: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private maxLines: number;

  constructor(size: Vector2, position: Vector3, scale: number, maxLines: number = 30) {
    this.lines = [];
    this.maxLines = maxLines;
    this.canvas = document.createElement('canvas')!;
    document.body.appendChild(this.canvas);
    this.size = size;
    this.fontSize = 30;
    this.canvasWidth = this.canvas.width = 1000;
    this.canvasHeight = this.canvas.height = maxLines * this.fontSize;
    this.context = this.canvas.getContext('2d')!;

    let geometry = new PlaneGeometry(size.x, size.y);
    this.texture = new CanvasTexture(this.canvas);
    this.material = new MeshBasicMaterial({ map: this.texture, side: DoubleSide, opacity: 0.8, transparent: true });
    this.object = new Mesh(geometry, this.material);
    this.object.position.set(position.x, position.y, position.z);
    this.setVisibility(false);
    this.displayText();
  }

  appendText(text: string) {
    this.lines.push(text);
    this.displayText();
  }

  displayText() {
    this.context.fillStyle = '#333';
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    // let metrics = this.context.measureText(this.text);
    // let textWidth = metrics.width;
    // let textHeight = this.fontSize;
    this.context.font = 'normal ' + this.fontSize + 'px Arial';
    this.context.textAlign = 'left';
    this.context.textBaseline = 'top';
    this.context.fillStyle = '#aaa';

    let maxLines = this.maxLines;
    [...this.lines].reverse().slice(0, maxLines).forEach((line, i) => {
      this.context.fillText(line, 0, (maxLines - i - 1) * this.fontSize);
    });
    this.texture.needsUpdate = true;
    this.material.map = this.texture;
    this.material.map!.needsUpdate = true;
  }

  sceneObjects(): Object3D<Event>[] {
    return [this.object];
  }

  setVisibility(show: boolean = true) {
    this.object.visible = this.visible_ = show;
  }

  toggleVisibility() {
    this.setVisibility(!this.visible_);
  }
}
