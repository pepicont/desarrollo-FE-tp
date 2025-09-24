// Test E2E básico de login (caso de uso éxito - credenciales correctas)

describe('Login - Flujo UI básico', () => {
  it('permite al usuario iniciar sesión con credenciales válidas', () => {
    const email = 'gamer@gmail.com';
    const password = '123456';

    // Visitar la página de login
    cy.visit('/login');

    // Completar campos usando los ids actuales
    cy.get('#email').should('be.visible').type(email);
    cy.get('#password').should('be.visible').type(password);

    // Click en el botón usando su texto
    cy.contains('button', /iniciar sesión/i).click();

    // Validar que redirige al home 
    cy.url().should('match', /\/$/);

    // Validar que se guardó el token 
    cy.window().then(win => {
      const token = win.localStorage.getItem('authToken') || win.sessionStorage.getItem('authToken');
      expect(token, 'token guardado').to.be.a('string');
      if (!token) {
        throw new Error('No se guardó el authToken tras login');
      }
    });
  });
});
