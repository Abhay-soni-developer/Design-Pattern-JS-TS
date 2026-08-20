class TreeType {
  constructor(
    public readonly name: string,
    public readonly color: string,
    public readonly texture: string,
  ) {}

  draw(x: number, y: number) {
    console.log(`drawing tree type ${this.type} at co-ordinates ${x}:${y}`);
  }

  get type() {
    return JSON.stringify([this.name, this.color, this.texture]);
  }
}

class Tree {
  constructor(
    public readonly treeType: TreeType,
    public readonly x: number,
    public readonly y: number,
  ) {}

  draw() {
    this.treeType.draw(this.x, this.y);
  }

  move(coordinates: { x?: number; y?: number }) {
    this.x = coordinates.x ?? this.x;
    this.y = coordinates.y ?? this.y;
  }
}

class TreeTypeFactory {
  private types: Map<string, TreeType> = new Map();

  getTreeType(name: string, color: string, texture: string): TreeType {
    const key = JSON.stringify([name, color, texture]);
    const treeType = this.types.get(key);
    if (treeType) return treeType;
    const newTreeType = new TreeType(name, color, texture);
    this.types.set(key, newTreeType);
    return newTreeType;
  }
}
