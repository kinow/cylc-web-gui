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
  <div
    class="c-gscan"
  >
    <v-skeleton-loader
      :loading="isLoading"
      type="list-item-three-line"
    >
      <!-- filters -->
      <div class="d-flex flex-row mx-4 mb-2">
        <v-text-field
          v-model="searchWorkflows"
          clearable
          flat
          dense
          hide-details
          outlined
          placeholder="Search"
          class="flex-grow-1 flex-column"
          id="c-gscan-search-workflows"
        />
        <v-menu
          v-model="showFilterTooltip"
          :close-on-content-click="false"
          offset-x
        >
          <!-- button to activate the filters tooltip -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              link
              icon
              class="flex-grow-0 flex-column"
              id="c-gscan-filter-tooltip-btn"
              @click="showFilterTooltip = !showFilterTooltip"
            >
              <v-icon>{{ svgPaths.filter }}</v-icon>
            </v-btn>
          </template>
          <!-- filters tooltip -->
          <v-card
            max-height="250px"
          >
            <v-list
              dense
            >
              <div
                v-for="filter in filters"
                :key="filter.title"
              >
                <v-list-item dense>
                  <v-list-item-content ma-0>
                    <v-list-item-title>
                      <v-checkbox
                        :label="filter.title"
                        :input-value="allItemsSelected(filter.items)"
                        value
                        dense
                        hide-details
                        hint="Toggle all"
                        @click="toggleItemsValues(filter.items)"
                      ></v-checkbox>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider />
                <v-list-item
                  v-for="item in filter.items"
                  :key="`${filter.title}-${item.text}`"
                  dense
                >
                  <v-list-item-action>
                    <v-checkbox
                      :label="item.text"
                      v-model="item.model"
                      dense
                      height="20"
                    ></v-checkbox>
                  </v-list-item-action>
                </v-list-item>
              </div>
            </v-list>
          </v-card>
        </v-menu>
      </div>
      <!-- data -->
      <div
        v-if="!isLoading && sortedWorkflows && sortedWorkflows.length > 0"
        class="c-gscan-workflows"
      >
        <tree
          :filterable="false"
          :expand-collapse-toggle="false"
          :workflows="sortedWorkflows"
          class="c-gscan-workflow"
        >
          <template v-slot:node="scope">
            <v-list-item
              :to="workflowLink(scope.node)"
              :class="getWorkflowClass(scope.node.node)"
            >
              <v-list-item-title>
                <v-layout align-center align-content-center d-flex flex-nowrap>
                  <v-flex
                    v-if="scope.node.type === 'workflow-name-part'"
                    class="c-gscan-workflow-name"
                  >
                    <span>{{ scope.node.node.name || scope.node.id }}</span>
                  </v-flex>
                  <v-flex
                    v-else-if="scope.node.type === 'workflow'"
                    class="c-gscan-workflow-name"
                  >
                    <workflow-icon
                      :status="scope.node.node.status"
                      class="mr-2"
                    />
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <span v-on="on">{{ scope.node.node.name || scope.node.id }}</span>
                      </template>
                      <span>{{ scope.node.node.name || scope.node.id }}</span>
                    </v-tooltip>
                  </v-flex>
                  <!-- We check the latestStateTasks below as offline workflows won't have a latestStateTasks property -->
                  <v-flex
                    v-if="scope.node.type === 'workflow' && scope.node.node.latestStateTasks"
                    class="text-right c-gscan-workflow-states"
                  >
                    <!-- task summary tooltips -->
                    <span
                      v-for="[state, tasks] in getLatestStateTasks(Object.entries(scope.node.node.latestStateTasks))"
                      :key="`${scope.node.id}-summary-${state}`"
                      :class="getTaskStateClasses(scope.node.node, state)"
                    >
                    <v-tooltip color="black" top>
                      <template v-slot:activator="{ on }">
                        <!-- a v-tooltip does not work directly set on Cylc job component, so we use a dummy button to wrap it -->
                        <!-- NB: most of the classes/directives in these button are applied so that the user does not notice it is a button -->
                        <v-btn
                          v-on="on"
                          class="ma-0 pa-0"
                          min-width="0"
                          min-height="0"
                          style="font-size: 120%; width: auto"
                          :ripple="false"
                          dark
                          icon
                        >
                          <job :status="state" />
                        </v-btn>
                      </template>
                      <!-- tooltip text -->
                      <span>
                        <span class="grey--text">{{ countTasksInState(scope.node.node, state) }} {{ state }}. Recent {{ state }} tasks:</span>
                        <br/>
                        <span v-for="(task, index) in tasks.slice(0, maximumTasksDisplayed)" :key="index">
                          {{ task }}<br v-if="index !== tasks.length -1" />
                        </span>
                      </span>
                    </v-tooltip>
                  </span>
                  </v-flex>
                </v-layout>
              </v-list-item-title>
            </v-list-item>
          </template>
        </tree>
      </div>
      <!-- when no workflows are returned in the GraphQL query -->
      <div v-else>
        <v-list-item>
          <v-list-item-title class="grey--text">No workflows found</v-list-item-title>
        </v-list-item>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mdiFilter } from '@mdi/js'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import JobState from '@/model/JobState.model'
