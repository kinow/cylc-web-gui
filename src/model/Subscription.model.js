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

import ViewState from '@/model/ViewState.model'
import Alert from '@/model/Alert.model'

/**
 * A view or component subscription. Views or components will declare a SubscriptionQuery,
 * that will be used to create a Subscription.
 *
 * A Subscription may contain one or more SubscriptionQuery's. It accumulates the subscribers (views
 * or components), as well as callbacks (Vuex actions).
 *
 * The WorkflowService service will use this Subscription to create a GraphQL Subscription using
 * WebSockets. So any Subscription object created from this class will have a .observable property
 * that can be used to control the GraphQL Subscription.
 *
 * @see SubscriptionQuery
 * @see WorkflowService
 */
class Subscription {
  /**
   * @param {SubscriptionQuery} query
   * @param {boolean} debug
   */
  constructor (query, debug = false) {
    this.query = query
    /**
     * @type {ZenObservable}
     */
    this.observable = null
    /**
     * @type {Object.<String, Vue>}
     */
    this.subscribers = {}
    /**
     * @type {String[]}
     */
    this.actionNames = []
    /**
     * @type {String[]}
     */
    this.tearDownActionNames = []
    this.reload = false
    this.debug = debug
  }

  /**
   * @param {ViewState} viewState
   * @param {*} context
   */
  handleViewState (viewState, context) {
    const _this = this
    if (viewState !== ViewState.ERROR) {
      Object.values(this.subscribers).forEach(subscriber => {
        subscriber.viewState = viewState
      })
    } else {
      Object.values(this.subscribers).forEach(function (subscriber) {
        subscriber.viewState = viewState
        subscriber.setAlert(new Alert(context.message, null, 'error'))
        if (_this.debug) {
          // eslint-disable-next-line no-console
          console.debug(`Subscription error: ${context.message}`, viewState, context)
        }
      })
    }
  }
}

export default Subscription
