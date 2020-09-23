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
import Vue from 'vue'
import { mergeWith } from 'lodash'
import { extractGroupState } from '@/utils/tasks'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'
import { createFamilyProxyNode, getCyclePointId } from '@/components/cylc/tree/nodes'

export const FAMILY_ROOT = 'root'

export const DEFAULT_CYCLE_POINTS_ORDER_DESC = true

/**
 * @typedef {Object} Workflow
 * @property {Lookup} lookup
 * @property {Tree} tree
 */

/**
 * @typedef {Object<String, TreeNode>} Lookup
 */

/**
 * @typedef {Object<String, TreeNode>} Tree
 */

/**
 * Compute the state of each cycle point node in the list given.
 *
 * The formula used to compute each cycle point state is the same as in Cylc 7, using an enum of task types.
 *
 * After the state is successfully computed, each cycle point node gets an additional property `state`
 * with type string, representing the cycle point state.
 *
 * @param {Array<CyclePointNode>} cyclePointNodes list of cycle point nodes.
 */
function computeCyclePointsStates (cyclePointNodes) {
  for (const cyclePointNode of cyclePointNodes) {
    const childStates = []
    for (const child of cyclePointNode.children) {
      childStates.push(child.node.state)
    }
    const cyclePointState = extractGroupState(childStates, false)
    // Initially the .node object retrieved from the GraphQL endpoint does
    // not have the .state property. So we need to ask Vue to make it reactive.
    Vue.set(cyclePointNode.node, 'state', cyclePointState)
  }
}

/**
 * The default comparator used to compare strings for cycle points, family proxies names,
 * task proxies names, and jobs.
 *
 * @param left {string}
 * @param right {string}
 * @returns {number}
 * @constructor
 */
const DEFAULT_COMPARATOR = (left, right) => {
  return left.toLowerCase()
    .localeCompare(
      right.toLowerCase(),
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    )
}

/**
 * Declare function used in sortedIndexBy as a comparator.
 *
 * @private
 * @callback SortedIndexByComparator
 * @param {object} leftObject - left parameter object
 * @param {string} leftValue - left parameter value
 * @param {object} rightObject - right parameter object
 * @param {string} rightValue - right parameter value
 * @returns {boolean} - true if leftValue is higher than rightValue
 */

/**
 * @private
 * @typedef {SortedIndexByComparator} SortTaskProxyOrFamilyProxyComparator
 * @param {TaskProxyNode|FamilyProxyNode} leftObject
 * @param {string} leftValue
 * @param {TaskProxyNode|FamilyProxyNode} rightObject
 * @param {string} rightValue
 * @returns {boolean}
 */
function sortTaskProxyOrFamilyProxy (leftObject, leftValue, rightObject, rightValue) {
  // sort cycle point children (family-proxies, and task-proxies)
  // first we sort by type ascending, so 'family-proxy' types come before 'task-proxy'
  // then we sort by node name ascending, so 'bar' comes before 'foo'
  // node type
  if (leftObject.type < rightObject.type) {
    return -1
  }
  if (leftObject.type > rightObject.type) {
    return 1
  }
  // name
  return DEFAULT_COMPARATOR(leftValue, rightValue) > 0
}

/**
 * Declare function used in sortedIndexBy for creating the iteratee.
 *
 * @callback SortedIndexByIteratee
 * @param {Object} value - any object
 * @returns {string}
 */

/**
 * Given a list of elements, and a value to be added to the list, we
 * perform a simple binary search of the list to determine the next
 * index where the value can be inserted, so that the list remains
 * sorted.
 *
 * This function uses localeCompare, which will respect the numeric
 * collation.
 *
 * This is a simplified version of lodash's function with the same
 * name, but that respects natural order for numbers, i.e. [1, 2, 10].
 * Not [1, 10, 2].
 *
 * @private
 * @param array {Array<object>} - list of string values, or of objects with string values
 * @param value {object} - a value to be inserted in the list, or an object wrapping the value (see iteratee)
 * @param iteratee {SortedIndexByIteratee=} - an optional function used to return the value of the element of the list}
 * @param comparator {SortedIndexByComparator=} - function used to compare the newValue with otherValues in the list
 */
