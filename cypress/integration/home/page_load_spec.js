describe("When home category item page loads", () => {
  beforeEach(() => {
    cy.loadItemPage({
      itemFixtureId: "home/home_item_primary",
      itemURL: "item/31311919",
      viewportWidth: 400,
      viewportHeight: 680,
      delay: 0
    });
  });

  it("should display correct text inside the banner", () => {
    cy.get("[data-cy='banner'] svg text")
    .contains("Home is where the ❤️ is");
  });
});
