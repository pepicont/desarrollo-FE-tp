// Seleccionaremos dinámicamente un producto de /api/search/top-sellers
const USUARIO = { email: 'gamer@gmail.com', password: '123456' };

function login() {
  cy.visit('/login');
  cy.get('#email').should('be.visible').clear().type(USUARIO.email);
  cy.get('#password').should('be.visible').clear().type(USUARIO.password);
  cy.contains('button', /iniciar sesión/i).click();
  cy.url().should('match', /\/$/);
}

describe('Checkout - flujo simulando pago exitoso', () => {
  it('inicia checkout y simula pago exitoso navegando a la pantalla de éxito', () => {
    // 1. Login
    login();

    // 2. Ir a home (en caso de que no haya redirigido) e interceptar carga de destacados
    cy.intercept('GET', '**/api/search/top-sellers*').as('topSellers');
    cy.visit('/');
    cy.wait('@topSellers').then(interception => {
      interface ProductoResp { id: number; tipo: string; nombre: string }
      const body = interception.response?.body as { data?: ProductoResp[] } | undefined;
      const productos = body?.data as ProductoResp[] | undefined;
      if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error('Lista de top-sellers vacía o no válida');
      }
      // Elegimos preferentemente un juego, si no cualquiera
      const elegido = productos.find((p) => p.tipo === 'juego') || productos[0];
      if (!elegido?.nombre || !elegido?.id || !elegido?.tipo) {
        throw new Error('Producto seleccionado carece de campos requeridos (nombre/id/tipo)');
      }
      cy.wrap(elegido).as('productoSeleccionado');
  
  cy.contains('h3', elegido.nombre, { timeout: 10000 }).click();
    });

    cy.contains('button', /comprar|adquirir|pagar|agregar/i).first().click();

    
    cy.location('pathname', { timeout: 10000 }).should('match', /checkout$/);

    
    cy.intercept('POST', 'http://localhost:3000/api/checkout/start').as('start');

    cy.wait('@start').then(interception => {
      expect(interception.response?.statusCode).to.eq(200);
      const body = interception.response?.body;
      if (!body) {
        throw new Error('Respuesta de /checkout/start vacía o indefinida');
      }
    });

    cy.intercept('POST', 'http://localhost:3000/api/checkout/mp/start', (req) => {
      req.reply({
        statusCode: 200,
        body: { data: { id: 'fake-pref', init_point: 'https://fake-mercadopago/init' } }
      });
    }).as('mpStart');

    // 7. Click en botón Pagar 
    cy.contains('button', /^pagar$/i).click();
    cy.wait('@mpStart').its('response.statusCode').should('eq', 200);

    // 8. En lugar de redirigir a MP real, simulamos el éxito manualmente llamando al endpoint simulate-success.

    cy.window().then(win => {
      const token = win.localStorage.getItem('authToken') || win.sessionStorage.getItem('authToken');
      expect(token, 'token auth presente').to.be.a('string');
      cy.get('@productoSeleccionado').then((prod) => {
        type ProductoResp = { id: number; tipo: string; nombre: string };
        const p = prod as unknown as ProductoResp;
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api/checkout/start',
          body: { tipo: p.tipo, id: p.id },
          headers: { Authorization: `Bearer ${token}` }
        }).then(startResp => {
  const sessionId = startResp.body?.data?.data?.sessionId || startResp.body?.data?.sessionId;
  if (!sessionId) throw new Error('No se pudo extraer sessionId del start');
        // Simular éxito
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api/checkout/simulate-success',
          body: { sessionId },
          headers: { Authorization: `Bearer ${token}` }
        }).then(simResp => {
          expect(simResp.status).to.eq(200);
          const ventaId = simResp.body?.data?.data?.venta?.id || simResp.body?.data?.venta?.id;
          const cod = simResp.body?.data?.data?.venta?.codActivacion || simResp.body?.data?.venta?.codActivacion;
          if (!ventaId) throw new Error('ventaId no presente en simulate-success');
          if (!cod) throw new Error('codActivacion no presente en simulate-success');
          cy.visit('/checkout/success', {
            qs: { venta_id: ventaId },
          });
        });
      });
    });
    });

    // 9. Validar pantalla de éxito
    cy.location('pathname', { timeout: 15000 }).should('match', /checkout\/success$/);
    cy.contains(/compra exitosa/i).should('be.visible');
    cy.contains(/código de activación/i).should('be.visible');
  });
});

// NOTA: Este test mezcla acciones UI y llamadas directas cy.request para estabilizar el flujo.
//       Cuando quieras probar MP real, crea un segundo spec sin mocks ni simulate-success.
