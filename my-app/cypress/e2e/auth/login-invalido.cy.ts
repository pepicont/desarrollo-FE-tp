// Test: login con credenciales inválidas
// Objetivo: asegurar que el backend responde error y la UI muestra el mensaje correspondiente.

describe('Login - credenciales inválidas', () => {
  it('muestra mensaje de error cuando la contraseña no es correcta', () => {
    const email = 'gamer@gmail.com'; 
    const passwordIncorrecta = 'contraseña-incorrecta';

    cy.visit('/login');
    cy.get('#email').should('be.visible').type(email);
    cy.get('#password').should('be.visible').type(passwordIncorrecta);
    cy.contains('button', /iniciar sesión/i).click();

    
    cy.contains(/email o contraseña incorrectos/i).should('be.visible');

    // Asegurar que NO se guardó token
    cy.window().then(win => {
      const token = win.localStorage.getItem('authToken') || win.sessionStorage.getItem('authToken');
      if (token) {
        throw new Error('Se guardó un token aunque el login debió fallar');
      }
    });
  });
});
