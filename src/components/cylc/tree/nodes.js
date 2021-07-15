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

import TaskOutput from '@/model/TaskOutput.model'
import Vue from 'vue'

/**
 * A GraphQLData object represents an object from a GraphQL response as-is.
 * It is wrapped within a Tree node (i.e. a tree-node has a node), for
 * when components need the raw object data from fetched with a query
 * (e.g. the state of a task).
 *
 * The properties of this object vary depending on the query parameters,
 * and the GraphQL schema. Use GraphiQL to confirm the data if necessary.
 *
 * @typedef {Object} GraphQLData
 * @property {string} id - node ID
 */

/**
 * @typedef {GraphQLData} WorkflowGraphQLData
 * @property {string} name
 * @property {string} status
 * @property {string} owner
 * @property {string} host
 * @property {string} port
 * @property {Object} stateTotals
 * @property {Array<string>} latestStateTasks
 * @property {?Array<GraphQLData>} cyclePoints
 * @property {?Array<GraphQLData>} familyProxies
 * @property {?Array<GraphQLData>} taskProxies
 */

/**
 * A node of the tree, with the GraphQL data objects organized
 * hierarchically.
 *
 * @typedef {Object} TreeNode
 * @property {string} id - node ID
 * @property {string} type - node type
 * @property {boolean} [expanded=true] - whether the node is expanded or not
 * @property {WorkflowGraphQLData} node - GraphQL returned data as-is
 * @property {Array<TreeNode>} children - children node
 */

/**
 * @typedef {TreeNode} WorkflowNode
 */

/**
 * Create a workflow node. Uses the same properties (by reference) as the given workflow,
 * only adding new properties such as type, children, etc.
 *
 * @param workflow {WorkflowGraphQLData} workflow
 * @return {WorkflowNode}
 */
function createWorkflowNode (workflow) {
  // Does not have the infinite-tree properties (size, state, etc) because this node is used only to build the
  // initial hierarchy. After that it is discarded, and we return its children (Cylc 7 did not display workflows
  // in the tree).
  return {
    id: workflow.id,
    type: 'workflow',
    node: workflow,
    children: []
  }
}

/**
 * Create a cycle point node ID. Uses the node property `id`.
 *
 * It will split the node ID using the separator. And if the number
 * of tokens is at least three, it will return the three first tokens
 * joined by the separator too.
 *
 * Otherwise returns the node ID.
 *
 * For example, given a node with the following ID's:
 *
 * - 'a|b|c|d'    results in a cycle point node ID 'a|b|c'
 * - 'a|b|c|d|e'  results in a cycle point node ID 'a|b|c'
 * - 'a|b|c'      results in a cycle point node ID 'a|b|c'
 * - 'a|b'        results in a cycle point node ID 'a|b'
 * - ''           results in a cycle point node ID ''
 *
 * @param node {GraphQLData} a tree node
 * @throws {Error} - if there was an error extracting the cycle point ID
 * @return {string} - the cycle point ID
 */
function getCyclePointId (node) {
  if (node && node.id) {
    const tokens = node.id.split('|')
    if (tokens.length >= 3) {
      return tokens.splice(0, 3).join('|')
    }
  }
  const nodeId = node && node.id ? node.id : 'undefined'
  throw new Error(`Error extracting cycle point ID from node ID ${nodeId}`)
}

/**
 * @typedef {TreeNode} CyclePointNode
 */

/**
 * The FamilyProxy GraphQL data. Contains a cycle point, used to
 * find its parent in the hierarchy.
 *
 * @typedef {GraphQLData} FamilyProxyGraphQLData
 * @property {string} name
 * @property {string} state
 * @property {string} cyclePoint - cycle point
 * @property {Object} firstParent
 * @property {string} firstParent.id
 * @property {string} firstParent.name
 * @property {string} firstParent.cyclePoint
 * @property {string} firstParent.state
 */

/**
 * Create a cycle point node. Uses the family proxy property `cyclePoint`.
 *
 * @param {FamilyProxyGraphQLData} familyProxy
 * @return {CyclePointNode}
 */
function createCyclePointNode (familyProxy) {
  const id = getCyclePointId(familyProxy)
  return {
    id: id,
    type: 'cyclepoint',
    node: {
      id: id,
      name: familyProxy.cyclePoint
    },
    children: []
  }
}

/**
 * @typedef {TreeNode} FamilyProxyNode
 */

/**
 * Create a family proxy node. Contains the same properties (by reference) as the given family,
 * only adding new properties such as type, children, etc.
 *
 * @param {FamilyProxyGraphQLData} familyProxy
 * @return {FamilyProxyNode}
 */
