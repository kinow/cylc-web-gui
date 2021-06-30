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

import subscriptionMixin from '@/mixins/subscription'

/**
 * A mixin used for a View (VueRouter bound component). It uses VueRouter
 * navigation guards to coordinate when a subscription is started.
 *
 * Subscriptions are stopped via the subscriptionComponent mixin, which binds
 * to lifecycle created and beforeDestroy methods of the View/Component.
 *
 * @see Subscription
 * @see SubscriptionQuery
 * @see WorkflowService
 */
export default {
  mixins: [
    subscriptionMixin
  ],
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$workflowService.startSubscriptions()
    })
  },
  beforeRouteUpdate (to, from, next) {
    next(vm => {
      vm.$workflowService.startSubscriptions()
    })
  }
}