function sortedIndexBy (array, value, iteratee, comparator) {
  if (array.length === 0) {
    return 0
  }
  // If given a function, use it. Otherwise, simply use identity function.
  const iterateeFunction = iteratee || ((value) => value)
  // If given a function, use it. Otherwise, simply use locale sort with numeric enabled
  const comparatorFunction = comparator || ((leftObject, leftValue, rightObject, rightValue) => DEFAULT_COMPARATOR(leftValue, rightValue) > 0)
  let low = 0
  let high = array.length

  const newValue = iterateeFunction(value)

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const midValue = iterateeFunction(array[mid])
    const higher = comparatorFunction(value, newValue, array[mid], midValue)
    if (higher) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return high
}

/**
 * @param {Workflow} workflow
 */
function clear (workflow) {
  ['tree', 'lookup'].forEach(each => {
    Object.keys(workflow[each]).forEach(key => {
      Vue.delete(workflow[each], key)
    })
  })
}

/**
 * @param {Workflow} workflow
 */
function isEmpty (workflow) {
  return Object.keys(workflow.lookup).length === 0
}

/**
 * @private
 * @param {TreeNode} node
 * @param {Lookup} lookup
 */
function recursivelyRemoveNode (node, lookup) {
  const stack = [node]
  while (stack.length > 0) {
    const n = stack.pop()
    Vue.delete(lookup, n.id)
    if (n.children && n.children.length > 0) {
      stack.push(...n.children)
    }
  }
}

// --- Workflow

function addWorkflow (workflowNode, workflow, options) {
  if (!workflow.lookup[workflowNode.id]) {
    mergeWith(workflow.tree, workflowNode, mergeWithCustomizer)
    Vue.set(workflow.lookup, workflowNode.id, workflow.tree)
  }
}

// --- Cycle points

/**
 * @param {Workflow} workflow
 * @param {CyclePointNode} cyclePoint
 * @param {*} options
 */
function addCyclePoint (cyclePoint, workflow, options) {
  if (!workflow.lookup[cyclePoint.id]) {
    Vue.set(workflow.lookup, cyclePoint.id, cyclePoint)
    const parent = workflow.tree
    // when DESC mode, reverse to put cyclepoints in ascending order (i.e. 1, 2, 3)
    const cyclePointsOrderDesc = options.cyclePointsOrderDesc !== undefined
      ? options.cyclePointsOrderDesc
      : DEFAULT_CYCLE_POINTS_ORDER_DESC
    const cyclePoints = cyclePointsOrderDesc ? [...parent.children].reverse() : parent.children
    const insertIndex = sortedIndexBy(
      cyclePoints,
      cyclePoint,
      (c) => c.node.name
    )
    if (cyclePointsOrderDesc) {
      parent.children.splice(parent.children.length - insertIndex, 0, cyclePoint)
    } else {
      parent.children.splice(insertIndex, 0, cyclePoint)
    }
  }
}

/**
 * @param {CyclePointNode} cyclePoint
 * @param {Workflow} workflow
 * @param {*} options
 */
function updateCyclePoint (cyclePoint, workflow, options) {
  const node = workflow.lookup[cyclePoint.id]
  if (node) {
    mergeWith(node, cyclePoint, mergeWithCustomizer)
  }
}

/**
 * @param {String} cyclePointId
 * @param {Workflow} workflow
 * @param {*} options
 */
function removeCyclePoint (cyclePointId, workflow, options) {
  const node = workflow.lookup[cyclePointId]
  if (node) {
    recursivelyRemoveNode(node, workflow.lookup)
    workflow.tree.children.splice(workflow.tree.children.indexOf(node), 1)
    Vue.delete(workflow.lookup, cyclePointId)
  }
}

/**
 * @param {Workflow} workflow
 */
function tallyCyclePointStates (workflow) {
  if (workflow && workflow.tree && workflow.tree.children) {
    // calculate cycle point states
    computeCyclePointsStates(workflow.tree.children)
  }
}

// --- Family proxies

/**
 * @param {FamilyProxyNode} familyProxy
 * @param {Workflow} workflow
 * @param {*} options
 */
