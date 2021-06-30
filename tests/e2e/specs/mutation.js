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

import {
  MUTATIONS
} from '../support/graphql'

describe('Mutations component', () => {
  beforeEach(() => {
    cy
      .intercept('/graphql', (req) => {
        const query = req.body.query
        if (query.includes('__schema')) {
          req.reply({
            data: {
              __schema: {
                mutationType: {
                  fields: MUTATIONS
                },
                types: []
              }
            }
          })
        } else {
          console.log(req)
          req.reply({
            data: {
              [req.body.operationName]: {
                result: [true, {}],
                __typename: req.body.operationName.charAt(0).toUpperCase() + req.body.operationName.slice(1)
              }
            }
          })
        }
      })
      .as('HoldMutationQuery')
  })
  /**
   * @param {string} nodeName - the tree node name, to search for and open the mutations form
   */
  const openMutationsForm = (nodeName) => {
    // check that the skeleton does not exist
    cy.get('.lm-Widget')
      .find('.v-skeleton-loader')
      .then((loader) => {
        const firstChild = loader.children('div').first()
        // The skeleton may, or may not, still be displaying in the UI...
        if (firstChild.attr('class') && firstChild.attr('class').includes('skeleton')) {
          cy.wrap(firstChild)
            .should('not.exist')
        }
      })
    cy
      .get('span')
      .contains(nodeName)
      .parent()
      .find('.c-task')
      .click({ force: true })
    cy
      .get('.c-mutation-menu-list:first')
      .find('.v-list-item__action > .v-icon')
      .should('exist')
      .should('be.visible')
      .click({ force: true })
  }
  const submitMutationForms = () => {
    cy.visit('/#/workflows/one')
    cy.window().its('app.$workflowService').then(service => {
      // mock the apollo client's mutate method to catch low-level calls
      service.primaryMutations = {
        workflow: ['workflowMutation']
      }
    })
    cy
      .get('.c-tree')
      .get('.treeitem')
      .get('.c-task')
      .should('be.visible')
    openMutationsForm('BAD')
    cy.wait(['@HoldMutationQuery'])
    // fill mocked mutation form with any data
    cy
      .get('.v-dialog')
      .within(() => {
        // type anything in the text inputs
        cy
          .get('input[type="text"]')
          .each(($el) => {
            cy.wrap($el).clear()
            cy.wrap($el).type('ABC')
          })
        // click on the submit button
        cy
          .get('span')
          .contains('Submit')
          .parent()
          .click()
        // we should now have a c-task icon
        cy
          .get('.c-task')
          .should('be.visible')
      })
  }
  it('should submit a mutation form', () => {
    submitMutationForms()
  })
  it('should not remember data after submitting a mutation form', () => {
    submitMutationForms()
    // close submit form (not clicking on cancel, as it appears to clear the form, but outside the dialog)
    cy
      .get('.v-overlay')
      .click({ force: true })
    // click on the GOOD family proxy now
    openMutationsForm('GOOD')
    cy
      .get('.v-dialog')
      .within(() => {
        // type anything in the text inputs
        cy
          .get('input[type="text"]')
          .each(($el) => {
            cy.wrap($el).should('not.contain.value', 'ABC')
          })
      })
  })
})
