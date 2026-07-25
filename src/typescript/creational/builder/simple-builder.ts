import { Computer, ComputerProps } from "./builder.js";

// simple builder

class ComputerBuilder {
  private computerSpecs: Omit<ComputerProps, "cpu" | "ram" | "storage">;

  constructor(
    private readonly cpu: string,
    private readonly ram: number,
    private readonly storage: number,
  ) {
    this.computerSpecs = {
      gpu: "",
      wifi: false,
      bluetooth: false,
    };
  }

  // add or replaces gpu
  setGPU(gpu: NonNullable<ComputerProps["gpu"]>) {
    this.computerSpecs.gpu = gpu;
  }

  enableWifi() {
    this.computerSpecs.wifi = true;
  }

  enableBluetooth() {
    this.computerSpecs.bluetooth = true;
  }

  build() {
    return new Computer(this.cpu, this.ram, this.storage, this.computerSpecs);
  }
}


