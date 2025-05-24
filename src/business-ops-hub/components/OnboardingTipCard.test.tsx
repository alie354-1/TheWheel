import React from "react";
import { render, screen } from "@testing-library/react";
import OnboardingTipCard from "./OnboardingTipCard";

describe("OnboardingTipCard", () => {
  it("renders the user guide link", () => {
    render(<OnboardingTipCard />);
    const link = screen.getByRole("link", { name: /user guide/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/docs/BUSINESS_OPERATIONS_HUB_USER_EXPERIENCE.md");
    expect(link).toHaveAttribute("target", "_blank");
  });

  // TODO: Add tests for dismiss functionality and tip content
});
