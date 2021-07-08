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
    class="c-table ma-0 pa-2"
  >
    <!-- Toolbar -->
    <v-row
      no-gutters
        class="d-flex flex-wrap"
    >
      <!-- Filters -->
      <v-col
        v-if="filterable"
        class="grow"
      >
        <v-row
          no-gutters
        >
          <v-col
            cols="12"
            md="5"
            class="pr-md-2 mb-2 mb-md-0"
          >
            <v-text-field
              id="c-table-filter-task-name"
              clearable
              dense
              flat
              hide-details
              outlined
              placeholder="Filter by task name"
              v-model="tasksFilter.name"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="5"
            class="pr-md-2 mb-2 mb-md-0"
          >
            <v-select
              id="c-table-filter-task-states"
              :items="taskStates"
              clearable
              dense
              flat
              hide-details
              multiple
              outlined
              placeholder="Filter by task state"
              v-model="tasksFilter.states"
            >
              <template v-slot:item="slotProps">
                <Task :status="slotProps.item.value"/>
                <span class="ml-2">{{ slotProps.item.value }}</span>
              </template>
              <template v-slot:selection="slotProps">
                <div class="mr-2" v-if="slotProps.index >= 0 && slotProps.index < maximumTasks">
                  <Task :status="slotProps.item.value"/>
                </div>
                <span
                  v-if="slotProps.index === maximumTasks"
                  class="grey--text caption"
                >
            (+{{ tasksFilter.states.length - maximumTasks }})
          </span>
              </template>
            </v-select>
          </v-col>
          <v-col
            cols="12"
            md="2">
            <!-- TODO: we shouldn't need to set the height (px) here, but for some reason the Vuetify
                       components don't seem to agree on the height here -->
            <v-btn
              id="c-table-filter-btn"
              height="40"
              block
              outlined
              @click="filterTasks"
            >Filter</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="filteredTasks"
    >
      <template
        slot="headerCell"
        slot-scope="{ header }"
      >
        <span
            class="subheading font-weight-light text-success text--darken-3"
            v-text="header.text"
          />
      </template>
      <template
          slot="item"
          slot-scope="{ item }"
        >
        <tr>
          <td>
            <div class="d-flex align-content-center flex-nowrap">
              <div class="mr-1">
                <Task
                  v-cylc-object="item.id"
                  :status="item.node.state"
                  :startTime="taskStartTime(item, item.latestJob)"
                  :estimatedDuration="taskEstimatedDuration(item.node)"
                />
              </div>
              <div class="mr-1">
                <Job :status="item.node.state" />
              </div>
              <div>{{ item.node.name }}</div>
            </div>
          </td>
          <td>{{ item.node.cyclePoint }}</td>
          <td>{{ item.latestJob.platform }}</td>
          <td>{{ item.latestJob.jobRunnerName }}</td>
          <td>{{ item.latestJob.jobId }}</td>
          <td>{{ item.latestJob.submittedTime }}</td>
          <td>{{ item.latestJob.startedTime }}</td>
          <td>{{ item.latestJob.finishedTime }}</td>
          <td>{{ item.meanElapsedTime }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import TaskState from '@/model/TaskState.model'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import cloneDeep from 'lodash/cloneDeep'
import { taskStartTime, taskEstimatedDuration } from '@/utils/tasks'

export default {
  name: 'TableComponent',
  props: {
    tasks: {
      type: Array,
      required: true
    },
    filterable: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Task,
    Job
  },
  data () {
    return {
      headers: [
        {
          text: 'Task'
        },
        {
          text: 'Cycle Point'
        },
        {
          text: 'Host'
        },
        {
          text: 'Job System'
        },
        {
          text: 'Job ID'
        },
        {
          text: 'T-submit'
        },
        {
          text: 'T-start'
        },
        {
          text: 'T-finish'
        },
        {
          text: 'dT-mean'
        }
      ],
      tasksFilter: {
        name: '',
        states: []
      },
      activeFilters: null,
      maximumTasks: 4
    }
  },
  computed: {
    taskStates () {
      return TaskState.enumValues.map(taskState => {
        return {
          text: taskState.name.replace(/_/g, ' '),
          value: taskState.name
        }
      }).sort((left, right) => {
        return left.text.localeCompare(right.text)
      })
    },
    tasksFilterStates () {
      return this.activeFilters.states
    },
    filteredTasks () {
      const filterByName = this.filterByTaskName()
      const filterByState = this.filterByTaskState()
      return this.tasks
        .filter(task => {
          if (filterByName && filterByState) {
            return task.node.name.includes(this.activeFilters.name) && this.tasksFilterStates.includes(task.state)
          } else if (filterByName) {
            return task.node.name.includes(this.activeFilters.name)
          } else if (filterByState) {
            return this.tasksFilterStates.includes(task.node.state)
          }
          return true
        })
    }
  },
  methods: {
    filterByTaskName () {
      return this.activeFilters &&
        this.activeFilters.name !== undefined &&
        this.activeFilters.name !== null &&
        this.activeFilters.name.trim() !== ''
    },
    filterByTaskState () {
      return this.activeFilters &&
        this.activeFilters.states !== undefined &&
        this.activeFilters.states !== null &&
        this.activeFilters.states.length > 0
    },
    filterTasks () {
      const taskNameFilterSet = this.tasksFilter.name !== undefined &&
        this.tasksFilter.name !== null &&
        this.tasksFilter.name.trim() !== ''
      const taskStatesFilterSet = this.tasksFilter.states !== undefined &&
        this.tasksFilter.states !== null &&
        this.tasksFilter.states.length > 0
      if (taskNameFilterSet || taskStatesFilterSet) {
        this.activeFilters = cloneDeep(this.tasksFilter)
      } else {
        this.activeFilters = null
      }
    },
    taskStartTime,
    taskEstimatedDuration
  }
}
</script>
