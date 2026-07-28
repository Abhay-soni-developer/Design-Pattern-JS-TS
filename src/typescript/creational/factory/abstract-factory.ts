interface Theme {
  name: string;
  Button: {
    color: string;
    size: "lg" | "md" | "sm";
  };
  Checkbox: {
    size: number;
  };
  TextBox: {
    bgColor: string;
  };
}

interface Events {
  onClick?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

type RenderContext = {
  theme: Theme;
  events: Events;
};

abstract class UiFactory {
  abstract createButton(): Button;
  abstract createCheckbox(): Checkbox;
  abstract createTextBox(): TextBox;
}

abstract class UIComponent {
  abstract componentName: string;
  abstract render(): void;
  abstract applyTheme(theme: Theme): void;
  abstract registerEvents(events: Events): void;
}

abstract class Button extends UIComponent {}
abstract class Checkbox extends UIComponent {}
abstract class TextBox extends UIComponent {}

class WindowsButton extends Button {
  override readonly componentName: string = "Windows-Button";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class WindowsCheckbox extends Checkbox {
  override readonly componentName: string = "Windows-Checkbox";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class WindowsTextBox extends TextBox {
  override readonly componentName: string = "Windows-TextBox";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class WindowsUiFactory extends UiFactory {
  override createButton(): Button {
    return new WindowsButton();
  }
  override createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
  override createTextBox(): TextBox {
    return new WindowsTextBox();
  }
}

class MacButton extends Button {
  override readonly componentName: string = "Mac-Button";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class MacCheckbox extends Checkbox {
  override readonly componentName: string = "Mac-Checkbox";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class MacTextBox extends TextBox {
  override readonly componentName: string = "Mac-TextBox";

  override render(): void {
    console.log(`${this.componentName} rendered`);
  }

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} has applied to ${this.componentName}`);
  }

  override registerEvents(event: Events): void {
    console.log("events attached to button");
  }
}

class MacUiFactory extends UiFactory {
  override createButton(): Button {
    return new MacButton();
  }
  override createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
  override createTextBox(): TextBox {
    return new MacTextBox();
  }
}

class Dialog {
  protected children: UIComponent[] = [];
  private mounted: boolean = false;

  constructor(private uiFactory: UiFactory) {
    const factory = this.uiFactory;

    this.children.push(factory.createButton());
    this.children.push(factory.createCheckbox());
    this.children.push(factory.createTextBox());
  }

  mount(renderContext: RenderContext) {
    if (this.mounted) return;
    this.children.forEach((uiComp: UIComponent) => {
      uiComp.applyTheme(renderContext.theme);
      uiComp.registerEvents(renderContext.events);
    });
    this.mounted = true;
  }

  render(renderContext: RenderContext) {
    this.mount(renderContext);
    this.children.forEach((uiComp: UIComponent) => {
      uiComp.render();
    });
  }
}

const macDialog = new Dialog(new MacUiFactory());
const windowsDialog = new Dialog(new WindowsUiFactory());

const theme: Theme = {
  name: "Dark Theme",

  Button: {
    color: "#2563EB",
    size: "md",
  },

  Checkbox: {
    size: 20,
  },

  TextBox: {
    bgColor: "#1F2937",
  },
};

const events: Events = {
  onClick: () => {
    console.log("Component clicked");
  },

  onBlur: () => {
    console.log("Component blurred");
  },

  onFocus: () => {
    console.log("Component focused");
  },
};

const renderContext: RenderContext = {
  theme: theme,
  events: events,
};

macDialog.render(renderContext);
// windowsDialog.render(renderContext);
