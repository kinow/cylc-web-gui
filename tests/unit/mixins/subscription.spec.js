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
import { createLocalVue, shallowMount } from '@vue/test-utils'
import sinon from 'sinon'
import Vue from 'vue'
import Vuex from 'vuex'
import Alert from '@/model/Alert.model'
import ViewState from '@/model/ViewState.model'
import storeOptions from '@/store/options'
import subscriptionMixin from '@/mixins/subscription'

Vue.use(Vuex)

const localVue = createLocalVue()

describe('Subscription mixin', () => {
  const store = new Vuex.Store(storeOptions)
  beforeEach(() => {
    sinon.stub(console, 'log')
  })
  afterEach(() => {
    sinon.restore()
  })
  it('should compute the isLoading state', () => {
    const tests = [
      {
        viewState: ViewState.NO_STATE,
        expectedIsLoading: false
      },
      {
        viewState: ViewState.LOADING,
        expectedIsLoading: true
      },
      {
        viewState: ViewState.COMPLETE,
        expectedIsLoading: false
      },
      {
        viewState: ViewState.ERROR,
        expectedIsLoading: false
      }
    ]
    for (const test of tests) {
      const Component = {
        mixins: [subscriptionMixin],
        render () {
        }
      }
      const component = shallowMount(Component, {
        localVue,
        store,
        data () {
          return {
            viewState: test.viewState
          }
        }
      })
      expect(component.vm.isLoading).to.equal(test.expectedIsLoading)
    }
  })
  it('should set the application alert', () => {
    expect(store.state.alert).to.equal(null)
    const Component = {
      mixins: [subscriptionMixin],
      render () {}
    }
    const component = shallowMount(Component, {
      localVue,
      store
    })
    const alert = new Alert('text', null, 'red')
    component.vm.setAlert(alert)
    expect(store.state.alert).to.equal(alert)
  })
})
