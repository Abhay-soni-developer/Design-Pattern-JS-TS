// component
interface Purchasable {
  getPrice(): number;
  getFinalPrice(): number;
  generateInvoice(): Invoice;
}

interface Invoice {
  readonly name: string;
  readonly quantity: number;
  readonly price: number;
  readonly finalPrice: number;
  readonly items?: readonly Invoice[];
}

interface Eatable {
  eat(): void;
}

abstract class Item implements Purchasable, Eatable {
  protected readonly name: string;
  protected price: number;
  protected discount: number;
  protected quantity: number;

  constructor(price: number, discount: number, quantity: number = 1) {
    this.name = new.target.name;
    this.price = price;
    this.discount = discount;
    this.quantity = quantity;
  }

  generateInvoice(): Invoice {
    return {
      name: this.name,
      quantity: this.quantity,
      price: this.getPrice(),
      finalPrice: this.getFinalPrice(),
    };
  }

  setQuantity(quantity: number) {
    this.quantity = quantity;
  }

  getPrice(): number {
    return this.price * this.quantity;
  }

  getFinalPrice(): number {
    const discountRate = this.discount;
    if (
      !Number.isFinite(discountRate) ||
      discountRate < 0 ||
      discountRate > 100
    ) {
      throw new Error("discount rate should be within 0 to 100");
    }
    return (this.getPrice() / 100) * (100 - this.discount);
  }

  abstract eat(): void;
}

class Burger extends Item {
  eat() {
    console.log("yum yum burger crunch");
  }
}

class Pizza extends Item {
  eat() {
    console.log("yum yum cheesy pizza");
  }
}

class Coke extends Item {
  eat() {
    console.log("sip sip chilling cold");
  }
}

class Combo implements Purchasable {
  private readonly name: string;
  protected readonly items: Purchasable[] = [];
  protected discountRate: number;

  constructor(name: string, discountRate: number) {
    this.name = name;
    this.discountRate = discountRate;
  }

  generateInvoice(): Invoice {
    const invoices = this.items.map((purchasable: Purchasable) =>
      purchasable.generateInvoice(),
    );

    return {
      name: this.name,
      quantity: 1,
      price: this.getPrice(),
      finalPrice: this.getFinalPrice(),
      items: invoices,
    };
  }

  getPrice(): number {
    return this.items.reduce(
      (sum, purchasable) => purchasable.getPrice() + sum,
      0,
    );
  }

  getFinalPrice(): number {
    const discountRate = this.discountRate;
    if (
      !Number.isFinite(discountRate) ||
      discountRate < 0 ||
      discountRate > 100
    ) {
      throw new Error("discount rate should be within 0 to 100");
    }

    const discountedPrice = this.items.reduce(
      (sum, purchasable) => purchasable.getFinalPrice() + sum,
      0,
    );

    return (discountedPrice / 100) * (100 - discountRate);
  }

  add(purchasable: Purchasable) {
    this.items.push(purchasable);
  }
}

function createFamilyCombo(
  overallDiscount = 0,
  discountOnBurger = 10,
  discountOnPizza = 0,
  priceMenu = itemPriceMenu,
): Combo {
  const familyCombo = new Combo("Family Combo", overallDiscount);
  familyCombo.add(new Burger(priceMenu.burger, discountOnBurger, 3));
  familyCombo.add(new Pizza(priceMenu.pizza, discountOnPizza));
  return familyCombo;
}

function createMegaCombo(
  discountOnBurger = 10,
  discountOnCoke = 0,
  priceMenu = itemPriceMenu,
  familyComboParam: Parameters<typeof createFamilyCombo>,
): Combo {
  const megaCombo = new Combo("Mega Combo", 0);
  const familyCombo = createFamilyCombo(...familyComboParam);
  megaCombo.add(familyCombo);
  megaCombo.add(new Burger(priceMenu.burger, discountOnBurger));
  megaCombo.add(new Coke(priceMenu.coke, discountOnCoke));
  return megaCombo;
}

const itemPriceMenu = {
  burger: 100,
  pizza: 200,
  coke: 50,
};

console.log(createFamilyCombo(10).getFinalPrice());
console.log(createFamilyCombo(10).generateInvoice());
