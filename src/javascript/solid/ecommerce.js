// item = { color, size, price, category }
// Allowed values
export const SIZES = Object.freeze(["S", "M", "L", "XL"]);

export const COLORS = Object.freeze([
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
]);

export const CATEGORIES = Object.freeze([
  "T-Shirt",
  "Shirt",
  "Jeans",
  "Jacket",
  "Shoes",
]);

export const ORDER_TYPE = Object.freeze({
  ASCENDING: "ASCENDING",
  DESCENDING: "DESCENDING",
});

export const ITEMS = Object.freeze([
  Object.freeze({
    name: "Classic Black T-Shirt",
    color: COLORS[0],
    size: SIZES[1],
    price: 799,
    category: CATEGORIES[0],
  }),
  Object.freeze({
    name: "White Cotton T-Shirt",
    color: COLORS[1],
    size: SIZES[2],
    price: 699,
    category: CATEGORIES[0],
  }),
  Object.freeze({
    name: "Red Graphic T-Shirt",
    color: COLORS[2],
    size: SIZES[0],
    price: 899,
    category: CATEGORIES[0],
  }),
  Object.freeze({
    name: "Blue Polo T-Shirt",
    color: COLORS[3],
    size: SIZES[3],
    price: 1199,
    category: CATEGORIES[0],
  }),
  Object.freeze({
    name: "Green Casual T-Shirt",
    color: COLORS[4],
    size: SIZES[1],
    price: 749,
    category: CATEGORIES[0],
  }),
  Object.freeze({
    name: "Formal White Shirt",
    color: COLORS[1],
    size: SIZES[2],
    price: 1499,
    category: CATEGORIES[1],
  }),
  Object.freeze({
    name: "Blue Checked Shirt",
    color: COLORS[3],
    size: SIZES[1],
    price: 1299,
    category: CATEGORIES[1],
  }),
  Object.freeze({
    name: "Black Slim Fit Shirt",
    color: COLORS[0],
    size: SIZES[3],
    price: 1599,
    category: CATEGORIES[1],
  }),
  Object.freeze({
    name: "Green Linen Shirt",
    color: COLORS[4],
    size: SIZES[2],
    price: 1799,
    category: CATEGORIES[1],
  }),
  Object.freeze({
    name: "Blue Regular Fit Jeans",
    color: COLORS[3],
    size: SIZES[1],
    price: 1999,
    category: CATEGORIES[2],
  }),
  Object.freeze({
    name: "Black Slim Fit Jeans",
    color: COLORS[0],
    size: SIZES[2],
    price: 2199,
    category: CATEGORIES[2],
  }),
  Object.freeze({
    name: "White Straight Fit Jeans",
    color: COLORS[1],
    size: SIZES[3],
    price: 1899,
    category: CATEGORIES[2],
  }),
  Object.freeze({
    name: "Green Cargo Jeans",
    color: COLORS[4],
    size: SIZES[0],
    price: 2399,
    category: CATEGORIES[2],
  }),
  Object.freeze({
    name: "Black Leather Jacket",
    color: COLORS[0],
    size: SIZES[2],
    price: 4999,
    category: CATEGORIES[3],
  }),
  Object.freeze({
    name: "Blue Denim Jacket",
    color: COLORS[3],
    size: SIZES[1],
    price: 2999,
    category: CATEGORIES[3],
  }),
  Object.freeze({
    name: "Red Bomber Jacket",
    color: COLORS[2],
    size: SIZES[3],
    price: 3499,
    category: CATEGORIES[3],
  }),
  Object.freeze({
    name: "Black Running Shoes",
    color: COLORS[0],
    size: SIZES[2],
    price: 2799,
    category: CATEGORIES[4],
  }),
  Object.freeze({
    name: "White Sneakers",
    color: COLORS[1],
    size: SIZES[1],
    price: 2499,
    category: CATEGORIES[4],
  }),
  Object.freeze({
    name: "Blue Sports Shoes",
    color: COLORS[3],
    size: SIZES[3],
    price: 3199,
    category: CATEGORIES[4],
  }),
  Object.freeze({
    name: "Yellow Casual Shoes",
    color: COLORS[5],
    size: SIZES[0],
    price: 2299,
    category: CATEGORIES[4],
  }),
]);

export default ITEMS;
