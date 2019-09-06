describe("when the page loads", () => {
  beforeEach(() => {
    cy.viewport(1024, 1000);
    cy.visit("/item/21311919");
  });

  it("should render the correct title", () => {
    cy.get("[data-cy='product-title']")
      .should("have.text", "QC headphones - Black");
  });

  it("should set the correct price", () => {
    cy.get("[data-cy='product-price']")
      .should("have.text", "$ 100");
  });

  it("should load a new product", () => {
    cy.get("[data-cy='variants-list'] [data-cy='variant']")
      .should("have.length", 2);
  });
});