// 1. Prototype<T> interface.
// 2. Style implementing Prototype<Style>.
// 3. Button implementing Prototype<Button>.
// 4. clone() for both.

abstract class Cloneable<T> {
  abstract clone(): T;
}

class Style extends Cloneable<Style> {
  constructor(
    public color: string,
    public borderRadius: number,
  ) {
    super();
  }

  override clone(): Style {
    return new Style(this.color, this.borderRadius);
  }
}

class Button extends Cloneable<Button> {
  constructor(
    public title: string,
    // we do not whether this is shareable or not, but will take as shareable
    public style: Style,
  ) {
    super();
  }

  override clone(): Button {
    return new Button(this.title, this.style.clone());
  }
}
