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
  <v-app-bar
    app
    id="core-app-bar"
    dense
    flat
    class="c-toolbar"
  >
    <!-- TODO: duplicated in workflow/Toolbar.vue and cylc/Toolbar.vue -->
    <!-- burger button for mobile -->
    <v-btn
      v-if="responsive"
      dark
      icon
      @click.stop="onClickBtn"
      class="default v-btn--simple"
      id="toggle-drawer"
    >
      <v-icon>{{ svgPaths.list }}</v-icon>
    </v-btn>
    <!-- title -->
    <v-toolbar-title
      class="font-weight-light"
    >
      <span class="c-toolbar-title">{{ title }}</span>
    </v-toolbar-title>

    <!-- control bar elements displayed only when there is a current workflow in the store -->
    <template v-if="currentWorkflow">
      <v-icon
        id="workflow-mutate-button"
        color="#5E5E5E"
        v-cylc-object="currentWorkflow.id"
      >
        {{ svgPaths.menu }}
      </v-icon>

      <v-icon
        id="workflow-play-pause-button"
        color="#5E5E5E"
        :disabled="!enabled.pauseToggle"
        @click="onClickReleaseHold"
      >
        {{ isPaused ? svgPaths.run : svgPaths.hold }}
      </v-icon>

      <v-icon
        id="workflow-stop-button"
        color="#5E5E5E"
        :disabled="!enabled.stopToggle"
        @click="onClickStop"
      >
        {{ svgPaths.stop }}
      </v-icon>

      <!-- TODO: add workflow latest message -->
      <span></span>

      <v-spacer />

      <v-menu
        offset-y
        v-if="$route.name === 'workflow'"
      >
        <template v-slot:activator="{ on }">
          <a class="add-view" v-on="on">
            <v-icon class="icon" color="#5995EB">{{ svgPaths.add }}</v-icon>
            <span class="label">
              {{ $t('Toolbar.addView') }}
            </span>
          </a>
        </template>
        <v-list class="pa-0">
          <v-list-item
            :id="`toolbar-add-${ view.name }-view`"
            v-for="view in views"
            :key="view.name"
            @click="$listeners['add'](view.name)"
            class="py-0 px-8 ma-0 c-add-view"
          >
            <v-list-item-icon>
              <v-icon>{{ view.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ view.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- displayed only when extended===true -->
    <template v-slot:extension v-if="extended">
      <span style="margin-left: 260px;">
        <a @click="onClickPause">
          <v-icon color="#5E5E5E">{{ svgPaths.hold }}</v-icon>
        </a>

        <a @click="onClickStop">
          <v-icon color="#5E5E5E">{{ svgPaths.stop }}</v-icon>
        </a>

        <span>Other controls added in the future</span>
      </span>
    </template>
  </v-app-bar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  mdiAppleKeyboardCommand,
  mdiBroadcast,
  mdiFileTree,
  mdiMicrosoftXboxControllerMenu,
  mdiPause,
  mdiPlay,
  mdiPlusBoxMultiple,
  mdiStop,
  mdiViewList
} from '@mdi/js'
import toolbar from '@/mixins/toolbar'
import WorkflowState from '@/model/WorkflowState.model'
import TreeView from '@/views/Tree'
import MutationsView from '@/views/Mutations'
import SubscriptionsView from '@/components/cylc/Subscriptions'

import {
  mutationStatus
} from '@/utils/aotf'

export default {
  name: 'Toolbar',

  mixins: [
    toolbar
  ],

  data: () => ({
    extended: false,
    // FIXME: remove local state once we have this data in the workflow - https://github.com/cylc/cylc-ui/issues/221
    svgPaths: {
      add: mdiPlusBoxMultiple,
      hold: mdiPause,
      list: mdiViewList,
      menu: mdiMicrosoftXboxControllerMenu,
      run: mdiPlay,
      stop: mdiStop
    },
    expecting: {
      // store state from mutations in order to compute the "enabled" attrs
      paused: null,
      stop: null
    },
    views: [
      {
        name: TreeView.name,
        icon: mdiFileTree

      },
      {
        name: MutationsView.name,
        icon: mdiAppleKeyboardCommand
      },
      {
        name: SubscriptionsView.name,
        icon: mdiBroadcast
      }
    ]
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapGetters('workflows', ['currentWorkflow']),
    isPaused () {
      return (
        this.currentWorkflow &&
        this.currentWorkflow.status === WorkflowState.PAUSED.name
      )
    },
    isStopped () {
      return (
        !this.currentWorkflow ||
        this.currentWorkflow.status === WorkflowState.STOPPED.name
      )
    },
    enabled () {
      // object holding the states of controls that are supposed to be enabled
      // NOTE: this is a temporary solution until we are able to subscribe to
      // mutations to tell when they have completed
      return {
        pauseToggle: (
          // the play/pause button
          !this.isStopped &&
          !this.expecting.stop &&
          this.currentWorkflow.status !== WorkflowState.STOPPING.name &&
          (
            this.expecting.paused === null ||
            this.expecting.paused === this.currentWorkflow.isPaused
          )
        ),
        stopToggle: (
          // the stop button
          !this.isStopped &&
          (
            this.expecting.stop === null ||
            this.expecting.stop === this.currentWorkflow.isStopped
          )
        )
      }
    }
  },

  watch: {
    isPaused () {
      this.expecting.paused = null
    },
    isStopped () {
      this.expecting.stop = null
    }
  },

  methods: {
    onClickReleaseHold () {
      const ret = this.$workflowService.mutate(
        this.isPaused ? 'resume' : 'pause',
        this.currentWorkflow.id
      )
      if (ret[0] === mutationStatus.SUCCEEDED) {
        this.expecting.paused = !this.isPaused
      }
    },
    async onClickStop () {
      const ret = this.$workflowService.mutate(
        'stop',
        this.currentWorkflow.id
      )
      if (ret[0] === mutationStatus.SUCCEEDED) {
        this.expecting.stop = WorkflowState.STOPPING
      }
    },
    toggleExtended () {
      this.extended = !this.extended
    }
  }
}
</script>
