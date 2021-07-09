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

import TaskState from '@/model/TaskState.model'

describe('Table view', () => {
  it('Should display the mocked workflow', () => {
    cy.visit('/#/table/one')
    cy
      .get('.c-table table > tbody > tr')
      .should('have.length', 7)
      .should('be.visible')
  })
  describe('Filters', () => {
    it('Should not filter by default', () => {
      cy.visit('/#/table/one')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 7)
        .should('be.visible')
      cy
        .get('#c-table-filter-task-name')
        .should('be.empty')
      cy
        .get('#c-table-filter-task-states')
        .parent()
        .parent()
        .find('input[type="hidden"]')
        .should('have.value', '')
    })
    it('Should filter by task name', () => {
      cy.visit('/#/table/one')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 7)
        .should('be.visible')
      cy
        .get('td > div.d-flex > div')
        .contains('sleepy')
        .should('be.visible')
      // eep should filter sleepy
      cy
        .get('#c-table-filter-task-name')
        .type('eep')
      cy
        .get('#c-table-filter-btn')
        .click()
      cy
        .get('td > div.d-flex > div')
        .contains('sleepy')
        .should('be.visible')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
    it('Should filter by task state', () => {
      cy.visit('/#/table/one')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 7)
        .should('be.visible')
      cy
        .get('td > div.d-flex > div')
        .contains(TaskState.FAILED.name)
        .should('be.visible')
      cy
        .get('#c-table-filter-task-states')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains(TaskState.RUNNING.name)
        .click({ force: true })
      cy
        .get('#c-table-filter-btn')
        .click({ force: true })
      cy
        .get('td > div.d-flex > div')
        .contains('checkpoint')
        .should('be.visible')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
    it.only('Should filter by task name and states', () => {
      cy.visit('/#/table/one')
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 7)
        .should('be.visible')
      cy
        .get('#c-table-filter-task-states')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains(TaskState.SUBMITTED.name)
        .click({ force: true })
      cy
        .get('#c-table-filter-btn')
        .click({ force: true })
      cy
        .get('.c-table table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('#c-table-filter-task-name')
        .type(TaskState.FAILED.name)
      cy
        .get('#c-table-filter-btn')
        .click()
      cy
        .get('td > div.d-flex > div')
        .contains(TaskState.FAILED.name)
        .should('be.visible')
    })
  })
})
