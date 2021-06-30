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

import isArray from 'lodash/isArray'
import {
  createWorkflowNode,
  createCyclePointNode,
  createFamilyProxyNode,
  createJobNode,
  createTaskProxyNode
} from '@/components/cylc/tree/nodes'
import * as CylcTree from '@/components/cylc/tree/index'

/**
 * Helper object used to iterate added deltas data.
 */
const ADDED = {
  workflow: [createWorkflowNode, 'addWorkflow'],
  cyclePoints: [createCyclePointNode, 'addCyclePoint'],
  familyProxies: [createFamilyProxyNode, 'addFamilyProxy'],
  taskProxies: [createTaskProxyNode, 'addTaskProxy'],
  jobs: [createJobNode, 'addJob']
}

/**
 * Deltas added.
 *
 * @param {DeltasAdded} added
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
function applyDeltasAdded (added, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(ADDED).forEach(addedKey => {
    if (added[addedKey]) {
      const items = isArray(added[addedKey]) ? added[addedKey] : [added[addedKey]]
      items.forEach(addedData => {
        try {
          const existingData = lookup[addedData.id]
          const createNodeFunction = ADDED[addedKey][0]
          const treeFunction = ADDED[addedKey][1]
          const node = createNodeFunction(existingData)
          CylcTree[treeFunction](node, workflow, options)
        } catch (error) {
          result.errors.push([
            'Error applying added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            addedData,
            workflow,
            lookup
          ])
        }
      })
    }
  })
  return result
}

/**
 * Helper object used to iterate updated deltas data.
 */
const UPDATED = {
  familyProxies: [createFamilyProxyNode, 'updateFamilyProxy'],
  taskProxies: [createTaskProxyNode, 'updateTaskProxy'],
  jobs: [createJobNode, 'updateJob']
}

/**
 * Deltas updated.
 *
 * @param updated {DeltasUpdated} updated
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
function applyDeltasUpdated (updated, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(UPDATED).forEach(updatedKey => {
    if (updated[updatedKey]) {
      updated[updatedKey].forEach(updatedData => {
        try {
          const existingData = lookup[updatedData.id]
          if (!existingData) {
            result.errors.push([
              `Updated node [${updatedData.id}] not found in workflow lookup`,
              updatedData,
              workflow,
              lookup
            ])
          } else {
            const updateNodeFunction = UPDATED[updatedKey][0]
            const treeFunction = UPDATED[updatedKey][1]
            const node = updateNodeFunction(existingData)
            CylcTree[treeFunction](node, workflow, options)
          }
        } catch (error) {
          result.errors.push([
            'Error applying added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            updatedData,
            workflow,
            lookup
          ])
        }
      })
    }
  })
  return result
}

/**
 * Helper object used to iterate pruned deltas data.
 */
const PRUNED = {
  jobs: 'removeJob',
  taskProxies: 'removeTaskProxy',
  familyProxies: 'removeFamilyProxy'
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned} pruned - deltas pruned
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
function applyDeltasPruned (pruned, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(PRUNED).forEach(prunedKey => {
    if (pruned[prunedKey]) {
      for (const id of pruned[prunedKey]) {
        try {
          CylcTree[PRUNED[prunedKey]](id, workflow, options)
        } catch (error) {
          result.errors.push([
            'Error applying pruned-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            prunedKey,
            workflow,
            lookup
          ])
        }
      }
    }
  })
  return result
}

const DELTAS = {
  added: applyDeltasAdded,
  updated: applyDeltasUpdated,
  pruned: applyDeltasPruned
}

/**
 * Handle the deltas. This function receives the new set of deltas, and the tree object. It is assumed
 * the tree has been correctly created. Except for family proxies, it is expected that other elements
 * are only created via the deltas.added attribute.
 *
 * Family proxies are a special case, due to hierarchy within families, so we have no easy way to grab
 * the first family from the top of the hierarchy in the deltas.
 *l
 * @param {Deltas} deltas - GraphQL deltas
 * @param {Workflow} workflow - Tree object
 * @param {Lookup} lookup
 * @param {*} options
 */
function handleDeltas (deltas, workflow, lookup, options) {
  const errors = []
  Object.keys(DELTAS).forEach(key => {
    if (deltas[key]) {
      const handlingFunction = DELTAS[key]
      const result = handlingFunction(deltas[key], workflow, lookup, options)
      errors.push(...result.errors)
    }
  })
  // if added, removed, or updated deltas, we want to re-calculate the cycle point states now
  if (deltas.pruned || deltas.added || deltas.updated) {
    CylcTree.tallyCyclePointStates(workflow)
  }
  return {
    errors
  }
}

/**
 * @param {GraphQLResponseData} data
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
export default function (data, workflow, lookup, options) {
  const deltas = data.deltas
  // first we check whether it is a shutdown response
  if (deltas.shutdown) {
    CylcTree.clear(workflow)
    return {
      errors: []
    }
  }
  // Safe check in case the tree is empty.
  if (CylcTree.isEmpty(workflow)) {
    // When the tree is empty, we have two possible scenarios:
    //   1. This means that we will receive our initial data burst in deltas.added
    //      which we can use to create the tree structure.
    //   2. Or this means that after the shutdown (when we delete the tree), we received a delta.
    //      In this case we don't really have any way to fix the tree.
    // In both cases, actually, the user has little that s/he could do, besides refreshing the
    // page. So we fail silently and wait for a request with the initial data.
    //
    // We need at least a deltas.added.workflow in the deltas data, since it is the root node.
    if (!deltas.added || !deltas.added.workflow) {
      return {
        errors: [
          [
            'Received a delta before the workflow initial data burst',
            deltas.added,
            workflow,
            lookup
          ]
        ]
      }
    }
  }
  // the tree was created, and now the next messages should contain
  // 1. data added in deltas.added
  // 2. data updated in deltas.updated
  // 3. data pruned in deltas.pruned
  // 4. a delta with some data, and the .shutdown flag telling us the workflow has stopped
  try {
    return handleDeltas(deltas, workflow, lookup, options)
  } catch (error) {
    return {
      errors: [
        [
          'Unexpected error applying deltas',
          error,
          deltas,
          workflow,
          lookup
        ]
      ]
    }
  }
}
