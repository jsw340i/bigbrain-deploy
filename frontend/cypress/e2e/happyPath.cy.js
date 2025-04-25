describe('Admin Happy Path', () => {
  it('successfully complete happy path', () => {
    cy.visit('http://localhost:3000');

    cy.contains('Register').click();
    // Registers successfully
    cy.get('input[type="text"]').eq(0).type('k');
    cy.get('input[type="text"]').eq(1).type('k'); 
    cy.get('input[type="password"]').eq(0).type('password123'); 
    cy.get('input[type="password"]').eq(1).type('password123');

    cy.get('button').contains('Register').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    // Creates a new game successfully
    cy.get('button').contains('+ Create Game').click();
    cy.get('input[type="text"]').type('New Game');
    cy.get('button[name="create"]').click();
    cy.contains('New Game').should('be.visible'); 
    // Starts a game successfully
    cy.get('button').contains('Start Game Session').click();
    cy.wait(1000);
    // Ends a game successfully (yes, no one will have played it)
    cy.get('button').contains('Stop Session').click();
    // Loads the results page successfully
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true); 
    });
    // Logs out of the application successfully
    cy.get('button').contains('Logout').click();
    // Logs back into the application successfully
    cy.get('input[type="text"]').eq(0).type('k'); 
    cy.get('input[type="password"]').eq(0).type('password123');
    cy.get('button').contains('Login').click();

  });
});
