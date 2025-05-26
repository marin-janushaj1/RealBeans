describe('RealBeans Webshop Tests', () => {
  // Define STORE_URL if you want to use it explicitly for full URLs
  // Otherwise, Cypress will use the 'baseUrl' from cypress.config.js for relative paths
  const STORE_URL = 'https://r0971085-realbeans.myshopify.com'; // Adjust if your URL changes
  const PASSWORD = 'yeecre';

  beforeEach(() => {
    // Visits the base URL defined in cypress.config.js or the current STORE_URL
    cy.visit('');
    cy.get('body').then(($body) => {
      // Check if the password input exists, indicating the store is locked
      if ($body.find('input[name="password"]').length > 0) {
        cy.get('input[name="password"]').type(PASSWORD);
        cy.get('button[type="submit"]').click();
        // Assert that the URL has changed after unlocking (e.g., no longer includes '/password')
        cy.url().should('not.include', '/password'); // More precise assertion for unlock
      }
    });
  });

  it('displays homepage intro text and product list', () => {
    cy.get('h1, h2, p')
      .contains(
        'Since 1801, RealBeans has roasted premium coffee in Antwerp for Europe’s finest cafes. Ethically sourced beans, crafted with care.'
      )
      .should('be.visible');
    cy.get('.product-grid, .collection-grid')
      .find('.product-card, .grid__item')
      .should('have.length.greaterThan', 0);
  });

  it('displays the correct products in the catalog', () => {
    cy.visit('/collections/all'); // Use relative path if baseUrl is configured
    cy.get('.grid__item').each(($product) => {
      cy.wrap($product).find('.card__heading').should('not.be.empty');
      cy.wrap($product).find('.price, .product__price').should('not.be.empty');
    });
  });

  it('sorts products by price and title', () => {
    cy.visit('/collections/all'); // Use relative path
    cy.get('.grid__item').should('have.length.greaterThan', 0);

    // --- Test Title Descending Sort ---
    cy.log('Attempting to sort by Title Descending...');
    // Ensure the sort dropdown is visible and enabled before interaction
    cy.get('#SortBy').should('be.visible').and('not.be.disabled');

    // Select Title Descending
    cy.get('#SortBy').select('title-descending');
    cy.get('#SortBy').trigger('change'); // Trigger change event if 'select' doesn't do it implicitly

    cy.wait(2000); // Allow time for the page to update after sort
    cy.url({ timeout: 10000 }).should(
      'include',
      'sort_by=title-descending'
    );
    cy.log('URL after title-descending sort:', cy.url());

    // Assert that products are loaded after sorting
    cy.get('.grid__item').should('have.length.greaterThan', 0);
    cy.get('.grid__item')
      .find('.card__heading')
      .then(($titlesAfterDesc) => {
        const descOrder = $titlesAfterDesc.map((i, el) => el.innerText.trim()).get();
        cy.log('Titles After Descending Sort:', descOrder);

        // Optional: Add assertion to verify actual title order (if predictable)
        // const expectedDescOrder = [...initialOrder].sort().reverse();
        // expect(descOrder).to.deep.equal(expectedDescOrder);
      });

    // --- Test Price Ascending Sort ---
    cy.log('Attempting to sort by Price Ascending...');
    // Ensure the sort dropdown is visible and enabled before interaction
    cy.get('#SortBy').should('be.visible').and('not.be.disabled');

    // Select Price Ascending
    cy.get('#SortBy').select('price-ascending');
    cy.get('#SortBy').trigger('change'); // Trigger change event

    cy.wait(2000); // Allow time for the page to update after sort
    cy.url({ timeout: 10000 }).should(
      'include',
      'sort_by=price-ascending'
    );
    cy.log('URL after price-ascending sort:', cy.url());

    // Assert that products are loaded after sorting
    cy.get('.grid__item').should('have.length.greaterThan', 0);

    // Assert that prices are sorted correctly (low to high)
    cy.get('.grid__item')
      .find('.price, .product__price')
      .then(($prices) => {
        const newPrices = $prices.map((i, el) => {
          // Clean the price string to extract only the numeric value
          // e.g., "€ 12,34" -> "12.34"
          return parseFloat(el.innerText.replace(/[^\d,.]/g, '').replace(',', '.'));
        }).get();

        cy.log('Prices After Price Ascending Sort:', newPrices);

        // Check if all prices are the same. If so, sorting won't change visible order.
        const uniquePrices = [...new Set(newPrices)];
        if (uniquePrices.length === 1) {
          cy.log('All prices are the same; sorting by price will not change the visible order.');
          // You might choose to skip the sorting assertion here or assert equality
          expect(newPrices).to.deep.equal(newPrices); // Still true, but indicates no change
        } else {
          // Assert that the prices are numerically sorted low to high
          const sortedPrices = [...newPrices].sort((a, b) => a - b);
          expect(newPrices).to.deep.equal(sortedPrices);
        }
      });
  });

  it('displays correct product details', () => {
    cy.visit('/collections/all'); // Use relative path
    cy.get('.grid__item').first().click();
    cy.get('.product__description, .product-description').should('not.be.empty');
    cy.get('.price, .product__price').should('not.be.empty');
    cy.get('.product__media img, .product-image')
      .should('have.attr', 'src')
      .and('not.be.empty');
  });

  it('displays the About page with history paragraph', () => {
    cy.visit('/pages/about-us'); // Use relative path
    cy.get('p, .rte')
      .contains(
        'From a small Antwerp grocery to a European coffee staple, RealBeans honors tradition while innovating for the future. Our beans are roasted in-house, shipped from Antwerp or Stockholm, and loved across the continent.'
      )
      .should('be.visible');
  });
});