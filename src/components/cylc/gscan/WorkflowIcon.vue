<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-tooltip right>
    <template v-slot:activator="{ on, attrs }">
      <v-icon
        v-bind="attrs"
        v-on="on"
      >
        {{ getIcon() }}
      </v-icon>
    </template>
    <span>{{ status }}</span>
  </v-tooltip>
</template>

<script>
import WorkflowState from '@/model/WorkflowState.model'

/**
 * GScan workflow icon.
 */
export default {
  name: 'WorkflowIcon',

  props: {
    status: {
      required: true,
      type: String
    }
  },

  methods: {
    /**
     * Return the workflow icon, based on the status prop. If the state is
     * not valid, we return a pre-defined error icon.
     * @returns {String} - status, one of the WorkflowState enum values
     */
    getIcon () {
      // TBD: enumValueOf returned the wrong value?
      const state = [...WorkflowState.enumValues]
        .find(state => state.name === this.status)
      if (!state || state.length === 0) {
        return WorkflowState.ERROR.icon
      }
      return state.icon
    }
  }
}
</script>
