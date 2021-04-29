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

import i18n from '@/i18n'

/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
  {
    path: '/',
    view: 'Dashboard',
    name: i18n.t('App.dashboard'),
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflows',
    name: i18n.t('App.workflows'),
    view: 'WorkflowsTable',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflows/:workflowName(.*)',
    view: 'Workflow',
    name: 'workflow',
    meta: {
      layout: 'default',
      toolbar: true
    },
    props: true
  },
  {
    path: '/mutations',
    view: 'Mutations',
    name: 'mutations',
    meta: {
      layout: 'default'
    },
    props: true
  },
  {
    path: '/user-profile',
    name: i18n.t('App.userProfile'),
    view: 'UserProfile',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/tree/:workflowName(.*)',
    view: 'Tree',
    name: 'tree',
    meta: {
      layout: 'default',
      toolbar: true
    },
    props: true
  },
  {
    path: '/table/:workflowName(.*)',
    view: 'Table',
    name: 'table',
    meta: {
      layout: 'default',
      toolbar: true
    },
    props: true
  },
  {
    path: '/guide',
    name: 'Guide',
    view: 'Guide',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/graphiql',
    view: 'GraphiQL',
    meta: {
      layout: 'empty'
    }
  },
  {
    path: '*',
    view: 'NotFound',
    meta: {
      layout: 'empty'
    }
  }
]
