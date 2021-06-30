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

import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import storeOptions from '@/store/options'
import Alert from '@/components/core/Alert'

const localVue = createLocalVue()

Vue.use(Vuetify)

describe('Alert', () => {
  const store = new Vuex.Store(storeOptions)
  /**
   * @param options
   * @returns {Wrapper<Alert>}
   */
  const mountFunction = options => {
    const vuetify = new Vuetify()
    return mount(Alert, {
      localVue,
      vuetify,
      store,
      ...options
    })
  }
  it('should have the colors data', () => {
    const wrapper = mountFunction()
    expect(wrapper.colors).to.not.equal(null)
  })
  it('should retrieve colors correctly', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.getColor('error')).to.equal('red')
  })
  it('should return empty if color is not available', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.getColor('unavailable-color')).to.equal('')
  })
})
