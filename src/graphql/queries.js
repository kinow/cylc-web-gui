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

// Code related to GraphQL queries, fragments, variables, etc.

import gql from 'graphql-tag'
// eslint-disable-next-line no-unused-vars
import { DocumentNode } from 'graphql'

// IMPORTANT: queries here may be used in the offline mode to create mock data. Before removing or renaming
// queries here, please check under the services/mock folder for occurrences of the variable name.

const WORKFLOW_DATA_FRAGMENT = `
fragment WorkflowData on Workflow {
  id
  name
  status
  owner
  host
  port
  stateTotals
  latestStateTasks(states: [
    "failed",
    "preparing",
    "submit-failed",
    "submitted",
    "running"
  ])
}
`

const CYCLEPOINT_DATA_FRAGMENT = `
fragment CyclePointData on FamilyProxy {
  id
  cyclePoint
}
`

const FAMILY_PROXY_DATA_FRAGMENT = `
fragment FamilyProxyData on FamilyProxy {
  id
  name
  state
  cyclePoint
  firstParent {
    id
    name
    cyclePoint
    state
  }
}
`

const TASK_PROXY_DATA_FRAGMENT = `
fragment TaskProxyData on TaskProxy {
  id
  name
  state
  isHeld
  isQueued
  isRunahead
  cyclePoint
  firstParent {
    id
    name
    cyclePoint
    state
  }
  task {
    meanElapsedTime
    name
  }
}
`

const JOB_DATA_FRAGMENT = `
fragment JobData on Job {
  id
  firstParent: taskProxy {
    id
  }
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
  state
  submitNum
  taskProxy {
    outputs (satisfied: true, sort: { keys: ["time"], reverse: true}) {
      label
      message
    }
  }
}
`

/**
 * Query used to retrieve data for the GScan component.
 *
 * @type {DocumentNode}
 */
const GSCAN_DELTAS_SUBSCRIPTION = gql`
subscription GscanSubscriptionQuery {
  deltas (stripNull: true) {
    ...GScanTreeDeltas
  }
}

# GSCAN DELTAS BEGIN

fragment GScanTreeDeltas on Deltas {
  id
  added {
    ...GscanAddedData
  }
  updated {
    ...GscanUpdatedData
  }
  pruned {
    workflow
  }
}

fragment GscanAddedData on Added {
  workflow {
    ...WorkflowData
  }
}

fragment GscanUpdatedData on Updated {
  workflow {
    ...WorkflowData
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the Dashboard view. Note that this query will
 * likely change, bringing more information for the dashboards, and/or allowing
 * users to customize the query.
 *
 * @type {DocumentNode}
 * @see https://github.com/cylc/cylc-ui/issues/94
 */
const DASHBOARD_DELTAS_SUBSCRIPTION = gql`
subscription DashboardSubscriptionQuery {
  deltas (stripNull: true) {
    id
    added {
      workflow {
        ...WorkflowData
      }
    }
    updated {
      workflow {
        ...WorkflowData
      }
    }
    pruned {
      workflow
    }
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the WorkflowsTable view.
 *
 * @type {DocumentNode}
 */
const WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION = gql`
subscription WorkflowsTableQuery {
  deltas (stripNull: true) {
    id
    added {
      workflow {
        ...WorkflowData
      }
    }
    updated {
      workflow {
        ...WorkflowData
      }
    }
    pruned {
      workflow
    }
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the tree view.
 *
 * @type {DocumentNode}
 */
const WORKFLOW_TREE_DELTAS_SUBSCRIPTION = gql`
subscription OnWorkflowTreeDeltasData ($workflowId: ID) {
  deltas (workflows: [$workflowId], stripNull: true) {
   ...WorkflowTreeDeltas
  }
}

# TREE DELTAS BEGIN

fragment WorkflowTreeDeltas on Deltas {
  id
  added {
    ...WorkflowTreeAddedData
  }
  updated {
    ...WorkflowTreeUpdatedData
  }
  pruned {
    ...WorkflowTreePrunedData
  }
}

fragment WorkflowTreeAddedData on Added {
  workflow {
    ...WorkflowData
  }
  cyclePoints: familyProxies (ids: ["root"], ghosts: true) {
    ...CyclePointData
  }
  familyProxies (exids: ["root"], sort: { keys: ["name"] }, ghosts: true) {
    ...FamilyProxyData
  }
  taskProxies (sort: { keys: ["cyclePoint"], reverse: false }, ghosts: true) {
    ...TaskProxyData
  }
  jobs (sort: { keys: ["submit_num"], reverse:true }) {
    ...JobData
  }
}

fragment WorkflowTreeUpdatedData on Updated {
  taskProxies (ghosts: true) {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
  familyProxies (exids: ["root"], ghosts: true) {
    ...FamilyProxyData
  }
}

fragment WorkflowTreePrunedData on Pruned {
  familyProxies
  taskProxies
  jobs
}

# TREE DELTAS END

# WORKFLOW DATA BEGIN

${WORKFLOW_DATA_FRAGMENT}

${CYCLEPOINT_DATA_FRAGMENT}

${FAMILY_PROXY_DATA_FRAGMENT}

${TASK_PROXY_DATA_FRAGMENT}

${JOB_DATA_FRAGMENT}

# WORKFLOW DATA END
`

/**
 * Query used to retrieve data for the table view.
 *
 * @type {DocumentNode}
 */
const WORKFLOW_TABLE_DELTAS_SUBSCRIPTION = gql`
subscription OnWorkflowDeltasData($workflowId: ID) {
  deltas(workflows: [$workflowId], stripNull: true) {
    ...WorkflowTableDeltas
  }
}

# TABLE DELTAS BEGIN

fragment WorkflowTableDeltas on Deltas {
  id
  added {
    ...WorkflowTableAddedData
  }
  updated {
    ...WorkflowTableUpdatedData
  }
  pruned {
    ...WorkflowTablePrunedData
  }
}

fragment WorkflowTableAddedData on Added {
  workflow {
    ...WorkflowData
  }
  taskProxies(sort: {keys: ["name"], reverse: false}, ghosts: true) {
    ...TaskProxyData
  }
  jobs(sort: {keys: ["submit_num"], reverse: true}) {
    ...JobData
  }
}

fragment WorkflowTableUpdatedData on Updated {
  taskProxies(ghosts: true) {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment WorkflowTablePrunedData on Pruned {
  taskProxies
  jobs
}

# TABLE DELTAS END

# WORKFLOW DATA BEGINS

${WORKFLOW_DATA_FRAGMENT}

${TASK_PROXY_DATA_FRAGMENT}

${JOB_DATA_FRAGMENT}

# WORKFLOW DATA END

`

export {
  GSCAN_DELTAS_SUBSCRIPTION,
  DASHBOARD_DELTAS_SUBSCRIPTION,
  WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TABLE_DELTAS_SUBSCRIPTION
}
