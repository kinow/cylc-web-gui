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

import { mergeWith } from 'lodash'
import Vue from 'vue'
import WorkflowState from '@/model/WorkflowState.model'
import { mergeWithCustomizer } from '@/utils/merge'

function applyDeltasAdded (added, table, lookup) {
  const result = {
    errors: []
  }
  if (added.taskProxies) {
    for (const taskProxy of added.taskProxies) {
      if (!table[taskProxy.id]) {
        const tableEntry = {
          id: taskProxy.id,
          node: lookup[taskProxy.id],
          latestJob: {}
        }
        Vue.set(table, taskProxy.id, tableEntry)
      }
    }
  }
  if (added.jobs) {
    for (const job of added.jobs) {
      const existingEntry = table[job.firstParent.id]
      if (existingEntry) {
        const latestJobSubmitNum = existingEntry.latestJob.submitNum || 0
        const latestJob = latestJobSubmitNum < job.submitNum
          ? lookup[job.id]
          : existingEntry.latestJob
        Vue.set(existingEntry, 'latestJob', latestJob)
      }
    }
  }
  return result
}

function applyDeltasUpdated (updated, table, lookup) {
  const result = {
    errors: []
  }
  if (updated.taskProxies) {
    for (const taskProxy of updated.taskProxies) {
      if (table[taskProxy.id]) {
        mergeWith(table[taskProxy.id].node, taskProxy, mergeWithCustomizer)
      }
    }
  }
  if (updated.jobs) {
    for (const job of updated.jobs) {
      if (job.firstParent && job.firstParent.id) {
        const existingTask = table[job.firstParent.id]
        if (existingTask && existingTask.latestJob.id === job.id) {
          mergeWith(existingTask.latestJob, job, mergeWithCustomizer)
        }
      }
    }
  }
  return result
}

function applyDeltasPruned (pruned, table, lookup) {
  const result = {
    errors: []
  }
  if (pruned.taskProxies) {
    pruned.taskProxies.forEach(taskProxyId => {
      Vue.delete(table, taskProxyId)
    })
  }
  if (pruned.jobs) {
    pruned.jobs.forEach(jobId => {
      const existingJob = lookup[jobId]
      if (existingJob) {
        const existingEntry = table[existingJob.firstParent.id]
        if (existingEntry && existingEntry.latestJob.id === jobId) {
          Vue.set(existingEntry, 'latestJob', {})
        }
      }
    })
  }
  return result
}

const DELTAS = {
  added: applyDeltasAdded,
  updated: applyDeltasUpdated,
  pruned: applyDeltasPruned
}

/**
 * @param deltas
 * @param table
 * @param {Lookup} lookup
 * @returns {{errors: *[]}}
 */
function handleDeltas (deltas, table, lookup) {
  const errors = []
  Object.keys(DELTAS).forEach(key => {
    if (deltas[key]) {
      const handlingFunction = DELTAS[key]
      const result = handlingFunction(deltas[key], table, lookup)
      errors.push(...result.errors)
    }
  })
  return {
    errors
  }
}

/**
 * @param {GraphQLResponseData} data
 * @param {Array} table
 * @param {Lookup} lookup
 */
export default function (data, table, lookup) {
  const deltas = data.deltas
  // first we check whether it is a new start
  if (deltas && deltas.added && deltas.added.workflow) {
    if (deltas.added.workflow.status === WorkflowState.RUNNING.name) {
      // Clear the existing table data, if any
      Object.keys(table).forEach(key => {
        Vue.delete(table, key)
      })
    }
  }
  // Safe check in case the table is empty.
  if (table.length === 0) {
    if (!deltas.added || !deltas.added.workflow) {
      return {
        errors: [
          [
            'Received a delta before the workflow initial data burst',
            deltas.added,
            table
          ]
        ]
      }
    }
  }
  try {
    return handleDeltas(deltas, table, lookup)
  } catch (error) {
    return {
      errors: [
        [
          'Unexpected error applying deltas',
          error,
          deltas
        ]
      ]
    }
  }
}
