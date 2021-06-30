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
  <v-container
    fluid
    grid-list
    class="c-dashboard mt-4"
  >
    <v-layout wrap>
      <v-flex xs12 md6 lg6>
        <p class="display-1">Workflows</p>
        <v-data-table
          :headers="workflowsHeader"
          :items="workflowsTable"
          :loading="isLoading"
          hide-default-footer
          hide-default-header
        >
          <v-progress-linear slot="progress" color="grey" indeterminate></v-progress-linear>
          <!-- TODO: remove it if the linter is fixed later #510 -->
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.count="{ item }">
            <v-skeleton-loader
              :loading="isLoading"
              :max-width="50"
              type="table-cell"
              tile
              >
                <span class="headline font-weight-light">{{ item.count }}</span>
            </v-skeleton-loader>
          </template>
          <!-- TODO: remove it if the linter is fixed later #510 -->
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.text="{ item }">
            <span class="title font-weight-light">{{ item.text }}</span>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs12 md6 lg6>
        <p class="display-1">Events</p>
        <v-data-table
          :headers="eventsHeader"
          :items="events"
          hide-default-footer
          hide-default-header
        >
          <!-- TODO: remove it if the linter is fixed later #510 -->
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.id="{ item }">
            <span class="title font-weight-light">{{ item.id }}</span>
          </template>
          <!-- TODO: remove it if the linter is fixed later #510 -->
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.text="{ item }">
            <span class="title font-weight-light">{{ item.text }}</span>
          </template>
          <template v-slot:no-data>
            <td class="title">No events</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-divider />
    <v-layout wrap>
      <v-flex xs12 md6 lg6>
        <v-list three-line>
          <v-list-item to="/workflows">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.table }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Workflows Table
              </v-list-item-title>
              <v-list-item-subtitle>
                View name, host, port, etc. of your workflows
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/user-profile">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.settings }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Settings
              </v-list-item-title>
              <v-list-item-subtitle>
                View your Hub permissions, and alter user preferences
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :href=hubUrl>
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.hub }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Cylc Hub
              </v-list-item-title>
              <v-list-item-subtitle>
                Visit the Hub to manage your running UI Servers
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
      <v-flex xs12 md6 lg6>
        <v-list three-line>
          <v-list-item href="#/guide">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.quickstart }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Cylc UI Quickstart
              </v-list-item-title>
              <v-list-item-subtitle>
                Learn how to use the Cylc UI
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <!-- TODO: change from latest to stable once out of beta -->
          <v-list-item href="https://cylc.github.io/cylc-doc/latest/html/suite-design-guide/index.html">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.workflow }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Workflow Design Guide
              </v-list-item-title>
              <v-list-item-subtitle>
                How to make complex Cylc and Rose workflows simpler and easier to maintain
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <!-- TODO: change from latest to stable once out of beta -->
          <v-list-item href="https://cylc.github.io/cylc-doc/latest/html/index.html">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon large>{{ svgPaths.documentation }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-light">
                Documentation
              </v-list-item-title>
              <v-list-item-subtitle>
                The complete Cylc documentation
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mdiBook, mdiBookMultiple, mdiBookOpenVariant, mdiCog, mdiHubspot, mdiTable } from '@mdi/js'
import pageMixin from '@/mixins/index'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import { createUrl } from '@/utils/urls'
import WorkflowState from '@/model/WorkflowState.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { DASHBOARD_DELTAS_SUBSCRIPTION } from '@/graphql/queries'

export default {
  name: 'Dashboard',
  mixins: [
    pageMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  metaInfo () {
    return {
      title: this.getPageTitle('App.dashboard')
    }
  },
  data () {
    return {
      query: new SubscriptionQuery(
        DASHBOARD_DELTAS_SUBSCRIPTION,
        {},
        'root',
        ['workflows/applyWorkflowsDeltas'],
        []
      ),
      workflowsHeader: [
        {
          text: 'Count',
          sortable: false,
          value: 'count'
        },
        {
          text: 'Text',
          sortable: false,
          value: 'text'
        }
      ],
      eventsHeader: [
        {
          text: 'ID',
          sortable: false,
          value: 'id'
        },
        {
          text: 'Event',
          sortable: false,
          value: 'text'
        }
      ],
      events: [],
      svgPaths: {
        table: mdiTable,
        settings: mdiCog,
        hub: mdiHubspot,
        quickstart: mdiBook,
        workflow: mdiBookOpenVariant,
        documentation: mdiBookMultiple
      },
      hubUrl: createUrl('/hub/home', false, true)
    }
  },
  computed: {
    ...mapState('workflows', ['workflows']),
    workflowsTable () {
      const count = Object.values(this.workflows)
        .map(workflow => workflow.status)
        .reduce((acc, state) => {
          acc[state] = (acc[state] || 0) + 1
          return acc
        }, {})
      return WorkflowState.enumValues
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(state => {
          return {
            text: state.name.charAt(0).toUpperCase() + state.name.slice(1),
            count: count[state.name] || 0
          }
        })
    }
  }
}
</script>
