import {
  Filter,
  ColorSpecification,
  SizeSpecification,
  CategorySpecification,
  MultiColorSpecification,
  PriceSort,
} from "./ocp.js";

import { ITEMS, ORDER_TYPE } from "./ecommerce.js";

function assertEqual(actual, expected, description) {
  const actualValue = JSON.stringify(actual);
  const expectedValue = JSON.stringify(expected);

  if (actualValue !== expectedValue) {
    console.error(`❌ ${description}`);
    console.error("Expected:", expected);
    console.error("Received:", actual);
    return;
  }

  console.log(`✅ ${description}`);
}

function getNames(items) {
  return items.map((item) => item.name);
}

// --------------------------------------------------
// Test 1: Single specification
// All black products
// --------------------------------------------------

{
  const specification = new ColorSpecification("Black");

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    [
      "Classic Black T-Shirt",
      "Black Slim Fit Shirt",
      "Black Slim Fit Jeans",
      "Black Leather Jacket",
      "Black Running Shoes",
    ],
    "filters all black products",
  );
}

// --------------------------------------------------
// Test 2: AND combinator
// Medium T-shirts
// --------------------------------------------------

{
  const specification = new CategorySpecification("T-Shirt").and(
    new SizeSpecification("M"),
  );

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    ["Classic Black T-Shirt", "Green Casual T-Shirt"],
    "filters medium-sized T-shirts",
  );
}

// --------------------------------------------------
// Test 3: OR combinator
// Black or blue products
// --------------------------------------------------

{
  const specification = new ColorSpecification("Black").or(
    new ColorSpecification("Blue"),
  );

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    [
      "Classic Black T-Shirt",
      "Blue Polo T-Shirt",
      "Blue Checked Shirt",
      "Black Slim Fit Shirt",
      "Blue Regular Fit Jeans",
      "Black Slim Fit Jeans",
      "Black Leather Jacket",
      "Blue Denim Jacket",
      "Black Running Shoes",
      "Blue Sports Shoes",
    ],
    "filters black or blue products",
  );
}

// --------------------------------------------------
// Test 4: NOT combinator
// Products that are not large
// --------------------------------------------------

{
  const specification = new SizeSpecification("L").not();

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    result.every((item) => item.size !== "L"),
    true,
    "filters products whose size is not L",
  );
}

// --------------------------------------------------
// Test 5: Nested specification
//
// T-Shirt
// AND
// (Black OR Blue)
// AND
// NOT XL
// --------------------------------------------------

{
  const specification = new CategorySpecification("T-Shirt")
    .and(new ColorSpecification("Black").or(new ColorSpecification("Blue")))
    .and(new SizeSpecification("XL").not());

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    ["Classic Black T-Shirt"],
    "evaluates a nested specification tree",
  );
}

// --------------------------------------------------
// Test 6: Different grouping
//
// Black
// OR
// (Blue AND Shoes)
// --------------------------------------------------

{
  const specification = new ColorSpecification("Black").or(
    new ColorSpecification("Blue").and(new CategorySpecification("Shoes")),
  );

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    [
      "Classic Black T-Shirt",
      "Black Slim Fit Shirt",
      "Black Slim Fit Jeans",
      "Black Leather Jacket",
      "Black Running Shoes",
      "Blue Sports Shoes",
    ],
    "respects explicit specification grouping",
  );
}

// --------------------------------------------------
// Test 7: MultiColorSpecification
// --------------------------------------------------

{
  const specification = new MultiColorSpecification("Red", "Green");

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    [
      "Red Graphic T-Shirt",
      "Green Casual T-Shirt",
      "Green Linen Shirt",
      "Green Cargo Jeans",
      "Red Bomber Jacket",
    ],
    "filters red or green products",
  );
}

// --------------------------------------------------
// Test 8: Ascending price sorting
// --------------------------------------------------

{
  const originalOrder = getNames(ITEMS);

  const result = new PriceSort(ORDER_TYPE.ASCENDING).sort(ITEMS);

  assertEqual(
    result[0].name,
    "White Cotton T-Shirt",
    "places the cheapest product first",
  );

  assertEqual(
    result.at(-1).name,
    "Black Leather Jacket",
    "places the most expensive product last",
  );

  assertEqual(
    getNames(ITEMS),
    originalOrder,
    "does not mutate the original ITEMS array",
  );
}

// --------------------------------------------------
// Test 9: Descending price sorting
// --------------------------------------------------

{
  const result = new PriceSort(ORDER_TYPE.DESCENDING).sort(ITEMS);

  assertEqual(
    result[0].name,
    "Black Leather Jacket",
    "places the most expensive product first",
  );

  assertEqual(
    result.at(-1).name,
    "White Cotton T-Shirt",
    "places the cheapest product last",
  );
}

// --------------------------------------------------
// Test 10: Invalid category
// --------------------------------------------------

{
  let errorMessage;

  try {
    new CategorySpecification("Electronics");
  } catch (error) {
    errorMessage = error.message;
  }

  assertEqual(
    errorMessage,
    "Electronics does not exist",
    "rejects an unsupported category",
  );
}

// --------------------------------------------------
// Test 11: Invalid AND operand
// --------------------------------------------------

{
  let errorMessage;

  try {
    new ColorSpecification("Black").and(null);
  } catch (error) {
    errorMessage = error.message;
  }

  assertEqual(
    errorMessage,
    "rightSpec must be a Specification",
    "rejects an invalid AND operand",
  );
}

// --------------------------------------------------
// Test 12: Double negation
//
// NOT NOT Black = Black
// --------------------------------------------------

{
  const specification = new ColorSpecification("Black").not().not();

  const result = Filter.filter(ITEMS, specification);

  assertEqual(
    getNames(result),
    [
      "Classic Black T-Shirt",
      "Black Slim Fit Shirt",
      "Black Slim Fit Jeans",
      "Black Leather Jacket",
      "Black Running Shoes",
    ],
    "supports double negation",
  );
}
