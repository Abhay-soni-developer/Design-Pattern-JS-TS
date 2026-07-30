interface IStyle {
  backgroundColor: string;
  borderRadius: string;
  fontSize: number;
}

interface Cloneable {
  clone(): Cloneable;
}

class Style implements IStyle, Cloneable {
  constructor(
    public backgroundColor: string,
    public borderRadius: string,
    public fontSize: number,
  ) {}

  clone(): Style {
    return new Style(this.backgroundColor, this.borderRadius, this.fontSize);
  }
}

class Position {
  constructor(
    public x: number,
    public y: number,
  ) {}

  shift(dx: number, dy: number): Position {
    return new Position(this.x + dx, this.y + dy);
  }
}

interface IComponent {
  id: string;
  name: string;
  style: Style;
  position: Position;
}

abstract class Component implements Cloneable, IComponent {
  constructor(
    public id: string,
    public name: string,
    public style: Style,
    public position: Position,
  ) {}

  abstract clone(): Component;
}

class Button extends Component {
  clone(): Button {
    const randomId = crypto.randomUUID();
    return new Button(
      randomId,
      this.name,
      this.style.clone(),
      this.position.shift(20, 20),
    );
  }
}
class Checkbox extends Component {
  override clone(): Checkbox {
    const randomId = crypto.randomUUID();

    return new Checkbox(
      randomId,
      this.name,
      this.style.clone(),
      this.position.shift(20, 20),
    );
  }
}
class TextBox extends Component {
  override clone(): TextBox {
    const randomId = crypto.randomUUID();

    return new TextBox(
      randomId,
      this.name,
      this.style.clone(),
      this.position.shift(20, 20),
    );
  }
}

class ComponentRegistry {
  private registry: Map<string, Component> = new Map();

  register(name: string, component: Component): Component {
    if (this.registry.has(name)) throw new Error("name already registered");
    this.registry.set(name, component);
    return component;
  }

  create(name: string): Component | null {
    const prototype = this.registry.get(name);
    if (prototype) return prototype.clone();
    return null;
  }
}

const componentRegistry = new ComponentRegistry();

componentRegistry.register(
  "primary-button",
  new Button(
    crypto.randomUUID(),
    "Submit",
    new Style("#007bff", "8px", 16),
    new Position(10, 20),
  ),
);

componentRegistry.register(
  "danger-button",
  new Button(
    crypto.randomUUID(),
    "Delete",
    new Style("#dc3545", "8px", 16),
    new Position(30, 20),
  ),
);

componentRegistry.register(
  "success-button",
  new Button(
    crypto.randomUUID(),
    "Save",
    new Style("#28a745", "8px", 16),
    new Position(50, 20),
  ),
);

componentRegistry.register(
  "checkbox",
  new Checkbox(
    crypto.randomUUID(),
    "Accept Terms",
    new Style("#ffffff", "4px", 14),
    new Position(100, 100),
  ),
);

componentRegistry.register(
  "textbox",
  new TextBox(
    crypto.randomUUID(),
    "Username",
    new Style("#f5f5f5", "6px", 14),
    new Position(150, 100),
  ),
);