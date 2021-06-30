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

/**
 * Vue Router
 *
 * @library
 *
 * https://router.vuejs.org/en/
 */

// Lib imports
import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import NProgress from 'nprogress'
import store from '@/store/index'

import 'nprogress/css/nprogress.css'

// Routes
import paths from './paths'
import Alert from '@/model/Alert.model'

function route (path) {
  const copy = Object.assign({}, path)
  const view = copy.view
  return Object.assign(copy, {
    name: path.name || view,
    component: (resolve) => import(
      `@/views/${view}.vue`
    ).then(resolve)
  })
}

Vue.use(Router)

// Create a new router
const router = new Router({
  mode: 'hash',
  routes: paths.map(path => route(path)),
  //  .concat([{ path: '*', redirect: '/dashboard' }]),
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { x: 0, y: 0 }
  }
})

Vue.use(Meta)

router.beforeResolve((to, from, next) => {
  NProgress.start()
  if (to.name) {
    let title
    let workflowName
    if (to.meta.toolbar) {
      // When a workflow is being displayed, we set the title to a
      // different value.
      title = to.params.workflowName
      workflowName = to.params.workflowName
    } else {
      title = to.name
      workflowName = null
    }
    store.commit('app/setTitle', title)
    store.commit('workflows/SET_WORKFLOW_NAME', workflowName)
    store.dispatch('setAlert', null).then(() => {})
  }
  next()
})

router.beforeEach((to, from, next) => {
  if (!store.state.user.user) {
    router.app.$userService.getUserProfile()
      .then((user) => {
        store.commit('user/SET_USER', user)
        next()
      })
      .catch(error => {
        const alert = new Alert(error, null, 'error')
        return store.dispatch('setAlert', alert)
      })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
