describe("when the page loads", () => {
  beforeEach(() => {
    cy.server();

    cy.route("GET", "/api/ads", "fixture:default/ads").as("adsCall");;

    cy.fixture("default/regular_item_alt")
      .then((item) => {
        cy.route({
          method: "POST",
          url: "/api/item", 
          response: item,
          delay: 500
        }).as("altItemCall");
      });

    cy.viewport(1024, 1000);
    cy.visit("/item/21311919");

    cy.wait("@adsCall");
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

  describe("When a variant item is clicked", () => {
    it("should load a new product", () => {
      cy.get("[data-cy='spinner']").as("pageSpinner");
      cy.get("@pageSpinner").should('have.class', 'hidden');
      cy.get("[data-cy='variants-list'] [data-cy='variant']:nth-child(2)")
      .click();
      cy.get("@pageSpinner").should('not.have.class', "hidden");
      cy.wait("@altItemCall");
      cy.get("[data-cy='product-title']")
        .should("have.text", "[MOCK] QC headphones - Silver");
      cy.get("[data-cy='image-container'] [data-cy='primary-image']")
        .should('have.attr', 'src')
        .should('include','https://dummyimage.com/450x450/535aa6/fff&text=4');
    });
  });
});