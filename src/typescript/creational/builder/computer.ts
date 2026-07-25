import { ComputerProps } from "./builder.js";

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