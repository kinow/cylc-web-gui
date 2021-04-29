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
  <div class="tableitem" v-show="filtered">
    <div
      :class="getNodeClass()"
      :style="getNodeStyle()"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-flex
        class="node-expand-collapse-button"
        shrink
        v-if="hasChildren"
        @click="typeClicked"
        :style="getTypeStyle()"
      >{{ isExpanded ? '&#9661;' : '&#9655;' }}</v-flex>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <slot name="cyclepoint" v-if="node.type === 'cyclepoint'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
          />
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="family-proxy" v-else-if="node.type === 'family-proxy'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
          />
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="task-proxy" v-else-if="node.type === 'task-proxy'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <!-- Task summary -->
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
            :startTime="taskStartTime(node)"
            :estimatedDuration="taskEstimatedDuration(node)"
          />
          <div v-if="!isExpanded" class="node-summary">
            <!-- most recent job summary -->
            <job
              v-for="(job, index) in node.children.slice(0, 1)"
              v-cylc-object="job.id"
              :key="`${job.id}-summary-${index}`"
              :status="job.node.state"
              style="margin-left: 0.25em;"
            />
          </div>
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="job" v-else-if="node.type === 'job'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <job
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
          />
          <span class="mx-1">#{{ node.node.submitNum }}</span>
          <span class="grey--text">{{ node.node.platform }}</span>
          <span
            class="grey--text d-flex flex-nowrap flex-row align-center"
            v-if="node.node.customOutputs.length > 0"
          >
            <!--
              We had a tricky bug in #530 due to the :key here. In summary, the list
              that is backing this component changes. It contains zero or more entries,
              up to N (5 at the time of writing).
              Initially we used `:key=customOutput.id` here. But Vue tried to avoid
              changing the DOM elements, which caused some elements to be out of order
              in the final rendered UI (as Vue was trying to optimize and keep the
              DOM elements in-place whenever possible).
              That behaviour is not deterministic, so sometimes you would have the list
              in order. The fix was to use a key that combines a string with the list
              iteration `index` (the `:key` value must be unique, so we used output-chip
              prefix).
              @see https://github.com/cylc/cylc-ui/pull/530#issuecomment-781076619
            -->
            <v-tooltip
              v-for="(customOutput, index) of [...node.node.customOutputs].slice(0, 5)"
              :key="`output-chip-${index}`"
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-bind="attrs"
                  v-on="on"
                  color="grey"
                  text-color="grey lighten-5"
                  class="ml-2"
                  small
                >{{ customOutput.label }}</v-chip>
              </template>
              <span>{{ customOutput.message }}</span>
            </v-tooltip>
            <v-chip
              v-if="node.node.customOutputs.length > 5"
              color="grey"
              text-color="grey lighten-5"
              class="ml-2"
              small
              link
              @click="typeClicked"
            >+{{ node.node.customOutputs.length - 5 }}</v-chip>
          </span>
        </div>
      </slot>
      <slot name="job-details" v-else-if="node.type === 'job-details'">
        <div class="leaf">
          <div class="arrow-up" :style="getLeafTriangleStyle()"></div>
          <div class="leaf-data font-weight-light py-4 pl-2">
            <div
              v-for="jobDetail in node.node.details"
              :key="jobDetail.id"
              class="leaf-entry"
            >
              <span class="px-4 leaf-entry-title">{{ jobDetail.title }}</span>
              <span class="grey--text leaf-entry-value">{{ jobDetail.value }}</span>
            </div>
            <v-divider class="ml-3 mr-5" />
            <div class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">outputs</span>
            </div>
            <div
              v-if="node.node.customOutputs && node.node.customOutputs.length > 0"
              class="leaf-outputs-entry"
            >
              <div
                v-for="customOutput of node.node.customOutputs"
                :key="`${customOutput.id}-leaf`"
                class="leaf-entry"
              >
                <span class="px-4 leaf-entry-title">{{ customOutput.label }}</span>
                <span class="grey--text leaf-entry-value">{{ customOutput.message }}</span>
              </div>
            </div>
            <div v-else class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">No custom messages</span>
            </div>
          </div>
        </div>
      </slot>
      <slot
        v-bind:node="node"
        name="node"
        v-else
      >
        <div :class="getNodeDataClass()">
          <span
            v-if="node && node.node"
            @click="nodeClicked"
            :key="node.node.id"
            class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot></slot>
    </div>
    <span v-show="isExpanded">
      <!-- component recursion -->
      <TableItem
        v-for="child in node.children"
        ref="tableitem"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :hoverable="hoverable"
        :initialExpanded="initialExpanded"
        v-on:table-item-created="$listeners['table-item-created']"
        v-on:table-item-destroyed="$listeners['table-item-destroyed']"
        v-on:table-item-expanded="$listeners['table-item-expanded']"
        v-on:table-item-collapsed="$listeners['table-item-collapsed']"
        v-on:table-item-clicked="$listeners['table-item-clicked']"
      >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
      </TableItem>
    </span>
  </div>
