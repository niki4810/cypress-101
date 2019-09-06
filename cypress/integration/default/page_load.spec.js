describe("when the page loads", () => {
  beforeEach(() => {
    cy.server();

    cy.fixture("default/ads")
      .then((data) => {
        cy.route("GET", "/api/ads", data);
      }).as("adsCall");

    cy.viewport(1024, 1000);
    cy.visit("/item/21311919");

    cy.wait("@adsCall");
  });

  it("should render the correct title", () => {
    cy.get("[data-cy='product-title']")
      .contains("QC headphones - Black");
  });

  it("should set the correct price", () => {
    cy.get("[data-cy='product-price']")
      .contains("$ 100");
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