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
  <div>
    <ConnectionStatus :is-offline="offline" />
    <toolbar v-if="!workflowViews.includes($route.name)" />
    <drawer />

    <v-main>
      <alert />
      <div id="core-view">
        <v-fade-transition mode="out-in">
          <slot/>
        </v-fade-transition>
      </div>
    </v-main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store/index'
import AlertModel from '@/model/Alert.model'
import Alert from '@/components/core/Alert'
import Drawer from '@/components/cylc/Drawer'
import Toolbar from '@/components/cylc/Toolbar'
import ConnectionStatus from '@/components/cylc/ConnectionStatus'

export default {
  name: 'Default',

  components: {
    ConnectionStatus,
    Alert,
    Drawer,
    Toolbar
  },

  data () {
    return {
      /**
       * Views that display workflows. For these views, we do not
       * want to display the default Toolbar—the Workflow view
       * has its own Toolbar that communicates with the Workflow
       * component (e.g. the Workflow Toolbar owns a button that
       * triggers the action to add a new Tree or Table View, so the events
       * are passed down from the parent Workflow View).
       */
      workflowViews: [
        'workflow',
        'tree',
        'table'
      ]
    }
  },

  computed: {
    ...mapState(['offline'])
  },

  errorCaptured (error, vm, info) {
    if (process.env.NODE_ENV !== 'production') {
      store.dispatch('setAlert', new AlertModel(error, null, 'error'))
    }
  }
}
</script>
