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
      v-on:add="this.addView"
    ></toolbar>
    <div class="workflow-panel fill-height">
      <lumino
        ref="lumino"
        v-on:lumino:deleted="onWidgetDeletedEvent"
        tab-title-prop="tab-title"
      >
        <v-skeleton-loader
          v-for="widgetId of treeWidgets"
          :key="widgetId"
          :id="widgetId"
          :loading="isLoading"
          type="list-item-three-line"
          tab-title="tree"
        >
          <tree-view
            :workflow-name="workflowName"
          />
        </v-skeleton-loader>
        <mutations-view
          v-for="widgetId of mutationsWidgets"
          :key="widgetId"
          :id="widgetId"
          :workflow-name="workflowName"
          tab-title="mutations"
        />
        <subscriptions-view
          v-for="widgetId of subscriptionsWidgets"
          :key="widgetId"
          :id="widgetId"
          :workflow-name="workflowName"
          tab-title="subscriptions"
        />
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
import SubscriptionsView from '@/components/cylc/Subscriptions'
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
    TreeView,
    MutationsView,
    SubscriptionsView,
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
    widgets: {}
  }),
  computed: {
    ...mapState('workflows', ['workflow']),
    treeWidgets () {
      return Object
        .entries(this.widgets)
        .filter(([id, type]) => type === TreeView.name)
        .map(([id, type]) => id)
    },
    mutationsWidgets () {
      return Object
        .entries(this.widgets)
        .filter(([id, type]) => type === MutationsView.name)
        .map(([id, type]) => id)
    },
    subscriptionsWidgets () {
      return Object
        .entries(this.widgets)
        .filter(([id, type]) => type === SubscriptionsView.name)
        .map(([id, type]) => id)
    }
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
     */
    addView (view) {
      switch (view) {
      case TreeView.name:
        Vue.set(this.widgets, createWidgetId(), TreeView.name)
        break
      case MutationsView.name:
        Vue.set(this.widgets, createWidgetId(), MutationsView.name)
        break
      case SubscriptionsView.name:
        Vue.set(this.widgets, createWidgetId(), SubscriptionsView.name)
        break
      default:
        throw Error(`Unknown view "${view}"`)
      }
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
