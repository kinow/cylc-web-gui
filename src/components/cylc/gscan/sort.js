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

import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import WorkflowState from '@/model/WorkflowState.model'

export const WORKFLOW_TYPES_ORDER = ['workflow-name-part', 'workflow']

/**
 * @typedef {SortedIndexByComparator} SortTaskProxyOrFamilyProxyComparator
 * @param {TaskProxyNode|FamilyProxyNode} leftObject
 * @param {string} leftValue
 * @param {TaskProxyNode|FamilyProxyNode} rightObject
 * @param {string} rightValue
 * @returns {boolean}
 */

/**
 * Sort workflows by type first, showing running or paused workflows first,
 * then stopped. Within each group, workflows are sorted alphabetically
 * (natural sort).
 * @param leftObject
 * @param leftValue
 * @param rightObject
 * @param rightValue
 * @returns {boolean|number}
 */
export function sortWorkflowNamePartNodeOrWorkflowNode (leftObject, leftValue, rightObject, rightValue) {
  if (leftObject.type !== rightObject.type) {
    return WORKFLOW_TYPES_ORDER.indexOf(leftObject.node.type) - WORKFLOW_TYPES_ORDER.indexOf(rightObject.node.type)
  }
  if (leftObject.node.status !== rightObject.node.status) {
    const leftState = WorkflowState.enumValueOf(leftObject.node.status.toUpperCase())
    const rightState = WorkflowState.enumValueOf(rightObject.node.status.toUpperCase())
    // FIXME: waiting for https://github.com/cylc/cylc-ui/pull/703
    //        which fixes another issue in GScan... Note to self,
    //        look at the DIFF in GitHub when resolving conflicts!
    if (!leftState || leftState.enumOrdinal === undefined) {
      return 1
    }
    if (!rightState || rightState.enumOrdinal === undefined) {
      return -1
    }
    return leftState.enumOrdinal - rightState.enumOrdinal
  }
  // name
  return DEFAULT_COMPARATOR(leftValue, rightValue)
}
