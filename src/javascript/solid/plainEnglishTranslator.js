import {
  ColorSpecification,
  Specification,
  CategorySpecification,
  SizeSpecification,
  MultiColorSpecification,
  AndCombinator,
  OrCombinator,
  NotCombinator,
} from "./ocp.js";

class PlainEnglishSpecificationTranslator {
  translate(specification) {
    if (specification === Specification) {
      throw new Error(
        "specification should be an instance of Specification class",
      );
    }

    if (specification instanceof ColorSpecification) {
      return this.translateColor(specification);
    }

    if (specification instanceof SizeSpecification) {
      return this.translateSize(specification);
    }

    if (specification instanceof CategorySpecification) {
      return this.translateCategory(specification);
    }

    if (specification instanceof MultiColorSpecification) {
      return this.translateMultiColor(specification);
    }

    if (specification instanceof AndCombinator) {
      const { leftSpec, rightSpec } = specification;
      return this.translateAnd(leftSpec, rightSpec);
    }

    if (specification instanceof OrCombinator) {
      const { leftSpec, rightSpec } = specification;
      return this.translateOr(leftSpec, rightSpec);
    }

    if (specification instanceof NotCombinator) {
      return this.translateNot(specification);
    }

    throw new TypeError(
      `Unsupported specification: ${specification.constructor.name}`,
    );
  }

  translateColor(specification) {
    return `color should be ${specification.color}`;
  }

  translateSize(specification) {
    return `(size is ${specification.size})`;
  }

  translateCategory(specification) {
    return `category should be ${specification.category}`;
  }

  translateMultiColor(specification) {
    return `color can be one of these ${specification.colors.join(",")}`;
  }

  translateAnd(leftspec, rightSpec) {
    return `(${this.translate(leftspec)} AND ${this.translate(rightSpec)})`;
  }

  translateOr(leftspec, rightSpec) {
    return `(${this.translate(leftspec)} OR ${this.translate(rightSpec)})`;
  }

  translateNot(specification) {
    return "Not " + this.translate(specification.spec, true);
  }
}

const test3 = new CategorySpecification("T-Shirt")
  .and(new ColorSpecification("Black").or(new ColorSpecification("Blue")))
  .and(new SizeSpecification("XL").not());

const statement = new PlainEnglishSpecificationTranslator().translate(test3);

console.log(statement);
