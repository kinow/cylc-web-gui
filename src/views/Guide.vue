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
    <h1 class="ma-0">Guide</h1>
    <!--
      TODO: make sections linkable

      TODO: add a contents bar which:
            * links to the guide sections
            * is presented when space is available
            * stays in a fixed position when scrolling (i.e. position: fixed)
            * tracks scroll position
    -->

    <h2 id="task-and-job-states">
      Task And Job States
    </h2>
    <!-- TODO document difference between tasks and jobs -->
    <div class="card-grid">

      <v-flex
        md6
        xs12
      >
        <v-card>
          <v-card-title primary-title>
            <p class="display-1 text--primary">Task State Vs Job State</p>
          </v-card-title>
          <v-card-text>
            <table id="task-job-state-table">
              <tr>
                <td>Task</td>
                <td></td>
                <td>Job</td>
              </tr>
              <tr>
                <td>
                  <p>
                    The status of the task in the workflow.
                  </p>
                </td>
                <td></td>
                <td>
                  <p>
                    The status of a single job submission,
                    one task can have multiple jobs.
                  </p>
                </td>
              </tr>
              <tr
                v-bind:key="state.name.name"
                v-for="state of states"
              >
                <td style="font-size: 2em;">
                  <!-- set times to make the progress change -->
                  <task
                    :status="state.name"
                    :startTime="Date.now()"
                    :estimatedDuration="30"
                  />
                </td>
                <td>
                  <span>{{ state.name }}</span>
                </td>
                <td style="font-size: 2em;">
                  <job :status="state.name" />
                </td>
              </tr>
            </table>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex
        md5
        xs12
      >
        <v-card>
          <v-card-title primary-title>
            <p class="display-1 text--primary">Special Task States</p>
          </v-card-title>
          <v-card-text>
            <v-list
              three-line
            >
              <v-list-item>
                <v-list-item-icon>
                  <task
                    style="font-size: 2em;"
                    status="waiting"
                    :isHeld="true"
                  />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    Held
                  </v-list-item-title>
                  <v-list-item-sub-title>
                    When a task is "held" no new job submissions will be made
                  </v-list-item-sub-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                  <v-list-item-icon>
                    <task
                      style="font-size: 2em;"
                      status="waiting"
                      :isQueued="true"
                    />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      Queued
                    </v-list-item-title>
                    <v-list-item-sub-title>
                      Task queued for job submission
                    </v-list-item-sub-title>
                  </v-list-item-content>
              </v-list-item>
              <v-list-item>
                  <v-list-item-icon>
                    <task
                      style="font-size: 2em;"
                      status="waiting"
                      :isRunahead="true"
                    />
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      Runahead
                    </v-list-item-title>
                    <v-list-item-sub-title>
                      Task held back by runahead limiting
                    </v-list-item-sub-title>
                  </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-flex>
    </div>

  </v-container>
</template>

<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { TaskStateUserOrder } from '@/model/TaskState.model'
import subscriptionViewMixin from '@/mixins/subscriptionView'

export default {
  name: 'Guide',
  mixins: [subscriptionViewMixin],
  components: {
    task: Task,
    job: Job
  },
  // TODO: extract task states and descriptions from the GraphQL API
  //       once this is an enumeration.
  data: () => ({
    states: TaskStateUserOrder
  })
}
</script>

<style lang="scss">
  @import '~@/styles/index.scss';

  .card-grid {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1em;

    > * {
      margin: 0.5em;
    }

  }

  #task-job-state-table {
    text-align: center;
    /*border-spacing: 1em 0.5em;*/
    border-spacing: 0;

    p {
      margin-top: 1em;
      line-height: 1.2em;
    }

    tr:nth-child(1) {
      font-size: 2em;
    }

    tr > td:nth-child(2) {
      font-size: 1em;
    }

    tr > td:nth-child(1), tr > td:nth-child(3) {
      width: 5em;
    }

    td {
      padding: 0.1em 0 0.1em 0;
    }

    td > * {
      background-color: white;
    }
  }
</style>
