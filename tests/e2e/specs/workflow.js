/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Mutations from '@/views/Mutations'

describe('Workflow view and component/widget', () => {
  afterEach(() => {
    cy
      .get('.v-alert')
      .should('not.exist')
  })
  it('Should display the Workflow component in the Workflow view, with a Tree widget', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
  })
  it('Should remove the default widget and leave no more widgets', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabCloseIcon').click()
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })
  it('Should be able to add two widgets of the same type', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    cy.get('a.add-view').click()
    cy.get('#toolbar-add-Tree-view').click()
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
  })
  it('Should be able to add two widgets of different types', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    cy.get('a.add-view').click()
    cy.get('#toolbar-add-Mutations-view').click()
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    cy
      .get('.lm-TabBar-tabLabel')
      .contains(Mutations.name.toLowerCase())
      .click({ force: true })
    cy.get('h3').contains('Sample Mutation').should('be.visible')
  })
  it('Should remove widgets added successfully', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('a.add-view').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    // close all widgets
    cy.get('.lm-TabBar-tabCloseIcon').click({ multiple: true })
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })
  it('Should remove widgets when leaving the Workflow view', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('a.add-view').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    cy.visit('/#/')
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('not.exist')
  })
  it('Should remove widgets when updating the Workflow view', () => {
    cy.visit('/#/workflows/one')
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
    // add a tree view
    cy.get('a.add-view').click()
    cy.get('#toolbar-add-Tree-view').click()
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 2)
    // this is OK, as we render one for every route/workflow requested
    cy.visit('/#/workflows/two')
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel').should('have.length', 1)
  })
})
