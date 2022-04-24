import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

test("renders copyright with correct year", () => {
  render(<Footer />);
  const copyRightElement = screen.getByText(`© ${new Date().getFullYear()}`);
  expect(copyRightElement).toBeInTheDocument();
});

test("renders author link", () => {
  render(<Footer />);
  const authorElement = screen.getByText(/Teo Carlsson/i);
  expect(authorElement).toBeInTheDocument();
});
