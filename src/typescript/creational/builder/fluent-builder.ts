// fluent builder
// Fail-fast validation validates individual values in constructors and setter methods.
// this one is fail fast

import {
  Computer,
  ComputerProps,
  GpuRequired,
  InvalidCpu,
  InvalidGpu,
  InvalidRam,
  InvalidStorage,
} from "./builder.js";

export class ComputerBuilder {
  private readonly computerSpecs: ComputerProps;

  constructor(cpu: string, ram: number, storage: number) {
    this.computerSpecs = {
      cpu: ComputerBuilder.validateCpu(cpu),
      ram: ComputerBuilder.validateRam(ram),
      storage: ComputerBuilder.validateStorage(storage),
    };

    this.computerSpecs.wifi = false;
    this.computerSpecs.bluetooth = false;
  }

  private static validateCpu(
    cpu: NonNullable<ComputerProps["cpu"]>,
  ): NonNullable<ComputerProps["cpu"]> {
    if (typeof cpu !== "string" || !cpu.trim()) throw new InvalidCpu();
    return cpu.trim();
  }

  setCpu(cpu: NonNullable<ComputerProps["cpu"]>): this {
    this.computerSpecs.cpu = ComputerBuilder.validateCpu(cpu).trim();
    return this;
  }

  private static validateRam(
    ram: NonNullable<ComputerProps["ram"]>,
  ): NonNullable<ComputerProps["ram"]> {
    if (ram < 4 || typeof ram !== "number" || !Number.isFinite(ram)) {
      throw new InvalidRam();
    }
    return ram;
  }

  setRam(ram: NonNullable<ComputerProps["ram"]>): this {
    this.computerSpecs.ram = ComputerBuilder.validateRam(ram);
    return this;
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

  setStorage(storage: NonNullable<ComputerProps["storage"]>): this {
    this.computerSpecs.storage = ComputerBuilder.validateStorage(storage);
    return this;
  }

  private static validateGpu(
    gpu: NonNullable<ComputerProps["gpu"]>,
  ): NonNullable<ComputerProps["gpu"]> {
    if (typeof gpu !== "string" || !gpu.trim()) throw new InvalidGpu();
    return gpu.trim();
  }

  // add or replaces gpu
  setGpu(gpu: NonNullable<ComputerProps["gpu"]>): this {
    this.computerSpecs.gpu = ComputerBuilder.validateGpu(gpu).trim();
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
    computerSpecs: ComputerProps,
  ): ComputerProps {
    if (computerSpecs.ram > 64 && !Boolean(computerSpecs.gpu)) {
      throw new GpuRequired();
    }

    return computerSpecs;
  }

  build(): Computer {
    const { cpu, ram, storage, ...specs } = ComputerBuilder.crossSpecValidation(
      this.computerSpecs,
    );
    return new Computer(cpu, ram, storage, specs);
  }
}
