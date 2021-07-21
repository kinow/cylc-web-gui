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

/**
 * Sort cycle point children (family-proxies, and task-proxies) first we sort by type ascending, so 'family-proxy'
 * types come before 'task-proxy' then we sort by node name ascending, so 'bar' comes before 'foo' node type.
 *
 * @param {TaskProxyNode|FamilyProxyNode} leftObject
 * @param {string} leftValue
 * @param {TaskProxyNode|FamilyProxyNode} rightObject
 * @param {string} rightValue
 * @return {number}
 */
export function sortTaskProxyOrFamilyProxy (leftObject, leftValue, rightObject, rightValue) {
  if (leftObject.type < rightObject.type) {
    return -1
  }
  if (leftObject.type > rightObject.type) {
    return 1
  }
  // name
  return DEFAULT_COMPARATOR(leftValue, rightValue)
}
