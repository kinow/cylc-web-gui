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
import { mergeWithCustomizer } from '@/utils/merge'
import Vue from 'vue'

/**
 * @param {Deltas} data
 * @param {Object} tasks
 */
export const applyTableDeltas = (data, tasks) => {
  const added = data.added
  const pruned = data.pruned
  const updated = data.updated
  if (added && added.workflow) {
    if (added.workflow.taskProxies) {
      for (const taskProxy of added.workflow.taskProxies) {
        if (!tasks[taskProxy.id]) {
          Vue.set(tasks, taskProxy.id, taskProxy)
        }
      }
    }
    if (added.workflow.jobs) {
      for (const job of added.workflow.jobs) {
        const existingTask = tasks[job.firstParent.id]
        if (existingTask) {
          const children = existingTask.children || []
          children.push(job)
          Vue.set(existingTask, 'children', children)
        }
      }
    }
  }
  if (updated) {
    if (updated.taskProxies) {
      for (const taskProxy of updated.taskProxies) {
        if (tasks[taskProxy.id]) {
          mergeWith(tasks[taskProxy.id], taskProxy, mergeWithCustomizer)
        }
      }
    }
    if (updated.jobs) {
      for (const job of updated.jobs) {
        // FIXME: job.firstParent is always empty for bar? / five workflow
        if (job.firstParent && job.firstParent.id) {
          const existingTask = tasks[job.firstParent.id]
          const children = existingTask.children || []
          const existingJob = children.find(existingJob => existingJob.id === job.id)
          if (existingJob) {
            mergeWith(existingJob, job, mergeWithCustomizer)
          } else {
            children.push(job)
          }
          Vue.set(existingTask, 'children', children)
        }
      }
    }
  }
  if (pruned && pruned.taskProxies) {
    for (const taskProxyId of pruned.taskProxies) {
      if (tasks[taskProxyId]) {
        Vue.delete(tasks, taskProxyId)
      }
    }
  }
}
