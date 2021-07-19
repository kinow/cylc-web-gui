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

import JobState from '@/model/JobState.model'

/**
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} workflow
 * @param {string} name - name filter
 * @returns {boolean}
 */
export function filterByName (workflow, name) {
  return workflow.node.name.includes(name)
}

/**
 * @private
 * @param stateTotals {Object} - object with the keys being states, and values the count
 * @return {Array<String>}
 */
function getWorkflowStates (stateTotals) {
  const jobStates = JobState.enumValues.map(jobState => jobState.name)
  return !stateTotals
    ? []
    : Object
      .entries(stateTotals)
      .filter(stateTotal => {
        // GraphQL will return all the task states possible in a workflow, but we
        // only want the states that have an equivalent state for a job. So we filter
        // out the states that do not exist for jobs, and that have active tasks in
        // the workflow (no point keeping the empty states, as they are not to be
        // displayed).
        return jobStates.includes(stateTotal[0]) && stateTotal[1] > 0
      })
      .map(stateTotal => stateTotal[0])
}

/**
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} workflow
 * @param {Array<String>} workflowStates
 * @param {Array<String>} taskStates
 * @returns {boolean}
 */
export function filterByState (workflow, workflowStates, taskStates) {
  // workflow states
  if (!workflowStates.includes(workflow.node.status)) {
    return false
  }
  // task states
  if (taskStates.length > 0) {
    const intersection = getWorkflowStates(workflow.node.stateTotals)
      .filter(item => taskStates.includes(item))
    return intersection.length !== 0
  }
  return true
}

/**
 * Filter a workflow using a given name (could be a part of
 * a name) and a given list of filters.
 *
 * The list of filters may contain workflow states ("running", "stopped",
 * "paused"), and/or task states ("running", "waiting", "submit-failed",
 * etc).
 *
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} workflow
 * @param {string} name
 * @param {Array<String>} workflowStates
 * @param {Array<String>} taskStates
 * @return {boolean} - true if the workflow is accepted, false otherwise
 */
function filterWorkflow (workflow, name, workflowStates, taskStates) {
  let filtered = false
  // Filter by name.
  if (name && name !== '') {
    filtered = filterByName(workflow, name)
    // Stop if we know that the name was not accepted.
    if (!filtered) {
      return filtered
    }
  }
  // Now filter using the provided list of states. We know that the name has been
  // accepted at this point.
  filtered = filterByState(workflow, workflowStates, taskStates)
  return filtered
}

/**
 * @param {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>} workflows
 * @param {String} name
 * @param {Array<String>} workflowStates
 * @param {Array<String>} taskStates
 * @returns {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>} - filtered workflows
 * @see https://stackoverflow.com/questions/45289854/how-to-effectively-filter-tree-view-retaining-its-existing-structure
 */
export function filterHierarchically (workflows, name, workflowStates, taskStates) {
  const filterChildren = (result, workflowNode) => {
    if (workflowNode.type === 'workflow') {
      if (filterWorkflow(workflowNode, name, workflowStates, taskStates)) {
        result.push(workflowNode)
        return result
      }
    } else if (workflowNode.type === 'workflow-name-part' && workflowNode.children.length) {
      const children = workflowNode.children.reduce(filterChildren, [])
      if (children.length) {
        result.push({ ...workflowNode, children })
      }
    }
    return result
  }
  return workflows.reduce(filterChildren, [])
}
