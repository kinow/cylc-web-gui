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

describe('GScan component', () => {
  it('should show all workflows by default', () => {
    cy.visit('/#/')
    cy
      .get('.c-gscan-workflow')
      .should('have.length', 1)
  })
  it('should filter by workflow name', () => {
    cy.visit('/#/')
    cy
      .get('#c-gscan-search-workflows')
      .type('abc')
    cy
      .get('.c-gscan-workflow')
      .should('have.length', 0)
  })
  it('should filter by workflow state', () => {
    cy.visit('/#/')
    cy
      .get('#c-gscan-filter-tooltip-btn')
      .click({ force: true })
    cy
      .get('[role="menu"]:visible')
      .find('.v-label')
      .contains('running')
      .click({ force: true })
    cy
      .get('.c-gscan-workflow')
      .should('have.length', 0)
  })
  it('should filter by workflow tasks state', () => {
    cy.visit('/#/')
    cy
      .get('#c-gscan-filter-tooltip-btn')
      .click({ force: true })
    cy
      .get('[role="menu"]:visible')
      .find('.v-label')
      .contains('failed')
      .click({ force: true })
    cy
      .get('.c-gscan-workflow')
      .should('have.length', 0)
  })
  it('should filter by workflow name, state, and tasks states', () => {
    cy.visit('/#/')
    // OK
    cy
      .get('#c-gscan-search-workflows')
      .type('on')
    cy
      .get('#c-gscan-filter-tooltip-btn')
      .click({ force: true })
    // OK
    cy
      .get('[role="menu"]:visible')
      .find('.v-label')
      .contains('pause')
      .click({ force: true })
    // OK
    cy
      .get('[role="menu"]:visible')
      .find('.v-label')
      .contains('submitted')
      .click({ force: true })
    cy
      .get('.c-gscan-workflow')
      .should('have.length', 1)
  })
})
