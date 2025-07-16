import { greet } from "./index";

describe("greet function", () => {
  it("should greet the world by default", () => {
    expect(greet()).toBe("Hello, World!");
  });

  it("should greet a specific name when provided", () => {
    expect(greet("Alice")).toBe("Hello, Alice!");
  });
});
