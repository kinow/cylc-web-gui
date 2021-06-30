import { mapState } from 'vuex'

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

// eslint-disable-next-line no-unused-vars
import User from '@/model/User.model'

/**
 * A mixin that contains data used for a GraphQL subscription, such as the
 * query variables.
 *
 * To be used in Views that are bound to VueRouter routes that contain the
 * :workflowName prop.
 */
export default {
  props: {
    workflowName: {
      type: String,
      required: true
    }
  },
  computed: {
    /**
     * We use the user from the store to compute the workflow ID. The view
     * has only the workflow name from the Vue route. We then combine it
     * with the user name and the default divider '|' to create the workflow
     * ID.
     *
     * @return {User}
     */
    ...mapState('user', ['user']),
    /**
     * Compute the workflow ID using the Vue route parameter
     * `workflowName` and the user from the store.
     *
     * @return {string} - the Workflow ID used in this view
     */
    workflowId () {
      return `${this.user.username}|${this.workflowName}`
    },
    /**
     * GraphQL query variables.
     *
     * @returns {{workflowId: string}}
     */
    variables () {
      return {
        workflowId: this.workflowId
      }
    }
  }
}
