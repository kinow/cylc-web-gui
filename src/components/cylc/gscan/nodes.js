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

import { sortedIndexBy } from '@/components/cylc/common/sort'
import { sortWorkflowNamePartNodeOrWorkflowNode } from '@/components/cylc/gscan/sort'

/**
 * @typedef {Object} WorkflowGScanNode
 * @property {String} id
 * @property {String} name
 * @property {String} type
 * @property {WorkflowGraphQLData} node
 */

/**
 * @typedef {Object} WorkflowNamePartGScanNode
 * @property {String} id
 * @property {String} name
 * @property {String} type
 * @property {WorkflowGraphQLData} node
 * @property {Array<WorkflowNamePartGScanNode>} children
 */

/**
 * Create a new Workflow Node.
 *
 * @private
 * @param {WorkflowGraphQLData} workflow
 * @param {string|null} part
 * @returns {WorkflowGScanNode}
 */
function newWorkflowNode (workflow, part) {
  return {
    id: workflow.id,
    name: part,
    type: 'workflow',
    node: workflow
  }
}

/**
 * Create a new Workflow name part Node.
 *
 * @param {string} id
 * @param {string} part
 * @return {WorkflowNamePartGScanNode}
 */
function newWorkflowPartNode (id, part) {
  return {
    id: id,
    name: part,
    type: 'workflow-name-part',
    node: {
      id: id,
      name: part,
      status: ''
    },
    children: []
  }
}

/**
 * Create a workflow node for GScan component.
 *
 * If the `hierarchy` parameter is `true`, then the workflow name will be split by
 * `/`'s. For each part, a new `WorkflowNamePart` will be added in the hierarchy.
 * With the final node being the last part of the name.
 *
 * The last part of a workflow name may be the workflow name (e.g. `five`), or its
 * run ID (e.g. `run1`, if workflow name is `five/run1`).
 *
 * @param {WorkflowGraphQLData} workflow
 * @param {boolean} hierarchy - whether to parse the Workflow name and create a hierarchy or not
 * @returns {WorkflowGScanNode|WorkflowNamePartGScanNode|null}
 */
function createWorkflowNode (workflow, hierarchy) {
  if (!hierarchy) {
    return newWorkflowNode(workflow, null)
  }
  const workflowIdParts = workflow.id.split('|')
  // The prefix contains all the ID parts, except for the workflow name.
  let prefix = workflowIdParts.slice(0, workflowIdParts.length - 1)
  // The name is here.
  const workflowName = workflow.name
  const parts = workflowName.split('/')
  // Returned node...
  let rootNode = null
  // And a helper used when iterating the array...
  let currentNode = null
  while (parts.length > 0) {
    const part = parts.shift()
    // For the first part, we need to add an ID separator `|`, but for the other parts
    // we actually want to use the name parts separator `/`.
    prefix = prefix.includes('/') ? `${prefix}/${part}` : `${prefix}|${part}`
    const partNode = parts.length !== 0
      ? newWorkflowPartNode(prefix, part)
      : newWorkflowNode(workflow, part)

    if (rootNode === null) {
      rootNode = currentNode = partNode
    } else {
      currentNode.children.push(partNode)
      currentNode = partNode
    }
  }
  return rootNode
}

/**
 * Add the new hierarchical node to the list of existing nodes.
 *
 * New nodes are added in order.
 *
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} node
 * @param {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>} nodes
 * @return {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>}
 */
function addNodeToTree (node, nodes) {
  // N.B.: We must compare nodes by ID, not by part-name, since we can have
  //       research/nwp/run1 workflow, and research workflow; in this case
  //       we do not want to confuse the research part-name with the research
  //       workflow.
  const existingNode = nodes.find((existingNode) => existingNode.id === node.id)
  if (!existingNode) {
    // Here we calculate what is the index for this element. If we decide to have ASC and DESC,
    // then we just need to invert the location of the element, something like
    // `sortedIndex = (array.length - sortedIndex)`.
    const sortedIndex = sortedIndexBy(
      nodes,
      node,
      (n) => n.name,
      sortWorkflowNamePartNodeOrWorkflowNode
    )
    nodes.splice(sortedIndex, 0, node)
  } else {
    if (node.children) {
      for (const child of node.children) {
        // Recursion. Note that we are changing the `nodes` to the children of the existing node.
        addNodeToTree(child, existingNode.children)
      }
    }
  }
  return nodes
}

export {
  addNodeToTree,
  createWorkflowNode
}
