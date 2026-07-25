import {
  Computer,
  ComputerBuilderCompleteState,
  ComputerBuilderInitialState,
  ComputerBuilderState,
  ComputerProps,
  GpuRequired,
  IComputerBuilder,
  InvalidCpu,
  InvalidGpu,
  InvalidRam,
  InvalidStorage,
  WithCpu,
  WithRam,
  WithStorage,
} from "./builder.js";

// Type-Safe (Staged) Builder
export class StagedComputerBuilder<
  State extends ComputerBuilderState = ComputerBuilderInitialState,
> implements IComputerBuilder<State> {
  declare private readonly _state: State;

  private readonly computerSpecs: Partial<ComputerProps> = {
    wifi: false,
    bluetooth: false,
  };

  private static validateCpu(
    cpu: NonNullable<ComputerProps["cpu"]>,
  ): NonNullable<ComputerProps["cpu"]> {
    if (typeof cpu !== "string" || !cpu.trim()) throw new InvalidCpu();
    return cpu.trim();
  }

  setCpu(
    cpu: NonNullable<ComputerProps["cpu"]>,
  ): StagedComputerBuilder<WithCpu<State>> {
    this.computerSpecs.cpu = cpu;
    return this as StagedComputerBuilder<WithCpu<State>>;
  }

  private static validateRam(
    ram: NonNullable<ComputerProps["ram"]>,
  ): NonNullable<ComputerProps["ram"]> {
    if (ram < 4 || typeof ram !== "number" || !Number.isFinite(ram)) {
      throw new InvalidRam();
    }
    return ram;
  }

  setRam(
    ram: NonNullable<ComputerProps["ram"]>,
  ): StagedComputerBuilder<WithRam<State>> {
    this.computerSpecs.ram = ram;
    return this as StagedComputerBuilder<WithRam<State>>;
  }

  private static validateStorage(
    storage: NonNullable<ComputerProps["storage"]>,
  ): NonNullable<ComputerProps["storage"]> {
    if (
      typeof storage !== "number" ||
      storage < 128 ||
      !Number.isFinite(storage)
    ) {
      throw new InvalidStorage();
    }
    return storage;
  }

  setStorage(
    storage: NonNullable<ComputerProps["storage"]>,
  ): StagedComputerBuilder<WithStorage<State>> {
    this.computerSpecs.storage = storage;
    return this as StagedComputerBuilder<WithStorage<State>>;
  }

  private static validateGpu(
    gpu: NonNullable<ComputerProps["gpu"]>,
  ): NonNullable<ComputerProps["gpu"]> {
    if (typeof gpu !== "string" || !gpu.trim()) throw new InvalidGpu();
    return gpu.trim();
  }

  // add or replaces gpu
  setGpu(gpu: NonNullable<ComputerProps["gpu"]>): this {
    this.computerSpecs.gpu = gpu;
    return this;
  }

  enableWifi(): this {
    this.computerSpecs.wifi = true;
    return this;
  }

  enableBluetooth(): this {
    this.computerSpecs.bluetooth = true;
    return this;
  }

  disableWifi(): this {
    this.computerSpecs.wifi = false;
    return this;
  }

  private static crossSpecValidation(
    computerSpecs: Partial<ComputerProps>,
  ): asserts computerSpecs is ComputerProps {
    if (!computerSpecs.cpu) {
      throw new InvalidCpu();
    }

    if (!computerSpecs.ram) {
      throw new InvalidRam();
    }

    if (!computerSpecs.storage) {
      throw new InvalidStorage();
    }

    computerSpecs.cpu = StagedComputerBuilder.validateCpu(computerSpecs.cpu);
    computerSpecs.ram = StagedComputerBuilder.validateRam(computerSpecs.ram);
    computerSpecs.storage = StagedComputerBuilder.validateStorage(
      computerSpecs.storage,
    );

    if (computerSpecs.gpu) {
      computerSpecs.gpu = StagedComputerBuilder.validateGpu(computerSpecs.gpu);
    }

    if (
      computerSpecs.ram &&
      computerSpecs.ram > 64 &&
      computerSpecs.gpu === undefined
    ) {
      throw new GpuRequired();
    }
  }

  build(this: StagedComputerBuilder<ComputerBuilderCompleteState>): Computer {
    StagedComputerBuilder.crossSpecValidation(this.computerSpecs);
    const computerSpecs = this.computerSpecs;
    const { cpu, ram, storage, ...specs } = computerSpecs;
    return new Computer(cpu, ram, storage, specs);
  }
}
