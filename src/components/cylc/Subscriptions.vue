<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-container>
    <h3>Subscriptions</h3>
    <v-expansion-panels
      v-for="subscription in subscriptions"
      :key="subscription.name"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>
          {{ subscription.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <pre>{{ subscription.query }}</pre>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <h3>Subscribers</h3>
    <ul
      v-for="(subscriptionNames, subscriberID) in subscribers"
      :key="subscriberID"
    >
      <li>
        {{ subscriberID }}
        <ul
          v-for="subscriptionName in subscriptionNames"
          :key="subscriptionName"
        >
          <li>{{ subscriptionName }}</li>
        </ul>
      </li>
    </ul>
  </v-container>
</template>

<script>
import subscriptionViewMixin from '@/mixins/subscriptionView'

export default {
  name: 'Subscriptions',
  mixins: [subscriptionViewMixin],
  computed: {
    raw () {
      return this.$workflowService.subscriptions
    },
    subscriptions () {
      const subs = this.$workflowService.subscriptions
      // const subscribers = {}
      let sub = null
      let query = null
      const ret = []
      for (const subName in subs) {
        sub = subs[subName]
        query = sub.query.query.loc.source.body
        ret.push({ name: subName, query })
      }
      return ret
    },
    subscribers () {
      const subs = this.$workflowService.subscriptions
      const subscribers = {}
      let sub = null
      for (const subName in subs) {
        sub = subs[subName]
        for (const subscriberID in sub.subscribers) {
          if (!subscribers[subscriberID]) {
            subscribers[subscriberID] = []
          }
          console.log(
            sub.subscribers[subscriberID]
          )
          subscribers[subscriberID].push(subName)
        }
      }
      return subscribers
    }
  }
}
</script>
