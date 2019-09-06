// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// See this article on why we are deleting fetch on window object.
// https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch#readme
Cypress.on('window:before:load', (win) => {
  delete win.fetch
});

Cypress.Commands.add("loadItemPage", (options = {}) => { 
  const {
    adsFixtureId = "fixture:default/ads",
    itemFixtureId = "default/regular_item_primary",
    itemApiDelay = 0,
    itemURL = "/item/21311919",
    viewportWidth = 1024,
    viewportHeight = 1000
  } = options;

  cy.server();

  cy.route("GET", "/api/ads", adsFixtureId).as("adsCall");;

  cy.fixture(itemFixtureId)
    .then((item) => {
      cy.route({
        method: "POST",
        url: "/api/item",
        response: item,
        delay: itemApiDelay
      }).as("itemCall");
    });

  cy.viewport(viewportWidth, viewportHeight);
  cy.visit(itemURL);

  cy.wait("@itemCall");
  cy.wait("@adsCall");
});