import TaskState from '@/model/TaskState.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import WorkflowState from '@/model/WorkflowState.model'
import Job from '@/components/cylc/Job'
import Tree from '@/components/cylc/tree/Tree'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon'
import { createWorkflowNode } from '@/components/cylc/gscan/nodes'
import { GSCAN_DELTAS_SUBSCRIPTION } from '@/graphql/queries'

export default {
  name: 'GScan',
  components: {
    Job,
    Tree,
    WorkflowIcon
  },
  mixins: [
    subscriptionComponentMixin
  ],
  data () {
    return {
      query: new SubscriptionQuery(
        GSCAN_DELTAS_SUBSCRIPTION,
        {},
        'root',
        ['workflows/applyWorkflowsDeltas'],
        ['workflows/clearWorkflows']
      ),
      maximumTasksDisplayed: 5,
      svgPaths: {
        filter: mdiFilter
      },
      /**
       * The filtered workflows. This is the result of applying the filters
       * on the workflows prop.
       * @type {[
       *   {
       *     id: string,
       *     name: string,
       *     stateTotals: Map<string, string>,
       *     status: string
       *   }
       * ]}
       */
      filteredWorkflows: [],
      /**
       * Value to search and filter workflows.
       * @type {string}
       */
      searchWorkflows: '',
      /**
       * Variable to control whether the filters tooltip (a menu actually)
       * is displayed or not (i.e. v-model=this).
       * @type {boolean}
       */
      showFilterTooltip: false,
      /**
       * List of filters to be displayed by the template, so that the user
       * can filter the list of workflows.
       *
       * Each entry contains a title and a list of items. Each item contains
       * the text attribute, which is used as display value in the template.
       * The value attribute, which may be used if necessary, as it contains
       * the original value (e.g. an Enum, while title would be some formatted
       * string). Finally, the model is bound via v-model, and keeps the
       * value selected in the UI (i.e. if the user checks the "running"
       * checkbox, the model here will be true, if the user unchecks it,
       * then it will be false).
       *
       * @type {[
       *   {
       *     title: string,
       *     items: [{
       *       text: string,
       *       value: object,
       *       model: boolean
       *     }]
       *   }
       * ]}
       */
      filters: [
        {
          title: 'workflow state',
          items: WorkflowState.enumValues
            .map(state => {
              return {
                text: state.name,
                value: state,
                model: true
              }
            })
        },
        {
          title: 'task state',
          items: TaskState.enumValues.map(state => {
            return {
              text: state.name,
              value: state,
              model: false
            }
          }).sort((left, right) => {
            return left.text.localeCompare(right.text)
          })
        }
        // {
        //   title: 'workflow host',
        //   items: [] // TODO: will it be in state totals?
        // },
        // {
        //   title: 'cylc version',
        //   items: [] // TODO: will it be in state totals?
        // }
      ]
    }
  },
  computed: {
    ...mapState('workflows', ['workflows']),
    /**
     * Sort workflows by type first, showing running or paused workflows first,
     * then stopped. Within each group, workflows are sorted alphabetically
     * (natural sort).
     */
    sortedWorkflows () {
      return [...this.filteredWorkflows].sort((left, right) => {
        if (left.status !== right.status) {
          const leftState = WorkflowState.enumValueOf(left.status.toUpperCase())
          const rightState = WorkflowState.enumValueOf(right.status.toUpperCase())
          return leftState.enumOrdinal - rightState.enumOrdinal
        }
        return left.name
          .localeCompare(
            right.name,
            undefined,
            { numeric: true, sensitivity: 'base' })
      })
        .map(workflow => {
          return createWorkflowNode(workflow, true)
        })
    }
  },
  watch: {
    /**
     * If the user changes the list of filters, then we apply
     * the filters to the list of workflows.
     */
    filters: {
      deep: true,
      immediate: false,
      handler: function (newVal) {
        this.filterWorkflows(Object.values(this.workflows), this.searchWorkflows, newVal)
      }
    },
    /**
     * If the user changes the workflow name to search/filter,
     * then we apply the filters to the list of workflows.
     */
    searchWorkflows: {
      immediate: false,
      handler: function (newVal) {
        this.filterWorkflows(Object.values(this.workflows), newVal, this.filters)
      }
    },
    workflows: {
      immediate: true,
      handler: function () {
        this.filterWorkflows(Object.values(this.workflows), this.searchWorkflows, this.filters)
      }
    }
  },
  methods: {
    getWorkflowClass (node) {
      return {
        'c-workflow-stopped': node && node.status && node.status === WorkflowState.STOPPED.name
      }
    },

    /**
     * Filter a list of workflows using a given name (could be a part of
     * a name) and a given list of filters.
     *
     * The list of filters may contain workflow states ("running", "stopped",
     * "paused"), and/or task states ("running", "waiting", "submit-failed",
     * etc).
     *
     * Does not return any value, but modifies the data variable
     * filteredWorkflows, used in the template.
     *
     * @param {[
     *  {
     *   id: string,
     *   name: string,
     *   stateTotals: Map<string, string>,
     *   status: string
     *  }
     * ]} workflows list of workflows
     * @param {string} name
     * @param {[]} filters
     */
    filterWorkflows (workflows, name, filters) {
      // filter by name
      this.filteredWorkflows = workflows
      if (name && name !== '') {
        this.filteredWorkflows = this.filteredWorkflows
          .filter(workflow => workflow.name.includes(name))
      }
      // get a list of the workflow states we are filtering
      const workflowStates = filters[0]
        .items
        .filter(item => item.model)
        .map(item => item.value.name)
      // get a list of the task states we are filtering
      const taskStates = new Set(filters[1]
        .items
        .filter(item => item.model)
        .map(item => item.value.name))
      // filter workflows
      this.filteredWorkflows = this.filteredWorkflows.filter((workflow) => {
        // workflow states
        if (!workflowStates.includes(workflow.status)) {
          return false
        }
        // task states
        if (taskStates.size > 0) {
          const thisWorkflowStates = workflow.stateTotals ? this.getWorkflowStates(workflow.stateTotals) : []
          const intersection = thisWorkflowStates.filter(item => taskStates.has(item.text))
          return intersection.length !== 0
        }
        return true
      })
    },

    /**
     * @param stateTotals {Map<string, string>} - object with the keys being states, and values the count
     * @return {[{
     *   text: string,
     *   summary: string
     * }]}
     */
    getWorkflowStates (stateTotals) {
      if (!stateTotals) {
        return []
      }
      const jobStates = JobState.enumValues.map(jobState => jobState.name)
      const workflowStates = Object
        .entries(stateTotals)
        .filter(stateTotal => {
          // GraphQL will return all the task states possible in a workflow, but we
          // only want the states that have an equivalent state for a job. So we filter
          // out the states that do not exist for jobs, and that have active tasks in
          // the workflow (no point keeping the empty states, as they are not to be
          // displayed).
          return jobStates.includes(stateTotal[0]) && stateTotal[1] > 0
        })
      const summary = workflowStates
        .map(stateTotal => `${stateTotal[0]}, ${stateTotal[1]}`)
        .join(', ')
      return workflowStates
        .map(stateTotal => {
          return {
            text: stateTotal[0],
            summary: `Tasks: ${summary}`
          }
        })
    },

    /**
     * Return `true` iff all the items have been selected. `false` otherwise.
     *
     * @param {[
     *   {
     *     model: boolean
     *   }
     * ]} items - filter items
     * @returns {boolean} - `true` iff all the items have been selected. `false` otherwise
     */
    allItemsSelected (items) {
      return items.every(item => item.model === true)
    },

    /**
     * If every element in the list is `true`, then we will set every element in the
     * list to `false`. Otherwise, we set all the elements in the list to `true`.
     * @param {[
     *   {
     *     model: boolean
     *   }
     * ]} items - filter items
     */
    toggleItemsValues (items) {
      const newValue = !this.allItemsSelected(items)
      items.forEach(item => {
        item.model = newValue
      })
    },

    workflowLink (node) {
      if (node.type === 'workflow') {
        return `/workflows/${ node.node.name }`
      }
      return ''
    },

    /**
     * Get number of tasks we have in a given state. The states are retrieved
     * from `latestStateTasks`, and the number of tasks in each state is from
     * the `stateTotals`. (`latestStateTasks` includes old tasks).
     *
     * @param {WorkflowGraphQLData} workflow - the workflow object retrieved from GraphQL
     * @param {string} state - a workflow state
     * @returns {number|*} - the number of tasks in the given state
     */
    countTasksInState (workflow, state) {
      if (Object.hasOwnProperty.call(workflow.stateTotals, state)) {
        return workflow.stateTotals[state]
      }
      return 0
    },

    getTaskStateClasses (workflow, state) {
      const tasksInState = this.countTasksInState(workflow, state)
      return tasksInState === 0 ? ['empty-state'] : []
    },

    // TODO: temporary filter, remove after b0 - https://github.com/cylc/cylc-ui/pull/617#issuecomment-805343847
    getLatestStateTasks (latestStateTasks) {
      // Values found in: https://github.com/cylc/cylc-flow/blob/9c542f9f3082d3c3d9839cf4330c41cfb2738ba1/cylc/flow/data_store_mgr.py#L143-L149
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      return latestStateTasks.filter(entry => {
        return validValues.includes(entry[0])
      })
    }
  }
}
</script>
