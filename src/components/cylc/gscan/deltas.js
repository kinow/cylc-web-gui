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
import { mergeWithCustomizer } from '@/components/cylc/common/merge'

export default function (data, workflows) {
  const added = data.deltas.added
  const updated = data.deltas.updated
  const pruned = data.deltas.pruned
  if (added && added.workflow && added.workflow.status) {
    Vue.set(workflows, added.workflow.id, added.workflow)
  }
  if (updated && updated.workflow && workflows[updated.workflow.id]) {
    mergeWith(workflows[updated.workflow.id], updated.workflow, mergeWithCustomizer)
  }
  if (pruned && pruned.workflow) {
    Vue.delete(workflows, pruned.workflow)
  }
}