function addFamilyProxy (familyProxy, workflow, options) {
  // When we receive the families from the GraphQL endpoint, we are sorting by their
  // firstParent's. However, you may get family proxies out of order when iterating
  // them. When that happens, you may add a family proxy to the lookup, and only
  // append it to the parent later.
  // ignore the root family
  if (familyProxy.id.endsWith(`|${FAMILY_ROOT}`)) {
    return
  }
  // add if not in the lookup already
  const existingFamilyProxy = workflow.lookup[familyProxy.id]
  if (!existingFamilyProxy) {
    Vue.set(workflow.lookup, familyProxy.id, familyProxy)
  } else {
    // We may get a family proxy added twice. The first time is when it is the parent of another
    // family proxy. In that case, we create an orphan node in the lookup table.
    // The second time will be node with more information, such as .firstParent {}. When this happens,
    // we must remember to merge the objects.
    mergeWith(existingFamilyProxy, familyProxy, mergeWithCustomizer)
    Vue.set(workflow.lookup, existingFamilyProxy.id, existingFamilyProxy)
    // NOTE: important, replace the version so that we use the existing one
    // when linking with the parent node in the tree, not the new GraphQL data
    familyProxy = existingFamilyProxy
  }
  // See comment above in the else block. When we get family proxies out of order, we create the parent
  // nodes if they don't exist in the tree yet, so that we can create the correct hierarchy. Later, we
  // merge the data of the node. But for a while, the family proxy that we create won't have a state (as
  // the state is given in the deltas data, and is not available in the `node.firstParent { id }`.
  if (!familyProxy.node.state) {
    Vue.set(familyProxy.node, 'state', '')
  }

  // if we got the parent, let's link parent and child
  if (familyProxy.node.firstParent) {
    let parent
    if (familyProxy.node.firstParent.name === FAMILY_ROOT) {
      // if the parent is root, we use the cyclepoint as the parent
      const cyclePointId = getCyclePointId(familyProxy)
      parent = workflow.lookup[cyclePointId]
    } else if (workflow.lookup[familyProxy.node.firstParent.id]) {
      // if its parent is another family proxy node and must already exist
      parent = workflow.lookup[familyProxy.node.firstParent.id]
    } else {
      // otherwise we create it so task proxies can be added to it as a child
      parent = createFamilyProxyNode(familyProxy.node.firstParent)
      Vue.set(workflow.lookup, parent.id, parent)
    }
    // since this method may be called several times for the same family proxy (see comments above), it means
    // the parent-child could end up repeated by accident; it means we must make sure to create this relationship
    // exactly once.
    if (parent.children.length === 0 || !parent.children.find(child => child.id === familyProxy.id)) {
      const sortedIndex = sortedIndexBy(
        parent.children,
        familyProxy,
        (f) => f.node.name,
        sortTaskProxyOrFamilyProxy
      )
      parent.children.splice(sortedIndex, 0, familyProxy)
    }
  }
}

/**
 * @param {FamilyProxyNode} familyProxy
 * @param {Workflow} workflow
 * @param {*} options
 */
function updateFamilyProxy (familyProxy, workflow, options) {
  const node = workflow.lookup[familyProxy.id]
  if (node) {
    mergeWith(node, familyProxy, mergeWithCustomizer)
    if (!node.node.state) {
      Vue.set(node.node, 'state', '')
    }
  }
}

// --- Task proxies

/**
 * Return a task proxy parent, which may be a family proxy,
 * or a cycle point (if the parent family is ROOT).
 *
 * @private
 * @param {TaskProxyNode} taskProxy
 * @param {Workflow} workflow
 * @return {?TaskProxyNode}
 */
function findTaskProxyParent (taskProxy, workflow) {
  if (taskProxy.node.firstParent.name === FAMILY_ROOT) {
    // if the parent is root, we must instead attach this node to the cyclepoint!
    const cyclePointId = getCyclePointId(taskProxy)
    return workflow.lookup[cyclePointId]
  }
  // otherwise its parent **MAY** already exist
  return workflow.lookup[taskProxy.node.firstParent.id]
}

/**
 * @param {TaskProxyNode} taskProxy
 * @param {Workflow} workflow
 * @param {*} options
 */
function addTaskProxy (taskProxy, workflow, options) {
  if (!workflow.lookup[taskProxy.id]) {
    // progress starts at 0
    Vue.set(taskProxy.node, 'progress', 0)
    // A TaskProxy could be a ghost node, which doesn't have a state/status yet.
    // Note that we cannot have this if-check in `createTaskProxyNode`, as an
    // update-delta might not have a state, and we don't want to merge
    // { state: "" } with an object that contains { state: "running" }, for
    // example.
    if (!taskProxy.node.state) {
      Vue.set(taskProxy.node, 'state', '')
    }
    Vue.set(workflow.lookup, taskProxy.id, taskProxy)
    if (taskProxy.node.firstParent) {
      const parent = findTaskProxyParent(taskProxy, workflow)
      if (!parent) {
        // eslint-disable-next-line no-console
        console.error(`Missing parent ${taskProxy.node.firstParent.id}`)
      } else {
        const sortedIndex = sortedIndexBy(
          parent.children,
          taskProxy,
          (t) => t.node.name,
          sortTaskProxyOrFamilyProxy
        )
        parent.children.splice(sortedIndex, 0, taskProxy)
      }
    }
  }
}

