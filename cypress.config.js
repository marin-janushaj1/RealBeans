const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    projectId: 'yi2xm9',
    baseUrl: 'https://r0971085-realbeans.myshopify.com', // Adjust to your local development server
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx,cy.js}', // Add .cy.js
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});