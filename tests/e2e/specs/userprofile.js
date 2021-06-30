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
  getCurrentFontSize,
  expectedFontSize,
  resetFontSize,
  INITIAL_FONT_SIZE
} from '@/utils/font-size'
import * as CylcTree from '@/components/cylc/tree/index'

describe('User Profile', () => {
  it('Visits the user profile', () => {
    cy.visit('/#/user-profile')
    cy
      .get('h3.headline')
      .should('be.visible')
      .should('contain', 'Your Profile')
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })
  it('Increases the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    // NOTE: had to use Promises in order to locate right element with Cypress
    cy.get('button#font-size-increase-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.trigger('click')
      }
      const currentFontSize = getCurrentFontSize()
      const expectedNewSize = expectedFontSize(true, clicks)
      expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      cy
        .get('button#font-size-reset-button')
        .click()
    })
  })
  it('Decreases the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    cy.get('button#font-size-decrease-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.trigger('click')
      }
      const currentFontSize = getCurrentFontSize()
      const expectedNewSize = expectedFontSize(false, clicks)
      expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      cy
        .get('button#font-size-reset-button')
        .click()
    })
  })
  it('Resets the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    cy.get('button#font-size-decrease-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.trigger('click')
      }
      cy.get('button#font-size-reset-button').then(($resetButton) => {
        $resetButton.trigger('click')
        const currentFontSize = getCurrentFontSize()
        const expectedNewSize = parseFloat(INITIAL_FONT_SIZE)
        expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      })
    })
  })
  it('Sets the job theme', () => {
    cy.visit('/#/user-profile')
    cy.get('#input-job-theme-default')
      .click({ force: true })
    // set the job theme to normal
    cy.get('.c-gscan:first .c-job:first rect:first')
      .should('have.css', 'fill')
      .then(($fill1) => {
        // set the job theme to greyscale
        cy.get('#input-job-theme-greyscale')
          .click({ force: true })
        cy.get('.c-gscan:first .c-job:first rect:first')
          .should('have.css', 'fill')
          // make sure that the job has changed colour
          .then(($fill2) => {
            expect($fill1).not.to.equal($fill2)
          })
      })
  })
  it('Sets the cycle points order', () => {
    cy.visit('/#/user-profile')
    cy.get('#input-cyclepoints-order')
      .should('have.attr', 'aria-checked', JSON.stringify(CylcTree.DEFAULT_CYCLE_POINTS_ORDER_DESC))
    // change the cycle points order
    cy.get('#input-cyclepoints-order')
      .click({ force: true })
    cy.get('#input-cyclepoints-order')
      .should('have.attr', 'aria-checked', JSON.stringify(!CylcTree.DEFAULT_CYCLE_POINTS_ORDER_DESC))
  })
})
