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
    <div class="c-tree">
      <tree-component
        :workflows="workflows"
        :hoverable="false"
        :activable="false"
        :multiple-active="false"
        :min-depth="1"
        ref="tree0"
        key="tree0"
      ></tree-component>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import TreeComponent from '@/components/cylc/tree/Tree'
import CylcObjectMenu from '@/components/cylc/cylcObject/Menu'
import { WORKFLOW_TREE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  name: 'Tree',
  components: {
    CylcObjectMenu,
    TreeComponent
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  computed: {
    ...mapState('workflows', ['workflow']),
    workflows () {
      return this.workflow &&
        this.workflow.tree &&
        this.workflow.tree.children
        ? this.workflow.tree.children
        : []
    },
    query () {
      return new SubscriptionQuery(
        WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
        this.variables,
        'workflow',
        [
          'workflows/applyWorkflowDeltas',
          'workflows/applyTreeDeltas'
        ],
        [
          'workflows/clearWorkflow',
          'workflows/clearTree'
        ]
      )
    }
  }
}
</script>