function createFamilyProxyNode (familyProxy) {
  return {
    id: familyProxy.id,
    type: 'family-proxy',
    node: familyProxy,
    children: []
  }
}

/**
 * @typedef {GraphQLData} TaskProxyGraphQLData
 * @property {string} name
 * @property {string} state
 * @property {boolean} isHeld
 * @property {string} cyclePoint
 * @property {Object} firstParent
 * @property {string} firstParent.id
 * @property {string} firstParent.name
 * @property {string} firstParent.cyclePoint
 * @property {string} firstParent.state
 * @property {Object} task
 * @property {string} task.meanElapsedTime
 * @property {string} task.name
 */

/**
 * @typedef {TreeNode} TaskProxyNode
 */

/**
 * Create a task proxy node. Contains the same properties (by reference) as the given task,
 * only adding new properties such as type, name, children, etc.
 *
 * @param {GraphQLData} taskProxy
 * @return {TaskProxyNode}
 */
function createTaskProxyNode (taskProxy) {
  return {
    id: taskProxy.id,
    type: 'task-proxy',
    node: taskProxy,
    expanded: false,
    children: []
  }
}

/**
 * @typedef {GraphQLData} JobGraphQLData
 * @property {Object} firstParent
 * @property {string} firstParent.id
 * @property {string} state
 * @property {string} platform - job platform (e.g. localhost)
 * @property {string} jobId - job ID (e.g. PID)
 * @property {string} jobRunnerName - job runner name (e.g. PBS)
 * @property {string} submittedTime - time job was submitted
 * @property {string} startedTime - time job started
 * @property {string} finishedTime - time job finished
 * @property {Object} taskProxy
 * @property {Array<Output>} taskProxy.outputs
 */

/**
 * The data of a Job returned from GraphQL, augmented
 * to have the custom outputs array.
 *
 * @typedef {JobGraphQLData} AugmentedJobGraphQLData
 * @property {Array<Output>} customOutputs
 */

/**
 * @typedef {Object} JobDetail
 * @property {string} title - detail title
 * @property {string} value - detail value
 */

/**
 * @typedef {TreeNode} JobDetails
 * @property {Array<Output>} node.customOutputs
 * @property {Array<JobDetail>} node.details
 */

/**
 * @param {AugmentedJobGraphQLData} job
 * @returns {JobDetails}
 */
function createJobDetailsNode (job) {
  const details = [
    {
      title: 'platform',
      value: job.platform
    },
    {
      title: 'job id',
      value: job.jobId
    },
    {
      title: 'batch sys',
      value: job.jobRunnerName
    },
    {
      title: 'submit time',
      value: job.submittedTime
    },
    {
      title: 'start time',
      value: job.startedTime
    },
    {
      title: 'finish time',
      value: job.finishedTime
    }
  ]

  // NOTE: `node.node.customOutputs` is not from the GraphQL query, but added
  //       in createJobNode in this module.
  return {
    id: `${job.id}-details`,
    type: 'job-details',
    node: {
      customOutputs: job.customOutputs,
      details
    }
  }
}

/**
 * @typedef {Object} Output
 * @property {string} label - output label
 * @property {string} message - output message
 */

/**
 * Create the list of custom outputs for a given Job. We filter out any output
 * that is a standard output (see TaskOutput enum).
 *
 * If no outputs or no custom outputs are provided, then we return an empty list.
 *
 * @param {JobGraphQLData} job - job node
 * @returns {Array<Output>}
 */
function createCustomOutputs (job) {
  // NOTE: the query has the filter satisfied:true already, no need to filter for that here
  //       but we want only custom outputs, so we will filter removing the standard outputs
  if (!job || !job.taskProxy || !job.taskProxy.outputs) {
    return []
  }

  const customOutputs = job
    .taskProxy
    .outputs
    .filter(output => !TaskOutput.enumValues.map(taskOutput => taskOutput.name).includes(output.label))
    .map(output => {
      return Object.assign({}, output, {
        id: `${job.id}-output-${output.label}`
      })
    })
  return customOutputs || []
}

/**
 * @typedef {TreeNode} JobNode
 */

/**
 * Create a job node. Contains the same properties (by reference) as the given job,
 * only adding new properties such as type, name, etc.
 *
 * @param {JobGraphQLData} job
 * @return {JobNode}
 */
function createJobNode (job) {
  Vue.set(job, 'customOutputs', createCustomOutputs(job))
  const jobDetailsNode = createJobDetailsNode(job)
  return {
    id: job.id,
    type: 'job',
    expanded: false,
    node: job,
    children: [jobDetailsNode]
  }
}

export {
  createWorkflowNode,
  createCyclePointNode,
  createFamilyProxyNode,
  createTaskProxyNode,
  createJobNode,
  getCyclePointId
}
