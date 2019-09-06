describe("When an alternate item is clicked", () => {
  beforeEach(() => {
    cy.loadItemPage();

    cy.fixture("default/regular_item_alt")
    .then((item) => {
      cy.route({
        method: "POST",
        url: "/api/item", 
        response: item,
        delay: 500
      }).as("altItemCall");
    });
  });
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