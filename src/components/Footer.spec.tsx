import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

test("footer has title", () => {
  render(<Footer />);
  const titleElement = screen.getByText(`Graphing Calculator`);
  expect(titleElement).toBeInTheDocument();
});
