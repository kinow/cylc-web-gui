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

// Modules
import { app } from './app.module'
import { workflows } from './workflows.module'
import { user } from './user.module'

// State
const state = {
  /**
   * Application alert.
   */
  alert: null,
  /**
   * Whether the application is loading or not.
   */
  isLoading: false,
  /**
   * Whether the application is offline or not.
   */
  offline: false,
  /**
   * Number of references that have set the loading state.
   * TODO: we can probably remove it and use a different approach for alerts (see bootstrap toast).
   */
  refCount: 0
}

// Actions
const actions = {
  setLoading ({ commit }, isLoading) {
    commit('SET_LOADING', isLoading)
  },
  setAlert ({ state, commit }, alert) {
    // log to console when the alert is not null (null can mean to remove the alert)
    if (alert !== null) {
      // eslint-disable-next-line no-console
      console.log(alert)
    }
    commit('SET_ALERT', alert)
  }
}

// Mutations
const mutations = {
  SET_LOADING (state, isLoading) {
    if (isLoading) {
      state.refCount++
      state.isLoading = isLoading
    } else if (state.refCount > 0) {
      state.refCount--
      state.isLoading = (state.refCount > 0)
    }
  },
  SET_ALERT (state, alert) {
    state.alert = alert
  },
  SET_OFFLINE (state, offline) {
    state.offline = offline
  }
}

// Create a new store
export default {
  modules: {
    app,
    workflows,
    user
  },
  actions,
  mutations,
  state
}
