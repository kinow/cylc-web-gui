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
import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'

/**
 * @typedef {Object} Result
 * @property {Array<Object>} errors
 */

/**
 * @param {DeltasAdded} added
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasAdded (added, lookup) {
  const result = {
    errors: []
  }
  Object.values(added).forEach(addedValue => {
    const items = isArray(addedValue) ? addedValue : [addedValue]
    items.forEach(addedData => {
      // An example for a data without .id, is the empty delta with __typename: "Added". It does occur, and can cause runtime errors.
      if (addedData.id) {
        try {
          Vue.set(lookup, addedData.id, addedData)
        } catch (error) {
          result.errors.push([
            'Error applying added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            addedData,
            lookup
          ])
        }
      }
    })
  })
  return result
}

/**
 * Deltas updated.
 *
 * @param updated {DeltasUpdated} updated
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasUpdated (updated, lookup) {
  const result = {
    errors: []
  }
  Object.values(updated).forEach(updatedValue => {
    const items = isArray(updatedValue) ? updatedValue : [updatedValue]
    items.forEach(updatedData => {
      // An example for a data without .id, is the empty delta with __typename: "Updated". It does occur, and can cause runtime errors.
      if (updatedData.id) {
        try {
          const existingNode = lookup[updatedData.id]
          if (existingNode) {
            mergeWith(existingNode, updatedData, mergeWithCustomizer)
          } else {
            // TODO: we are adding in the updated. Is that OK? Should we revisit it later perhaps?
            Vue.set(lookup, updatedData.id, updatedData)
          }
        } catch (error) {
          result.errors.push([
            'Error applying updated-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            updatedData,
            lookup
          ])
        }
      }
    })
  })
  return result
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned} pruned - deltas pruned
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasPruned (pruned, lookup) {
  Object.values(pruned).forEach(prunedData => {
    // It can be a String, when you get a delta with only '{ __typename: "Pruned" }'
    const items = isArray(prunedData) ? prunedData : [prunedData]
    for (const id of items) {
      if (lookup[id]) {
        delete lookup[id]
      }
    }
  })
  return {
    errors: []
  }
}

/**
 * @param {*} data
 * @param {Object.<String, Object>} lookup
 */
export default function (data, lookup) {
  const added = data.deltas.added
  const updated = data.deltas.updated
  const pruned = data.deltas.pruned
  const errors = []
  if (added) {
    const result = applyDeltasAdded(added, lookup)
    errors.push(...result.errors)
  }
  if (updated) {
    const result = applyDeltasUpdated(updated, lookup)
    errors.push(...result.errors)
  }
  if (pruned) {
    const result = applyDeltasPruned(pruned, lookup)
    errors.push(...result.errors)
  }
  return {
    errors
  }
}
