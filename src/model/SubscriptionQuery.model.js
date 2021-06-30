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
import { DocumentNode } from 'graphql'

/**
 * A subscription query. It is part of a Subscription, and contains query and auxiliary data
 * such as query name, variables, and callbacks.
 *
 * The name of the query is an important part of the data, as it is used as key in a dictionary
 * that holds the queries. It can be used to merge two queries when they have the same name.
 *
 * Callbacks are Vuex **actions** (i.e. we call store.dispatch(), not store.commit()), and resolve
 * asynchronously.
 *
 * @see Subscription
 */
class SubscriptionQuery {
  /**
   * @param {DocumentNode} query
   * @param {Object.<String, String>} variables
   * @param {String} name
   * @param {Array<String>} actionNames
   * @param {Array<String>} tearDownActionNames
   */
  constructor (query, variables, name, actionNames, tearDownActionNames) {
    this.query = query
    this.variables = variables
    this.name = name
    this.actionNames = actionNames
    this.tearDownActionNames = tearDownActionNames
  }
}

export default SubscriptionQuery
