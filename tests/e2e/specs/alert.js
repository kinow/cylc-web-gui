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

import Alert from '@/model/Alert.model'

const getStore = () => cy.window().its('app.$store')

const COLOR_BLACK = 'rgb(0, 0, 0)'
const COLOR_WHITE = 'rgb(255, 255, 255)'

describe('Alert component', () => {
  it('Is displayed when an alert is present in the central data store', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    const errorMessage = 'Error displayed'
    getStore().then(store => {
      store.dispatch('setAlert', new Alert(errorMessage, null, 'error'))
    })
    cy
      .get('.v-alert')
      .should('contain', errorMessage)
  })
  it('Uses the right color for success', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    getStore().then(store => {
      cy.wrap(store).invoke('commit', 'SET_ALERT', new Alert('An alert', null, 'success'))
      cy.get('.v-alert').then($alertElements => {
        const backgroundColor = window.getComputedStyle($alertElements[0])['background-color']
        expect(backgroundColor).to.not.equal(COLOR_BLACK)
        expect(backgroundColor).to.not.equal(COLOR_WHITE)
      })
      store.commit('SET_ALERT', null)
    })
  })
  it('Uses the right color for warning', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    getStore().then(store => {
      cy.wrap(store).invoke('commit', 'SET_ALERT', new Alert('An alert', null, 'warning'))
      cy.get('.v-alert').then($alertElements => {
        const backgroundColor = window.getComputedStyle($alertElements[0])['background-color']
        expect(backgroundColor).to.not.equal(COLOR_BLACK)
        expect(backgroundColor).to.not.equal(COLOR_WHITE)
      })
      store.commit('SET_ALERT', null)
    })
  })
  it('Uses the right color for error', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    getStore().then(store => {
      cy.wrap(store).invoke('commit', 'SET_ALERT', new Alert('An alert', null, 'error'))
      cy.get('.v-alert').then($alertElements => {
        const backgroundColor = window.getComputedStyle($alertElements[0])['background-color']
        expect(backgroundColor).to.not.equal(COLOR_BLACK)
        expect(backgroundColor).to.not.equal(COLOR_WHITE)
      })
      store.commit('SET_ALERT', null)
    })
  })
  it('Removes the alert from the central data store when it is dismissed by the user', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    const errorMessage = 'Error displayed'
    getStore().then(store => {
      store.dispatch('setAlert', new Alert(errorMessage, null, 'error'))
    })
    cy
      .get('.v-alert')
      .should('contain', errorMessage)
    cy
      .get('.v-alert')
      .get('button')
      .click({ force: true, multiple: true })
    cy
      .get('.v-alert')
      .should('not.exist')
    getStore().then(store => {
      expect(store.state.alert).to.equal(null)
    })
  })
})
