import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BackgroundFx } from "./BackgroundFx";

describe("BackgroundFx", () => {
  it("renders a canvas without throwing", () => {
    const { container } = render(<BackgroundFx danger={0.5} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
