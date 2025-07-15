import { test, expect, describe } from "bun:test";
import { add, multiply, divide } from "./math";

describe("Math utilities", () => {
  test("add function", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test("multiply function", () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 5)).toBe(-10);
    expect(multiply(0, 100)).toBe(0);
  });

  test("divide function", () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(-8, 4)).toBe(-2);
    expect(() => divide(5, 0)).toThrow("Division by zero");
  });
});