describe("when the page loads", () => {
  beforeEach(() => {
    cy.loadItemPage();
  });

  it("should render the correct title", () => {
    cy.get("[data-cy='product-title']")
      .should("have.text", "[MOCK] QC headphones - Black !!!");
  });

  it("should set the correct price", () => {
    cy.get("[data-cy='product-price']")
      .should("have.text", "$ 100");
  });

  it("should load a new product", () => {
    cy.get("[data-cy='variants-list'] [data-cy='variant']")
      .should("have.length", 2);
  });

  it("should render correct number of ads", () => {
    cy.get("[data-cy='ads-container'] [data-cy='ad']")
      .as("adEl");

    cy.get("@adEl")
      .should("have.length", 3);
    cy.get("@adEl")
      .eq(0)
      .children()
      .should("have.attr", "src")
      .should("include", "https://dummyimage.com/250x200/d6d2d6/ff0000.png&text=Foo");
  });
});