/**
 * @param {TaskProxyNode} taskProxy
 * @param {Workflow} workflow
 * @param {*} options
 */
function updateTaskProxy (taskProxy, workflow, options) {
  const node = workflow.lookup[taskProxy.id]
  if (node) {
    mergeWith(node, taskProxy, mergeWithCustomizer)
  }
}

/**
 * @param {string} taskProxyId
 * @param {Workflow} workflow
 * @param {*} options
 */
function removeTaskProxy (taskProxyId, workflow, options) {
  const taskProxy = workflow.lookup[taskProxyId]
  if (taskProxy) {
    recursivelyRemoveNode(taskProxy, workflow.lookup)
    // Remember that we attach task proxies children of 'root' directly to a cycle point!
    if (taskProxy.node.firstParent) {
      const parent = findTaskProxyParent(taskProxy, workflow)
      parent.children.splice(parent.children.indexOf(taskProxy), 1)
    }
    Vue.delete(workflow.lookup, taskProxyId)
  }
}

/**
 * @param {String} familyProxyId
 * @param {Workflow} workflow
 * @param {*} options
 */
function removeFamilyProxy (familyProxyId, workflow, options) {
  let node
  let nodeId
  let parentId
  // NOTE: when deleting the root family, we can also remove the entire cycle point
  if (familyProxyId.endsWith('|root')) {
    // 0 has the owner, 1 has the workflow Id, 2 has the cycle point, and 3 the family name
    const [owner, workflowId] = familyProxyId.split('|')
    nodeId = getCyclePointId({ id: familyProxyId })
    node = workflow.lookup[nodeId]
    parentId = `${owner}|${workflowId}`
  } else {
    nodeId = familyProxyId
    node = workflow.lookup[nodeId]
    if (node && node.node && node.node.firstParent) {
      if (node.node.firstParent.name === FAMILY_ROOT) {
        parentId = getCyclePointId(node)
      } else {
        parentId = node.node.firstParent.id
      }
    }
  }
  if (node) {
    recursivelyRemoveNode(node, workflow.lookup)
    const parent = workflow.lookup[parentId]
    // If the parent has already been removed from the lookup map, there won't be any parent here
    if (parent) {
      parent.children.splice(parent.children.indexOf(node), 1)
    }
    Vue.delete(workflow.lookup, node.id)
  }
}

// --- Jobs

/**
 * @param {JobNode} job
 * @param {Workflow} workflow
 * @param {*} options
 */
function addJob (job, workflow, options) {
  if (!workflow.lookup[job.id]) {
    Vue.set(workflow.lookup, job.id, job)
    if (job.node.firstParent) {
      const parent = workflow.lookup[job.node.firstParent.id]
      const insertIndex = sortedIndexBy(
        parent.children,
        job,
        (j) => `${j.node.submitNum}`)
      parent.children.splice(parent.children.length - insertIndex, 0, job)
    }
  }
}

/**
 * @param {JobNode} job
 * @param {Workflow} workflow
 * @param {*} options
 */
function updateJob (job, workflow, options) {
  const node = workflow.lookup[job.id]
  if (node) {
    mergeWith(node, job, mergeWithCustomizer)
  }
}

/**
 * @param {string} jobId
 * @param {Workflow} workflow
 * @param {*} options
 */
function removeJob (jobId, workflow, options) {
  const job = workflow.lookup[jobId]
  if (job) {
    recursivelyRemoveNode(job, workflow.lookup)
    if (job.node.firstParent) {
      const parent = workflow.lookup[job.node.firstParent.id]
      // prevent runtime error in case the parent was already removed
      if (parent) {
        // re-calculate the job's task progress
        parent.children.splice(parent.children.indexOf(job), 1)
      }
    }
    Vue.delete(workflow.lookup, jobId)
  }
}
export {
  clear,
  isEmpty,
  addWorkflow,
  addCyclePoint,
  updateCyclePoint,
  removeCyclePoint,
  tallyCyclePointStates,
  addFamilyProxy,
  updateFamilyProxy,
  removeFamilyProxy,
  addTaskProxy,
  updateTaskProxy,
  removeTaskProxy,
  addJob,
  updateJob,
  removeJob
}
