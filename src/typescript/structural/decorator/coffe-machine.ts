interface ICoffeeMachine {
  getCost(): number;
  getDescription(): string;
  prepare(): void;
}

class SimpleCoffee implements ICoffeeMachine {
  getCost(): number {
    return 100;
  }

  getDescription(): string {
    return "Coffee";
  }

  prepare() {
    console.log("preparing coffee");
  }
}

class CoffeeDecorator implements ICoffeeMachine {
  constructor(protected readonly wrapped: ICoffeeMachine) {}

  getCost(): number {
    return this.wrapped.getCost();
  }

  getDescription(): string {
    return this.wrapped.getDescription();
  }

  prepare(): void {
    this.wrapped.prepare();
  }
}

class MilkDecorator extends CoffeeDecorator {
  override getCost(): number {
    return this.wrapped.getCost() + 20;
  }

  override getDescription(): string {
    return "Milk" + "-" + this.wrapped.getDescription();
  }

  override prepare(): void {
    this.wrapped.prepare();
    console.log("Adding milk");
  }
}

class SugarDecorator extends CoffeeDecorator {
  override getCost(): number {
    return this.wrapped.getCost() + 10;
  }

  override getDescription(): string {
    return "Sugar" + "-" + this.wrapped.getDescription();
  }

  override prepare(): void {
    this.wrapped.prepare();
    console.log("Adding Sugar");
  }
}

class WhippedCreamDecorator extends CoffeeDecorator {
  override getCost(): number {
    return this.wrapped.getCost() + 30;
  }

  override getDescription(): string {
    return "WhippedCream" + "-" + this.wrapped.getDescription();
  }

  override prepare(): void {
    this.wrapped.prepare();
    console.log("Adding Whipped Cream");
  }
}

const doubleMilkCoffee: ICoffeeMachine = new MilkDecorator(
  new MilkDecorator(new SimpleCoffee()),
);

doubleMilkCoffee.prepare();
console.log("Coffee: ", doubleMilkCoffee.getDescription());
