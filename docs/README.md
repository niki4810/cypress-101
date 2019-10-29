# Introduction
This tutorial is a step-by-step guide for getting started with cypress. The goal of this tutorial is to learn how to test an isomorphic app using cypress.

Here is a summary of what we will cover:
- Introducing the application we plan to test.
- Installing cypress & configuring a few basic settings.
- Writing cypress tests.
- Configuring babel to remove `data-*` attributes
- Running cypress in CI. 


If you find any information to be inaccurate or needs improvement, please feel free to open a PR 🙌.

---

# Prerequisites

This tutorial assumes you have:
- Basic understanding on how to run commands in a terminal or command prompt.
- `Node.js` version 10 or above installed on your machine. You can download the installer [here](https://nodejs.org/en/download/), alternatively you can install `Node.js` via nvm to manage multiple versions of node, see the instructions [here](https://github.com/nvm-sh/nvm#installation-and-update)
- Basic understanding of JavaScript would be nice to have.

---

# Getting started
The app we will be testing is a simple item details page which is rendered on the server-side. Users can select multiple variations of the item, add the item to the cart, change the zip code and view reviews & ads on the page. The below screencap shows the demo application:

![01-app-introduction](https://user-images.githubusercontent.com/1467801/64465537-081f1b80-d0c2-11e9-9795-8efb1ab31fc0.gif)

To get started:
- Clone the main repo: `git clone https://github.com/niki4810/cypress-101.git`
- Cd into the project root, `cd cypress-101`
- Check out the starter template: `git checkout 01-starter-template`
- Install the dependencies: `npm install`
- Start the application: `npm start`

For this demo, we have only 4 mock items to test:
- http://localhost:4000/item/21311919
- http://localhost:4000/item/21311920
- http://localhost:4000/item/31311919
- http://localhost:4000/item/31311920

The app has the following API routes:
- `api/ads`: A `GET` request to fetch the ads.
- `api/item`: A `POST` request to fetch an item. Accepts `{id, zipcode}` in the request body to fetch item details at a specific zip code.
- `api/addToCart`: A `POST` request to add item to cart. Accepts `{id, quantity}` in the request body.

This app has been bootstrapped using [Razzle](https://github.com/jaredpalmer/razzle). 

---

# Installing & Configuring cypress

1. Install cypress as a dev dependency: `npm install cypress --save-dev`

2. Add cypress scripts to `package.json` scripts:
  ```
  "scripts": {
    ...
    "cypress": "cypress open",
    "cypress:headless": "cypress run"
  },
  ```
3. Ensure you application server is running: `npm start`

4. In a separate terminal tab/window run `npm run cypress` to launch cypress test runner. 
  (Alternative you can also run `npm run cypress:headless` to run your tests in the command line. We can skip this step for now)
5. Running this would generate a cypress directory as shown below
<img width="264" alt="Screen Shot 2019-09-06 at 9 55 24 PM" src="https://user-images.githubusercontent.com/1467801/64470032-18022400-d0f1-11e9-9e7d-a97d68caf0e3.png">

6. Hit command + c (or ctrl + c on windows) in both the open terminals to stop the cypress runner and your app server.

7. Add this command to `cypress > support > commands.js`
  ```
  Cypress.on('window:before:load', (win) => {
    delete win.fetch
  });
  ```
  [See this article](https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch#deleting-fetch) on why we are deleting fetch on window object.

8. open `cypress.json` and add the following 
  ```
  {
    "baseUrl": "http://localhost:4000",
    "video": false
  }
  ```
  > We will be testing items at the route `item/:itemId`. Rather than loading the full page, having `baseUrl` configured this way provides us a nice shorthand at the time of writing the tests.
  
  > When running tests in CI via `cypress run` command, at the end of the test run cypress generate a video for that test run. Setting `video` to false prevents that video from being generated. Feel free to look at any settings that apply to your usecase by looking at this [documentation](https://docs.cypress.io/guides/references/configuration.html#Options). For this demo we will use the above two settings.

Now we are all done with installing and configuring cypress. Each section  below is structured in a way that it covers a specific topic. At the end of each section, a link to the completed code is available for your reference. Let's start adding our tests 🎉

---

# Adding page load tests

 By default cypress adds a ton of example test specs (which are great reference guides themselves) under `cypress > integration > examples`. You can delete the examples folder as we will be adding our own tests.

1. Create a folder called `default` under `cypress > integration` and add a file called `page_load.spec.js`

2. Add the following code to test to assert the page title is correct. (I've added comments `//` at each line to explain what it does)
  ```
  describe("when the page loads", () => {
    beforeEach(() => {
      // set the browser viewport width and height
      cy.viewport(1024, 1000);
      // load the item
      cy.visit("/item/21311919");
    });

    it("should render the correct title", () => {
      // We get a reference to the title element via the `cy.get` command.
      // Then we assert that the title element has the correct test on page load.
      cy.get("[data-cy='product-title']")
        .should("have.text", "QC headphones - Black");
    });
  });
  ```

3. Ensure your application server is running: `npm start`

4. In a separate tab/window, start the cypress test runner: `npm run cypress`

5. Upon starting the tests, you should see your first test pass as shown below
  ![02-basic-tests](https://user-images.githubusercontent.com/1467801/64482332-de8af080-d1a4-11e9-91f2-2544c1121c82.gif)

6. Let's add a couple more assertions, add the below code after your previous `it` block
  
  ```
    it("should set the correct price", () => {
      cy.get("[data-cy='product-price']")
        .should("have.text", "$ 100");
    });

    it("should load a new product", () => {
      cy.get("[data-cy='variants-list'] [data-cy='variant']")
        .should("have.length", 2);
    });
  ```

  > The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/03-page-load-tests).

---

# Mocking ads call

When our application loads, we are making a call to `api/ads` to fetch the ads on the page. Let's try to mock this API call.

1. Create a new folder called `default` under `cypress > fixtures`

2. Add a new file under `cypress > fixtures > default` and save it as `ads.json`

3. Copy-paste the contents of [this](https://github.com/niki4810/cypress-101/blob/04-mocking-ads-call/cypress/fixtures/default/ads.json) file into your local `ads.json` file.

4. Navigate to `cypress > integration > default > page_load.spec.js` file and replace the `beforeEach` block with below code.

```
  beforeEach(() => {
    // creates a server
    cy.server();

    // mocks all get requests made to `api/ads` endpoint
    // and returns the mock ads.json data. We name this mock request
    // with as alias called adsCall.
    cy.route("GET", "/api/ads", "fixture:default/ads").as("adsCall");;

    cy.viewport(1024, 1000);
    cy.visit("/item/21311919");

    // using the alias name we wait for this mock call to resolve
    // before we make further assertions. `@adsCall` is the alias name we gave above. 
    cy.wait("@adsCall");
  });
```

5. Now let's asset that the ads show up the mock data. Add this `it` block to your code

```
it("should render correct number of ads", () => {
  // Create an alias to the ad element.
  cy.get("[data-cy='ads-container'] [data-cy='ad']")
    .as("adEl");

  // assert that the correct number of ads show up on page
  // Notice how we are using alias to reference the element selector.
  cy.get("@adEl")
    .should("have.length", 3);

  // assert that the first ad has correct mocked source image.
  cy.get("@adEl")
    .eq(0)
    .children()
    .should("have.attr", "src")
    .should("include", "https://dummyimage.com/250x200/d6d2d6/ff0000.png&text=Foo");
});
```

If everything goes well, your newly added ads test case should pass as shown below:

  <img width="1422" alt="Screen Shot 2019-09-07 at 7 34 30 PM" src="https://user-images.githubusercontent.com/1467801/64482427-966ccd80-d1a6-11e9-9a19-f8ad9f720d36.png">


> The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/04-mocking-ads-call).

---

# Clicking alternate item

We will write a test spec to simulate clicking on an alternate item and ensuring that the page loads correctly. We will also be mocking the API call that happens after we click on the alternate item.

1. Add a new file under `cypress > fixtures > default` and save it as `regular_item_alt.json`

2. Copy-paste the contents of [this](https://github.com/niki4810/cypress-101/blob/05-mocking-alt-item-click/cypress/fixtures/default/regular_item_alt.json) file into your local `regular_item_alt.json` file.

3. In the `page_load.spec.js` file's `beforeEach` block, add the code shown below right before the `cy.viewport()` call

```
// get the regular item alt fixture
cy.fixture("default/regular_item_alt")
      .then((item) => {
        // on receiving the data
        // set up a route to mock the post request to
        // /api/item call, and respond with fixture data
        // We also set a delay of 500ms for this mock call.
        cy.route({
          method: "POST",
          url: "/api/item", 
          response: item,
          delay: 500
        }).as("altItemCall");
      });
```

4. Add this new describe block after the last `it` block:

```
  describe("When an alternate item is clicked", () => {
    it("should load a new product", () => {
      // get the spinner element
      cy.get("[data-cy='spinner']").as("pageSpinner");

      // assert that the spinner is hidden
      cy.get("@pageSpinner").should('have.class', 'hidden');

      // get the second alternate item tile, and simulate a click event on it
      cy.get("[data-cy='variants-list'] [data-cy='variant']:nth-child(2)")
      .click();

      // assert that the spinner is shown.
      cy.get("@pageSpinner").should('not.have.class', "hidden");

      // wait for the /api/item call to resolve
      cy.wait("@altItemCall");

      // assert that the product title has changed
      cy.get("[data-cy='product-title']")
        .should("have.text", "[MOCK] QC headphones - Silver");

      // assert that the primary image has changed.
      cy.get("[data-cy='image-container'] [data-cy='primary-image']")
        .should('have.attr', 'src')
        .should('include','https://dummyimage.com/450x450/535aa6/fff&text=4');
    });
  });
  ```

  5. Upon running the tests, one of our assertions fails as shown below
  
  <img width="1415" alt="Screen Shot 2019-09-07 at 8 09 47 PM" src="https://user-images.githubusercontent.com/1467801/64482677-8dcac600-d1ab-11e9-80f7-f2c344bcb22d.png">

  We are asserting that the primary image should update upon alternate item click but looks like that didn't happen. Let's fix this.

  6. Navigate to `src > components > Home.js`, and search for the text `// TODO: remove this intentional bug.` and remove the if block and save the file. Your code should look like this

  ```
    setSelectedImage(get(selectedItemImages, "0", ""));
  ```

   We had a bug in the code which was preventing the image to be re-set if it is already be set, removing the `if` condition fixes the issue

   7. Your tests should now pass when we re-run them.

   <img width="1415" alt="Screen Shot 2019-09-07 at 8 19 38 PM" src="https://user-images.githubusercontent.com/1467801/64482767-d8990d80-d1ac-11e9-8501-c7750dcd0017.png">

> The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/05-mocking-alt-item-click).

---

# Mocking initial item call

Our application renders on the server-side, so we are still relying on real data for the initial page load. To mock the initial call, we need to render our application completely on the client-side. Based on the comment in this [github issue](https://github.com/cypress-io/cypress/issues/588#issuecomment-321598634) currently, this may be the only way to test a mock a server-side rendered application.

To mock the initial call:

1. Hit command + c (or ctrl + c on windows) in both the open terminals to stop the cypress runner and your app server.

2. Start the server in client render mode: `DISABLE_SSR=true npm start`

3. Start the cypress test runner in another terminal tab/window: `npm run cypress`

4. Add a new file under `cypress > fixtures > default` and save it as `regular_item_primary.json`

5. Copy-paste the contents of [this](https://github.com/niki4810/cypress-101/blob/06-mocking-initial-call/cypress/fixtures/default/regular_item_primary.json) file into your local `regular_item_primary.json` file.

6. Modify the `POST` request route in the main `beforeEach` block to as follows

   ```
     cy.fixture("default/regular_item_primary") // Changing the item fixture to be the primary item
      .then((item) => {
        cy.route({
          method: "POST",
          url: "/api/item", 
          response: item,
          delay: 0 // setting the delay to 0
        }).as("itemCall"); // changing the alias to itemCall
      });
    ```

7. Add this line before the `cy.wait("@adsCall")`, since we want to wait for item API call to finish before we start our assertions

```
// waiting for the item call to resolve.
cy.wait("@itemCall"); 
```

8. Modify our title assertions to match the title in our mock

```
it("should render the correct title", () => {
    cy.get("[data-cy='product-title']")
      .should("have.text", "[MOCK] QC headphones - Black");
  });
```

9. Since the initial item load and alternate item load call the same API endpoint. We need to re-set another mock route to send mock data for the alternate item.
Add a new beforeEach block of the `When an alternate item is clicked` describe block as shown below.

```
beforeEach(() => {
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


```

Your tests should start passing again

<img width="1413" alt="Screen Shot 2019-09-07 at 9 49 58 PM" src="https://user-images.githubusercontent.com/1467801/64483598-e1dca700-d1b9-11e9-8ca3-b7db9f720b3a.png">


> The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/06-mocking-initial-call).

---

# Code cleanup using commands

Currently, all of our specs are in one file, we can split them into multiple files and also create custom commands to share code between them.

1. Add the following code to `cypress > support > commands.js`

```
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
```

This is essentially the same code that happens in the first `beforeEach` block in our `page_load.spec.js` file. We can now reuse the `loadItemPage` command in all our spec files and also pass different ads/item fixtures, set custom delay, custom viewport width, and height.

2. Modify the `beforeEach` block in `page_load.spec.js` to 

```
  beforeEach(() => {
    cy.loadItemPage();
  });
```

3. create a new file under `cypess > integration > default` folder and name it `alt_item_click.spec.js`

4. Move over the entire `When an alternate item is clicked` describe block from `page_load.spec.js` into the newly created `alt_item_click.spec.js`

5. Call the `cy.loadItemPage();` command in the `alt_item_click.spec.js` too

```
  beforeEach(() => {
    cy.loadItemPage();
  });
 ```

 Your tests should still be passing, except that now you have two different spec files that share the page load-scripts via a common command

<img width="1410" alt="Screen Shot 2019-09-07 at 10 15 47 PM" src="https://user-images.githubusercontent.com/1467801/64483756-169e2d80-d1bd-11e9-8f48-6f983318ca3f.png">

> The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/07-refactoring-code-into-commands). 

---

# Cleaning up data-cy attributes

For testing, we have added a few `data-cy` attributes to our elements. In production, we really don't need them. We can easily clean up these attributes using the `babel-plugin-jsx-remove-data-test-id`

1. Create a `.babelrc.js` file in the root directory of the project.

2. Add the following code into it, the preset is something specific to razzle and may not be needed for your application, but the important thing to note here is the plugins section

```
module.exports = function(api) {
  const presets = ["razzle/babel"];
  const plugins = [];
  if (api.env("production")) {
    plugins.push(["babel-plugin-jsx-remove-data-test-id", {"attributes": ["data-cy"]}]);
  }
  return {presets, plugins};
}
```
3. Now when we run  production build, we do not see any `data-cy` attributes in our code.

4. You test automation id attribute can be anything other than `data-cy` too, e.g. `data-test-id` or `data-automation-id`, you can update the `.babelrc.js` file to remove them as well.

> The completed code to this section is available at this [branch](https://github.com/niki4810/cypress-101/tree/08-cleanup-data-cy-attrs-in-prod). 

---

# Integrating with CI

We want to ensure that when new pull requests are opened, we run the cypress tests and ensure that nothing breaks in our application. In this section, we will add a simple CI configuration using `Travis CI` to run our cypress tests on every pull request.

1. Before running our cypress tests, we want to ensure our application server is up and running. To achieve this we will install `start-server-and-test` as a dev dependency via: `npm i start-server-and-test --save`

2. Add the following two lines to your `scripts` section in `package.json` file.

```
    "start:alt": "DISABLE_SSR=true razzle start",
    "cypress:ci": "start-server-and-test start:alt http://localhost:4000/item/21311919 cypress:headless"
```

> `start:alt` starts the server in client side mode
> `cypress:ci` runs the starts the `start:alt` script, waits for application to load and then run the `cypress:headless` command

3. Create a file called `.travis.yml` in the root of your project and copy-paste the contents of this [file](https://github.com/niki4810/cypress-101/blob/master/.travis.yml). This is a modified version of Travis CI config mentioned in cypress [docs](https://docs.cypress.io/guides/guides/continuous-integration.html#Travis). The import thing to note here is the last `script` section which runs the `cypress:ci` task we created in step 2.


When everything is in place, once you push this file and merge it to your repo master, your new PR's should start executing the cypress tests in Travis CI as shown below


<img width="771" alt="Screen Shot 2019-10-04 at 2 25 32 PM" src="https://user-images.githubusercontent.com/1467801/66240996-d8f4cd80-e6b2-11e9-9078-fefbe489ea86.png">

---

# Assignments

Congratulations you have made it through the tutorial 🎉. Here are a few practice assignments to put what you've learned to practice.

1) Load the item page and ensure that the shipping and delivery options display the correct information.

2) Load the item page, change the zipcode to `94402`, mock the API call that happens when zipcode is submitted, and ensure that the `Out of stock` banner gets displayed. 
> Hint: Refer to Clicking alternate item section on how to mock API response, you may need to refer to cypress docs to find out how to type zip code and hit return or enter key


---
# Credits

I've put up this tutorial as a guide for anyone who wants to get started with cypress. I hope you find this helpful 😊

I would like to give credit to the following people/projects that I used in this tutorial:

- Thanks to Andy Van Slaars and his [egghead course](https://egghead.io/courses/end-to-end-testing-with-cypress), I personally learned a lot going through this course.
- Cypress team for putting up great documentation
- The demo application has been bootstrapped using [Razzle](https://github.com/jaredpalmer/razzle)
- I've used the [babel-plugin-jsx-remove-data-test-id](https://github.com/coderas/babel-plugin-jsx-remove-data-test-id) for remove the `data-*` attributes.
- This documentation is created using [docsify](https://docsify.js.org/#/)


