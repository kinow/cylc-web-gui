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
import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify/lib'
import App from '@/App'
import Empty from '@/layouts/Empty'
import storeOptions from '@/store/options'

const localVue = createLocalVue()

Vue.use(Vuex)

describe('App', () => {
  const store = new Vuex.Store(storeOptions)
  let vuetify
  let $route
  const mountFunction = options => {
    return mount(App, {
      localVue,
      vuetify,
      store,
      components: {
        'empty-layout': Empty
      },
      stubs: ['router-link', 'router-view'],
      mocks: {
        $route,
        $vuetify: {
          application: {
            register: () => {}
          },
          theme: {
            dark: false,
            isDark: function () {
              return this.dark
            }
          }
        },
        $t: () => {} // vue-i18n
      },
      ...options
    })
  }
  beforeEach(() => {
    $route = {
      name: 'app',
      meta: {
        layout: 'empty'
      }
    }
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
    global.localStorage = window.localStorage
  })
  it('should create the App with the correct theme', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.jobTheme).to.equal('default')
    expect(wrapper.vm.jobThemeClass).to.equal('job_theme--default')
  })
  it('should create the App with the correct layout', () => {
    const wrapper = mountFunction()
    // default is empty, unless the route specifies another layout
    expect(wrapper.vm.layout).to.equal('empty-layout')
  })
})
