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

/**
 * @param {Deltas} data
 * @param {Array} array
 */
export const applyTableDeltas = (data, array) => {
  const added = data.added
  const pruned = data.pruned
  const updated = data.updated
  if (added && added.taskProxies) {
    for (const taskProxy of added.taskProxies) {
      array.push(taskProxy)
    }
  }
  if (pruned && pruned.taskProxies) {
    for (const taskProxy of pruned.taskProxies) {
      const indexToRemove = array.findIndex(task => task.id === taskProxy.id)
      array.splice(indexToRemove, 1)
    }
  }
  if (updated && updated.taskProxies) {
    for (const taskProxy of updated.taskProxies) {
      const existingTask = array.find(task => task.id === taskProxy.id)
      mergeWith(existingTask, taskProxy, mergeWithCustomizer)
    }
  }
}
