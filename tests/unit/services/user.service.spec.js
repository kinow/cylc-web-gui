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

import { expect } from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import UserService from '@/services/user.service'
import storeOptions from '@/store/options'
import Alert from '@/model/Alert.model'

Vue.use(Vuex)

describe('UserService', () => {
  const store = new Vuex.Store(storeOptions)
  let sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
    sandbox.stub(console, 'log')
    store.commit('SET_ALERT', null)
  })
  afterEach(() => sandbox.restore())
  describe('getUserProfile returns the logged-in user profile information', () => {
    it('should return user profile object', () => {
      const userReturned = new Promise((resolve) => resolve(
        {
          data: {
            name: 'cylc-user-01',
            groups: ['root', 'wheel'],
            created: '2019-01-01',
            admin: true
          }
        })
      )
      sandbox.stub(axios, 'get').returns(userReturned)
      return new UserService().getUserProfile()
        .then(function (user) {
          expect(user.username).to.equal('cylc-user-01')
          expect(user.groups.length).to.equal(2)
          expect(user.created).to.equal('2019-01-01')
          expect(user.admin).to.equal(true)
        })
    })
    it('should add an alert on error', () => {
      expect(store.state.alert).to.equal(null)
      const e = new Error('mock error')
      e.response = {
        statusText: 'Test Status'
      }
      sandbox.stub(axios, 'get').rejects(e)
      return new UserService().getUserProfile()
        .catch((error) => {
          const alert = new Alert(error.response.statusText, null, 'error')
          return store.dispatch('setAlert', alert)
        })
        .finally(() => {
          expect(store.state.alert.getText()).to.equal('Test Status')
        })
    })
  })
})
