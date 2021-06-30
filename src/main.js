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

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Plugins
import './plugins'
import vuetify from './plugins/vuetify'

// Application imports
import App from './App'
import i18n from '@/i18n/index'
import router from '@/router/index'
import store from '@/store/index'

import mitt from 'mitt'

Vue.prototype.$eventBus = mitt()

Vue.config.productionTip = false

/* eslint-disable no-new */
const app = new Vue({
  i18n,
  router,
  store,
  vuetify,
  render (h) {
    return h(App)
  }
}).$mount('#app')
// e2e tests use the offline mode, so here we expose the Vue.js app so Cypress can access it programmatically
// e.g. window.app.$store and window.app.$workflowService.
// Ref: https://www.cypress.io/blog/2017/11/28/testing-vue-web-application-with-vuex-data-store-and-rest-backend/
if (process.env.NODE_ENV !== 'production') {
  window.app = app
}
