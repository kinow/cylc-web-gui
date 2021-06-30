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
import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import mixin from '@/mixins/toolbar'
import storeOptions from '@/store/options'

Vue.use(Vuex)

describe('Toolbar mixin', () => {
  const store = new Vuex.Store(storeOptions)
  it('should create the default data correctly', () => {
    const oldWindow = global.window
    global.window = {
      innerWidth: 10000,
      addEventListener: () => {}
    }
    const component = shallowMount({
      mixins: [mixin],
      render () {}
    })
    expect(component.vm.$data.responsive).to.equal(false)
    expect(component.vm.$data.responsiveInput).to.equal(true)
    global.window = oldWindow
  })
  it('should swap the values on responsive', () => {
    const oldWindow = global.window
    global.window = {
      innerWidth: 1,
      addEventListener: () => {}
    }
    const component = shallowMount({
      mixins: [mixin],
      render () {}
    })
    expect(component.vm.$data.responsive).to.equal(true)
    expect(component.vm.$data.responsiveInput).to.equal(false)
    global.window = oldWindow
  })
  it('should swap the values on responsive', () => {
    const oldWindow = global.window
    global.window = {
      innerWidth: 1,
      addEventListener: () => {}
    }
    const component = shallowMount({
      mixins: [mixin],
      render () {}
    })
    expect(component.vm.$data.responsive).to.equal(true)
    expect(component.vm.$data.responsiveInput).to.equal(false)
    global.window = oldWindow
  })
  it('should remove event listeners when destroyed', () => {
    let called = false
    const oldWindow = global.window
    global.window = {
      addEventListener: () => {},
      removeEventListener: () => {
        called = true
      }
    }
    const component = shallowMount({
      mixins: [mixin],
      render () {}
    })
    component.vm.$destroy()
    expect(called).to.equal(true)
    global.window = oldWindow
  })
  it('should toggle the drawer when clicked', () => {
    store.state.app.drawer = false
    const component = shallowMount({
      mixins: [mixin],
      render () {},
      store
    })
    component.vm.onClickBtn()
    expect(store.state.app.drawer).to.equal(true)
    store.state.app.drawer = null
  })
})
