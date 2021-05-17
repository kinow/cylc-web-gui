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
    <CylcObjectMenu />
    <toolbar
      :views="views"
      v-on:add="this.addView"
    ></toolbar>
    <div class="workflow-panel fill-height">
      <lumino
        ref="lumino"
        v-on:lumino:deleted="onWidgetDeletedEvent"
        tab-title-prop="tab-title"
      >
        <v-skeleton-loader
          v-for="(view, id) of widgets"
          :key="id"
          :id="id"
          :loading="isLoading"
          :tab-title="view.data().widget.title"
          type="list-item-three-line"
        >
          <component
            :is="view"
            :workflow-name="workflowName"
          />
        </v-skeleton-loader>
      </lumino>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { each, iter } from '@lumino/algorithm'
import pageMixin from '@/mixins'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import ViewState from '@/model/ViewState.model'
import { createWidgetId } from '@/components/cylc/workflow/index'
import Lumino from '@/components/cylc/workflow/Lumino'
import Toolbar from '@/components/cylc/workflow/Toolbar'
import CylcObjectMenu from '@/components/cylc/cylcObject/Menu'
import MutationsView from '@/views/Mutations'
import TableView from '@/views/Table'
import TreeView from '@/views/Tree'
import { mapState } from 'vuex'

export default {
  name: 'Workflow',
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionViewMixin
  ],
  components: {
    CylcObjectMenu,
    Lumino,
    Toolbar
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    /**
     * The widgets added to the view.
     *
     * @type {Object.<String, String>}
     */
    widgets: {},
    /**
     * A list of Vue views or components. These components must provide a .widget
     * property/data with the title and icon properties.
     *
     * Each view in this list will be available from the Toolbar to be added as
     * a widget.
     *
     * @type {Object[]}
     */
    views: [
      TreeView,
      TableView,
      MutationsView
    ]
  }),
  created () {
    // We need to load each view used by this view/component.
    // See "local-registration" in Vue.js documentation.
    this.views.forEach(view => {
      this.$options.components[view.name] = view
    })
  },
  computed: {
    ...mapState('workflows', ['workflow'])
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        vm.addView(TreeView.name)
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    // clear all widgets
    this.removeAllWidgets()
    next()
    // start over again with the new deltas query/variables/new widget as in beforeRouteEnter
    // and in the next tick as otherwise we would get stale/old variables for the graphql query
    this.$nextTick(() => {
      // Create a Tree View for the current workflow by default
      this.addView(TreeView.name)
    })
  },
  beforeRouteLeave (to, from, next) {
    // clear all widgets
    this.removeAllWidgets()
    next()
  },
  methods: {
    /**
     * Add a new view widget.
     *
     * @type {String} viewName - the name of the view to be added (Vue component name).
     */
    addView (viewName) {
      const view = this.views
        .filter(v => v.name === viewName)
        .slice(0)[0]
      if (!view) {
        throw Error(`Unknown view "${viewName}"`)
      }
      Vue.set(this.widgets, createWidgetId(), view)
      this.$nextTick(() => {
        // Views use navigation-guards to start the pending subscriptions. But we don't have
        // this in this view. We must pretend we are doing the beforeRouteEnter here, and
        // call the .startSubscriptions function, so that the WorkflowService will take care
        // of loading the pending subscriptions (like the ones created by the new view).
        this.$workflowService.startSubscriptions()
      })
    },
    /**
     * Remove all the widgets present in the UI.
     */
    removeAllWidgets () {
      const dockWidgets = this.$refs.lumino.dock.widgets()
      const widgets = []
      each(iter(dockWidgets), widget => {
        widgets.push(widget)
      })
      widgets.forEach(widget => widget.close())
    },
    /**
     * Called for each widget removed. Each widget contains a subscription
     * attached. This method will check if it needs to cancel the
     * subscription (e.g. we removed the last widget using a deltas
     * subscription).
     *
     * Calling it might change the value of the `isLoading` data
     * attribute.
     *
     * @param {{
     *   id: string
     * }} event UI event containing the widget ID (string value, needs to be parsed)
     */
    onWidgetDeletedEvent (event) {
      Vue.delete(this.widgets, event.id)
      // If we have no more widgets in the view, then we are not loading, not complete, not error,
      // but back to beginning. When a widget is added, if it uses a query, then the mixins will
      // take care to set the state to LOADING and then COMPLETE (and hopefully not ERROR).
      if (Object.entries(this.widgets).length === 0) {
        this.viewState = ViewState.NO_STATE
      }
    }
  }
}
</script>
