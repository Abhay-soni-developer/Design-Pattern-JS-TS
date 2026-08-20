interface Drawable {
  draw(): void;
}

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

class Tree implements Drawable {
  constructor(
    public x: number,
    public y: number,
    public readonly treeType: TreeType,
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
  private readonly types: Map<string, TreeType> = new Map();

  getTreeType(name: string, color: string, texture: string): TreeType {
    const key = JSON.stringify([name, color, texture]);
    const treeType = this.types.get(key);
    if (treeType) return treeType;
    const newTreeType = new TreeType(name, color, texture);
    this.types.set(key, newTreeType);
    return newTreeType;
  }
}

class Forest implements Drawable {
  private readonly trees: Tree[];;

  constructor(private readonly treeTypeFactory: TreeTypeFactory) {
    this.trees = [];
  }

  plantTree(
    x: number,
    y: number,
    name: string,
    color: string,
    texture: string,
  ): void {
    const treeType = this.treeTypeFactory.getTreeType(name, color, texture);
    const tree = new Tree(x, y, treeType);
    this.trees.push(tree);
  }

  draw(): void {
    for (const tree of this.trees) {
      tree.draw();
    }
  }
}
