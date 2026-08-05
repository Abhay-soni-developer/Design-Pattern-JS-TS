// Component
interface Drawable {
  draw(): void;
}

abstract class Shape implements Drawable {
  protected name: string;

  constructor() {
    this.name = new.target.name;
  }

  abstract draw(): void;
  abstract getArea(): number;
}

//leaf
class Circle extends Shape {
  protected radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  override draw(): void {
    console.log(
      `${this.name} with radius ${this.radius} is drawn on the screen`,
    );
  }

  override getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

//leaf
class Rectangle extends Shape {
  protected height: number;
  protected width: number;

  constructor(height: number, width: number) {
    super();
    this.height = height;
    this.width = width;
  }

  override draw(): void {
    console.log(
      `${this.name} with height ${this.height} cm & with ${this.width} cm is being drawn`,
    );
  }

  override getArea(): number {
    return this.height * this.width;
  }
}

// composite
class Group implements Drawable {
  private children: Drawable[] = [];

  draw(): void {
    this.children.forEach((group) => {
      group.draw();
    });
  }

  add(object: Drawable): void {
    this.children.push(object);
  }
}

const groupA = new Group();
groupA.add(new Circle(5));
groupA.add(new Rectangle(10, 5));
const groupB = new Group();
groupB.add(new Circle(6));
groupB.add(groupA);
groupB.draw();
