import {
  Computer,
  ComputerBuilderInitialState,
  IComputerBuilder,
} from "./builder.js";

export class ComputerDirector {
  public buildGamingComputer(
    builder: IComputerBuilder<ComputerBuilderInitialState>,
  ): Computer {
    return builder
      .setCpu("AMD Ryzen 9 9950X")
      .setRam(64)
      .setStorage(240)
      .setGpu("NVIDIA RTX 5090")
      .enableWifi()
      .enableBluetooth()
      .build();
  }
}
