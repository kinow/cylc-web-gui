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
import Vue from 'vue'
import Vuex from 'vuex'
import User from '@/model/User.model'
import storeOptions from '@/store/options'
import graphqlMixin from '@/mixins/graphql'

Vue.use(Vuex)

const localVue = createLocalVue()

describe('GraphQL mixin', () => {
  const store = new Vuex.Store(storeOptions)
  it('should create the GraphQL Query variables', () => {
    const user = new User('cylc', [], new Date(), true, 'localhost')
    store.commit('user/SET_USER', user)
    const workflowName = 'test'
    const Component = {
      mixins: [graphqlMixin],
      render () {}
    }
    const component = shallowMount(Component, {
      localVue,
      store,
      propsData: {
        workflowName
      }
    })
    const variables = component.vm.variables
    const expected = {
      workflowId: `${user.username}|${workflowName}`
    }
    expect(variables).to.deep.equal(expected)
  })
})
