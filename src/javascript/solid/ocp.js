// OPEN-CLOSE principle

import { ORDER_TYPE, ITEMS, CATEGORIES, SIZES } from "./ecommerce.js";

export class Specification {
  constructor() {
    if (new.target === Specification) {
      throw new Error("abstract class");
    }
  }

  isSatisfied(item) {
    throw new Error(`method not implement in ${this.constructor.name} class`);
  }

  or(spec) {
    return new OrCombinator(this, spec);
  }

  and(spec) {
    return new AndCombinator(this, spec);
  }

  not() {
    return new NotCombinator(this);
  }
}

export class ColorSpecification extends Specification {
  constructor(color) {
    super();
    this.color = color;
  }

  isSatisfied(item) {
    return item.color === this.color;
  }
}

export class SizeSpecification extends Specification {
  constructor(size) {
    super();
    this.size = size;
  }

  isSatisfied(item) {
    return item.size === this.size;
  }
}

export class CategorySpecification extends Specification {
  constructor(category) {
    super();
    if (!CATEGORIES.includes(category)) {
      throw new Error(`${category} does not exist`);
    }
    this.category = category;
  }

  isSatisfied(item) {
    return item.category === this.category;
  }
}

export class MultiColorSpecification extends Specification {
  constructor(...colors) {
    super();
    this.colors = colors;
  }

  isSatisfied(item) {
    return this.colors.includes(item.color);
  }
}

export class AndCombinator extends Specification {
  constructor(leftSpec, rightSpec) {
    super();

    if (!(leftSpec instanceof Specification)) {
      throw new TypeError("leftSpec must be a Specification");
    }

    if (!(rightSpec instanceof Specification)) {
      throw new TypeError("rightSpec must be a Specification");
    }

    this.rightSpec = rightSpec;
    this.leftSpec = leftSpec;
  }

  isSatisfied(item) {
    return this.leftSpec.isSatisfied(item) && this.rightSpec.isSatisfied(item);
  }
}

export class OrCombinator extends Specification {
  constructor(leftSpec, rightSpec) {
    super();

    if (!(leftSpec instanceof Specification)) {
      throw new TypeError("leftSpec must be a Specification");
    }

    if (!(rightSpec instanceof Specification)) {
      throw new TypeError("rightSpec must be a Specification");
    }

    this.rightSpec = rightSpec;
    this.leftSpec = leftSpec;
  }

  isSatisfied(item) {
    return this.leftSpec.isSatisfied(item) || this.rightSpec.isSatisfied(item);
  }
}

export class NotCombinator extends Specification {
  constructor(spec) {
    super();
    if (!(spec instanceof Specification)) {
      throw new TypeError("leftSpec must be a Specification");
    }

    this.spec = spec;
  }

  isSatisfied(item) {
    return !this.spec.isSatisfied(item);
  }
}

export class Sort {
  constructor() {
    if (new.target === Sort) {
      throw new Error("abstract class");
    }
  }

  sort(items) {
    throw new Error(`method not implement in ${this.constructor.name} class`);
  }
}

export class PriceSort extends Sort {
  static ascSort = (item1, item2) => item1.price - item2.price;
  static descSort = (item1, item2) => item2.price - item1.price;

  constructor(order = ORDER_TYPE.ASCENDING) {
    super();
    this.order = order;
  }

  sort(items) {
    const sortFn =
      this.order === ORDER_TYPE.ASCENDING
        ? PriceSort.ascSort
        : PriceSort.descSort;
    const sortedItems = [...items];
    return sortedItems.sort(sortFn);
  }
}

export class Filter {
  static filter(items, specs) {
    return items.filter((item) => specs.isSatisfied(item));
  }
}