</template>

<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import TaskState from '@/model/TaskState.model'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 1.5 // em

export default {
  name: 'TableItem',
  components: {
    task: Task,
    job: Job
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    hoverable: Boolean,
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      isExpanded: this.initialExpanded,
      leafProperties: [
        {
          title: 'platform',
          property: 'platform'
        },
        {
          title: 'job id',
          property: 'jobId'
        },
        {
          title: 'batch sys',
          property: 'jobRunnerName'
        },
        {
          title: 'submit time',
          property: 'submittedTime'
        },
        {
          title: 'start time',
          property: 'startedTime'
        },
        {
          title: 'finish time',
          property: 'finishedTime'
        }
      ],
      filtered: true
    }
  },
  computed: {
    hasChildren () {
      return this.node.children
    }
  },
  created () {
    this.$emit('table-item-created', this)
  },
  beforeDestroy () {
    this.$emit('table-item-destroyed', this)
  },
  beforeMount () {
    if (this.node.expanded !== undefined && this.node.expanded !== null) {
      this.isExpanded = this.node.expanded
      this.emitExpandCollapseEvent(this.isExpanded)
    }
  },
  methods: {
    typeClicked () {
      this.isExpanded = !this.isExpanded
      this.emitExpandCollapseEvent(this.isExpanded)
    },
    /**
     * Emits an event `table-item-expanded` if `expanded` is true, or emits
     * `table-item-collapsed` if `expanded` is false.
     * @param {boolean} expanded whether the node is expanded or not
     */
    emitExpandCollapseEvent (expanded) {
      if (expanded) {
        this.$emit('table-item-expanded', this)
      } else {
        this.$emit('table-item-collapsed', this)
      }
    },
    getTypeStyle () {
      const styles = {}
      if (this.hasChildren) {
        styles.cursor = 'pointer'
      }
      return styles
    },
    /**
     * Handler for when any node of the table was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      this.$emit('table-item-clicked', this)
    },
    getNodeStyle () {
      return {
        'padding-left': `${this.node.type === 'job-details' ? 0 : this.depth * NODE_DEPTH_OFFSET}em`
      }
    },
    /**
     * All nodes have the same padding-left. However, the job leaf node needs special care, as it will occupy the
     * whole content area.
     *
     * For this, we calculate it similarly to `getNodeStyle` but doing the reverse, to move the element to the
     * left, instead of moving it to the right. Using `depth` to calculate the exact location for the element.
     */
    getLeafTriangleStyle () {
      return {
        // subtract half of the width of the job component
        'margin-left': `${(this.depth * NODE_DEPTH_OFFSET) - 0.5}em`
      }
    },
    getNodeClass () {
      return {
        node: true,
        'node--hoverable': this.hoverable,
        'node--active': this.active
      }
    },
    getNodeDataClass () {
      const classes = {}
      classes['node-data'] = true
      classes[`node-data-${this.node.type}`] = true
      return classes
    },
    taskStartTime (taskProxy) {
      if (
        taskProxy.node.state === TaskState.RUNNING.name &&
        taskProxy.children.length > 0 &&
        taskProxy.children[0] &&
        taskProxy.children[0].node &&
        taskProxy.children[0].node.startedTime
      ) {
        return taskProxy.children[0].node.startedTime
      }
      return null
    },
    taskEstimatedDuration (taskProxy) {
      if (
        taskProxy.node &&
        taskProxy.node.task &&
        taskProxy.node.task.meanElapsedTime
      ) {
        return taskProxy.node.task.meanElapsedTime
      }
      return null
    }
  }
}
</script>
