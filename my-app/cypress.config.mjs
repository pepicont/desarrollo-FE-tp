import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    retries: { runMode: 0, openMode: 0 },
    setupNodeEvents(_on, config) {
      return config;
    }
  }
});
