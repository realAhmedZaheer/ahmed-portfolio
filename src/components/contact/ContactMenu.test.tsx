import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactMenu } from "./ContactMenu";

it("renders visible contact links and hides the GitHub placeholder", () => {
  render(<ContactMenu />);
  expect(screen.getByRole("link", { name: /EMAIL/ })).toHaveAttribute(
    "href",
    "mailto:ahmedzaheer9000@gmail.com",
  );
  expect(screen.getByRole("link", { name: /LINKEDIN/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /RESUME/ })).toHaveAttribute(
    "href",
    "/Ahmed-Zaheer-Resume.pdf",
  );
  expect(screen.queryByText(/GITHUB/)).not.toBeInTheDocument();
});
