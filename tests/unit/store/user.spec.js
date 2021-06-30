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
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'

Vue.use(Vuex)

/**
 * Tests for the store/user module.
 */
describe('user', () => {
  const store = new Vuex.Store(storeOptions)
  /**
   * Tests for store.user.
   */
  describe('user', () => {
    const resetState = () => {
      store.state.user.user = null
    }
    beforeEach(resetState)
    afterEach(resetState)
    it('should start with no user', () => {
      expect(store.state.user.user).to.equal(null)
    })
    it('should set user', () => {
      const user = {
        id: 1,
        username: 'cylc'
      }
      store.dispatch('user/setUser', user)
      expect(store.state.user.user).to.deep.equal(user)
    })
  })
})
