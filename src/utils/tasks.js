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

import TaskState from '@/model/TaskState.model'

/**
 * States used when the parent is stopped.
 * @type {Array<TaskState>}
 */
const isStoppedOrderedStates = [
  TaskState.SUBMIT_FAILED,
  TaskState.FAILED,
  TaskState.RUNNING,
  TaskState.SUBMITTED,
  TaskState.EXPIRED,
  TaskState.PREPARING,
  TaskState.SUCCEEDED,
  TaskState.WAITING
]

/**
 * Gives a single state, based on a list of states of children nodes.
 * @param childStates {Array<TaskState>} children nodes
 * @param isStopped {boolean} whether the parent node is stopped or not
 * @returns {string} a valid Task State name, or null if not found
 * @link @see https://github.com/cylc/cylc-flow/blob/d66ae5c3ce8c749c8178d1cd53cb8c81d1560346/lib/cylc/task_state_prop.py
 */
function extractGroupState (childStates, isStopped = false) {
  const states = isStopped ? isStoppedOrderedStates : TaskState.enumValues
  for (const state of states) {
    if (childStates.includes(state.name)) {
      return state.name
    }
  }
  return ''
}

function taskStartTime (taskProxy, job) {
  return (taskProxy && job && taskProxy.state === TaskState.RUNNING.name) ? job.startedTime : null
}

function taskEstimatedDuration (taskProxy) {
  if (
    taskProxy &&
    taskProxy.task &&
    taskProxy.task.meanElapsedTime
  ) {
    return taskProxy.task.meanElapsedTime
  }
  return null
}

function latestJob (taskProxy) {
  if (taskProxy && taskProxy.children && taskProxy.children.length > 0) {
    return taskProxy.children[0]
  }
  return null
}

export {
  extractGroupState,
  taskStartTime,
  taskEstimatedDuration,
  latestJob
}
