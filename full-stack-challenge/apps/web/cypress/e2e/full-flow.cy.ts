describe('Fluxo completo do usuário', () => {
  const timestamp = Date.now();
  const machineName = `Cypress Máquina ${timestamp}`;
  const pointName = `0-Cypress Ponto ${timestamp}`;
  const pointNameEdited = `${pointName} (editado)`;

  it('login, CRUD de máquina e ponto, sensor, edição, exclusão e logout', () => {
    cy.log('1. Rota privada bloqueada sem login');
    cy.clearLocalStorage();
    cy.visit('/machines');
    cy.location('pathname').should('eq', '/login');

    cy.log('2. Login');
    cy.get('input[type="email"]').type('avaliador@dynamox.com');
    cy.get('input[type="password"]').type('dynamox2026');
    cy.contains('button', 'Entrar com e-mail e senha').click();
    cy.location('pathname').should('eq', '/');
    cy.contains('h1', 'Dashboard').should('be.visible');

    cy.log('3. Criar máquina');
    cy.contains('Máquinas').click();
    cy.location('pathname').should('eq', '/machines');
    cy.contains('button', 'Nova máquina').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('label', 'Nome').parent().find('input').type(machineName);
      cy.contains('.MuiFormControl-root', 'Tipo').find('.MuiSelect-select').click();
    });
    cy.get('ul[role="listbox"]').contains('li', 'Ventilador').click();
    cy.get('div[role="dialog"]').within(() => {
            cy.contains('button', 'Salvar').click();
    });
    cy.contains('tr', machineName).should('be.visible');

    cy.log('4. Criar ponto de monitoramento');
    cy.contains('Pontos de monitoramento').click();
    cy.location('pathname').should('eq', '/monitoring-points');
    cy.contains('button', 'Novo ponto').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('.MuiFormControl-root', 'Máquina').find('.MuiSelect-select').click();
    });
    cy.get('ul[role="listbox"]').contains('li', machineName).click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('label', 'Nome do ponto').parent().find('input').type(pointName);
      cy.contains('button', 'Criar').click();
    });
    cy.contains('.MuiDataGrid-row', pointName).should('be.visible');

    cy.log('5. Associar sensor');
    cy.contains('.MuiDataGrid-row', pointName).within(() => {
      cy.contains('Associar sensor').click();
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('label', 'Número de série').parent().find('input').type(`CY-${timestamp}`);
      cy.contains('.MuiFormControl-root', 'Modelo').find('.MuiSelect-select').click();
    });
    cy.get('ul[role="listbox"]').contains('li', 'HF+').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('button', 'Associar').click();
    });
    cy.contains('.MuiDataGrid-row', pointName).contains('HF+').should('be.visible');

    cy.log('6. Editar o ponto');
    cy.contains('.MuiDataGrid-row', pointName).within(() => {
      cy.get('button').eq(0).click();
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('label', 'Nome do ponto').parent().find('input').clear().type(pointNameEdited);
      cy.contains('button', 'Salvar').click();
    });
    cy.contains('.MuiDataGrid-row', pointNameEdited).should('be.visible');

    cy.log('7. Limpeza — excluir ponto e máquina');
    cy.contains('.MuiDataGrid-row', pointNameEdited).within(() => {
      cy.get('button').eq(1).click();
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('button', 'Excluir').click();
    });
    cy.contains('.MuiDataGrid-row', pointNameEdited).should('not.exist');

    cy.contains('Máquinas').click();
    cy.contains('tr', machineName).within(() => {
      cy.get('button').eq(1).click();
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.contains('button', 'Excluir').click();
    });
    cy.contains('tr', machineName).should('not.exist');

    cy.log('8. Logout');
    cy.get('.MuiAvatar-root').click();
    cy.contains('li', 'Sair').click();
    cy.location('pathname').should('eq', '/login');
  });
});