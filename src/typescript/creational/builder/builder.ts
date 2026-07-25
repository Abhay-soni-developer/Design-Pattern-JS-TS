export type ComputerProps = {
  cpu: string;
  ram: number;
  storage: number;
  gpu?: string;
  wifi?: boolean;
  bluetooth?: boolean;
};

export type ComputerBuilderState = {
  cpu: boolean;
  ram: boolean;
  storage: boolean;
};

export type ComputerBuilderInitialState = {
  cpu: false;
  ram: false;
  storage: false;
};

export type ComputerBuilderCompleteState = {
  cpu: true;
  ram: true;
  storage: true;
};

export type WithCpu<State extends ComputerBuilderState> = {
  cpu: true;
  ram: State["ram"];
  storage: State["storage"];
};

export type WithRam<State extends ComputerBuilderState> = {
  cpu: State["cpu"];
  ram: true;
  storage: State["storage"];
};

export type WithStorage<State extends ComputerBuilderState> = {
  cpu: State["cpu"];
  ram: State["ram"];
  storage: true;
};

export interface IComputerBuilder<
  State extends ComputerBuilderState = ComputerBuilderInitialState,
> {
  setCpu(
    cpu: NonNullable<ComputerProps["cpu"]>,
  ): IComputerBuilder<WithCpu<State>>;

  setRam(
    ram: NonNullable<ComputerProps["ram"]>,
  ): IComputerBuilder<WithRam<State>>;

  setStorage(
    storage: NonNullable<ComputerProps["storage"]>,
  ): IComputerBuilder<WithStorage<State>>;

  setGpu(gpu: NonNullable<ComputerProps["gpu"]>): this;
  enableWifi(): this;
  disableWifi(): this;
  enableBluetooth(): this;

  build(this: IComputerBuilder<ComputerBuilderCompleteState>): Computer;
}

export class Computer {
  readonly gpu: string;
  readonly wifi: boolean;
  readonly bluetooth: boolean;

  constructor(
    readonly cpu: string,
    readonly ram: number,
    readonly storage: number,
    props: Omit<ComputerProps, "cpu" | "ram" | "storage"> = {},
  ) {
    this.gpu = props.gpu ?? "";
    this.wifi = props.wifi ?? false;
    this.bluetooth = props.bluetooth ?? false;
  }
}



export class ComputerBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class GpuRequired extends ComputerBuilderError {
  constructor() {
    super("Computers with more than 64 GB RAM require a GPU");
  }
}

export class InvalidGpu extends ComputerBuilderError {
  constructor() {
    super("Invalid GPU value");
  }
}

export class InvalidCpu extends ComputerBuilderError {
  constructor() {
    super("Invalid CPU value");
  }
}

export class InvalidRam extends ComputerBuilderError {
  constructor() {
    super("Invalid Ram value");
  }
}

export class InvalidStorage extends ComputerBuilderError {
  constructor() {
    super("Invalid Storage Value, Storage must be 128 or greater");
  }
}

