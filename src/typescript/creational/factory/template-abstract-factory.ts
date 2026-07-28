type Theme = {
  name: "light" | "dark";
};

const theme: Theme = {
  name: "light",
};

type EventRecords = {
  onClick?: () => void;
};

interface IComponent {
  readonly componentName: string;
}

type DialogOptions = {
  theme: Theme;
  events: EventRecords;
};

abstract class Button implements IComponent {
  abstract readonly componentName: string;
  abstract applyTheme(theme: Theme): void;
  abstract applyEventHandlers(eventRecords: EventRecords): void;
  abstract render(): void;
}

abstract class Dialog implements IComponent {
  abstract readonly componentName: string;
  // factory-method
  protected abstract createButton(): Button;

  // template-method
  public render(options: DialogOptions): void {
    const button = this.createButton();
    button.applyTheme(options.theme);
    button.applyEventHandlers(options.events);
    button.render();
    console.log(`${this.componentName} rendered`);
  }
}

class WindowsDialog extends Dialog {
  override readonly componentName: string = "Windows-Dialog";
  protected override createButton(): Button {
    return new WindowsButton();
  }
}

class MacDialog extends Dialog {
  override readonly componentName: string = "Mac-Dialog";
  protected override createButton(): Button {
    return new MacButton();
  }
}

class WindowsButton extends Button {
  override readonly componentName: string = "Windows-Button";

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} theme applied to windows button`);
  }
  override applyEventHandlers(events: EventRecords): void {
    console.log("event handlers attached to windows button");
  }

  render(): void {
    console.log("windows button rendered");
  }
}

class MacButton extends Button {
  override readonly componentName: string = "Mac-Button";

  override applyTheme(theme: Theme): void {
    console.log(`${theme.name} theme applied to mac button`);
  }
  override applyEventHandlers(events: EventRecords): void {
    console.log("event handlers attached to mac button");
  }
  render(): void {
    console.log("mac button rendered");
  }
}

const events: EventRecords = {
  onClick: () => console.log("Button Clicked"),
};

const dialog: Dialog = new MacDialog();

dialog.render({
  theme,
  events,
});
