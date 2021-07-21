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

import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import { expect } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import { simpleWorkflowGscanNodes } from './gscan.data'
import storeOptions from '@/store/options'
import WorkflowState from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'
import GScan from '@/components/cylc/gscan/GScan'
import TreeItem from '@/components/cylc/tree/TreeItem'
import { createWorkflowNode } from '@/components/cylc/gscan/nodes'

global.requestAnimationFrame = cb => cb()

const localVue = createLocalVue()
localVue.prototype.$workflowService = {
  register: function () {
  },
  unregister: function (obj) {
    // we will reset the subscriptions object so tests can confirm
    // this function has been called
    obj.subscriptions = {}
  },
  subscribe: function (obj, name) {
    return true
  },
  unsubscribe: function () {
  },
  startDeltasSubscription: function () {
    return {
      unsubscribed: false,
      unsubscribe () {
        this.unsubscribed = true
      }
    }
  }
}

Vue.use(Vuetify)
Vue.use(Vuex)

describe('GScan component', () => {
  const store = new Vuex.Store(storeOptions)
  const resetState = () => {
    store.commit('workflows/SET_WORKFLOWS', [])
    store.commit('workflows/SET_WORKFLOW_NAME', null)
  }
  beforeEach(resetState)
  afterEach(resetState)
  /**
   * @param options
   * @returns {Wrapper<GScan>}
   */
  const mountFunction = options => {
    const vuetify = new Vuetify()
    return mount(GScan, {
      localVue,
      vuetify,
      store,
      stubs: {
        RouterLink: RouterLinkStub
      },
      ...options
    })
  }
  it('should display a skeleton loader if loading data', () => {
    const wrapper = mountFunction({
      computed: {
        isLoading () {
          return true
        }
      }
    })
    const skeletonLoader = wrapper.find('.v-skeleton-loader')
    const isBusy = skeletonLoader.element.getAttribute('aria-busy')
    expect(isBusy).to.equal('true')
  })
  it('should display the GScan with valid data', () => {
    store.commit('workflows/SET_WORKFLOWS', simpleWorkflowGscanNodes)
    const wrapper = mountFunction({})
    expect(wrapper.vm.workflows[0].name).to.equal('five')
    expect(wrapper.find('div')).to.not.equal(null)
    expect(wrapper.html()).to.contain('five')
  })
  describe('Nodes', () => {
    it('should create nodes and workflow name part nodes', () => {
      const workflow = {
        id: 'user|a/b/c',
        name: 'a/b/c',
        status: WorkflowState.PAUSED.name,
        stateTotals: {
          [TaskState.FAILED.name]: 1
        }
      }
      const nodeHierarchy = createWorkflowNode(workflow, true)
      expect(nodeHierarchy.name).to.equal('a')
      const node = createWorkflowNode(workflow, false)
      expect(node.name).to.equal(null)
      expect(node.id).to.equal('user|a/b/c')
    })
  })
  describe('Sorting', () => {
    const createWorkflows = (namesAndStatuses) => {
      return namesAndStatuses.map(nameAndStatus => {
        return {
          id: `user|${nameAndStatus.name}`,
          name: nameAndStatus.name,
          status: nameAndStatus.status.name,
          latestStateTasks: []
        }
      })
    }
    it('should sort workflows', () => {
      const tests = [
        // already sorted by name
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.RUNNING }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // already sorted by status
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.PAUSED },
            { name: 'd', status: WorkflowState.PAUSED },
            { name: 'e', status: WorkflowState.STOPPED }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // sort in alphabetical order
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.RUNNING }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // running workflows are displayed first, then paused, then the rest...
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.STOPPED },
            { name: 'd', status: WorkflowState.STOPPED }
          ]),
          expected: ['a', 'e', 'b', 'c', 'd']
        },
        // sorted alphabetically within statuses
        {
          workflows: createWorkflows([
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED }
          ]),
          expected: ['b', 'a', 'e', 'c', 'd']
        },
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED },
            { name: 'e', status: WorkflowState.PAUSED }
          ]),
          expected: ['b', 'a', 'e', 'c', 'd']
        },
        // new statuses (stopping, error)
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED },
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'f', status: WorkflowState.PAUSED },
            { name: 'h', status: WorkflowState.STOPPING },
            { name: 'g', status: WorkflowState.ERROR },
            { name: 'j', status: WorkflowState.STOPPING },
            { name: 'i', status: WorkflowState.STOPPED },
            { name: 'k', status: WorkflowState.RUNNING },
            { name: 'l', status: WorkflowState.PAUSED }
          ]),
          expected: ['b', 'k', 'a', 'e', 'f', 'l', 'h', 'j', 'c', 'd', 'i', 'g']
        },
        // sorting by type too
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'a/b', status: WorkflowState.RUNNING }
          ]),
          expected: ['b', 'a']
        }
      ]
      tests.forEach(test => {
        store.commit('workflows/SET_WORKFLOWS', test.workflows)
        const wrapper = mountFunction()
        // We will have all TreeItem elements, workflow-name-part's, and workflow's.
        const workflowsElements = wrapper.findAllComponents(TreeItem)
          .filter((treeItem) => {
            return treeItem.vm.node.type === 'workflow'
          })
        expect(workflowsElements.length).to.equal(test.expected.length)
        for (let i = 0; i < test.expected.length; i++) {
          expect(test.expected[i]).to.equal(workflowsElements.at(i).element.textContent)
        }
      })
    })
  })
  describe('Filters', () => {
    const workflows = [
      {
        id: 'user|1',
        name: 'new zealand',
        status: WorkflowState.PAUSED.name,
        stateTotals: {
          [TaskState.FAILED.name]: 1
        }
      },
      {
        id: 'user|2',
        name: 'zeeland',
        status: WorkflowState.RUNNING.name,
        stateTotals: {
          [TaskState.RUNNING.name]: 1
        }
      },
      {
        id: 'user|research/test/a/run1',
        name: 'research/test/a/run1',
        status: WorkflowState.PAUSED.name,
        stateTotals: {}
      },
      {
        id: 'user|research/test/b/run1',
        name: 'research/test/b/run1',
        status: WorkflowState.PAUSED.name,
        stateTotals: {}
      },
      {
        id: 'user|research',
        name: 'research',
        status: WorkflowState.STOPPED.name,
        stateTotals: {}
      }
    ]
    const initialWorkflowStates = WorkflowState.enumValues.map(state => {
      return {
        text: state.name,
        value: state,
        model: true
      }
    })
    const initialWorkflowTaskStates = TaskState.enumValues.map(state => {
      return {
        text: state.name,
        value: state,
        model: false
      }
    })
    /**
     * Helper function to retrieve the workflows in a nested hierarchy.
     *
     * @param {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>} hierarchicalWorkflows
     * @returns {Array<WorkflowGScanNode|WorkflowNamePartGScanNode>}
     */
    const getWorkflows = (hierarchicalWorkflows) => {
      const reducer = (result, workflowNode) => {
        if (workflowNode.type === 'workflow-name-part') {
          return workflowNode.children.reduce(reducer, result)
        }
        result.push(workflowNode)
        return result
      }
      return hierarchicalWorkflows.reduce(reducer, [])
    }
    // utility function to create the list of filters, used by tests below
    const createStatesFilters = (workflowStates, workflowTaskStates) => {
      return [
        {
          title: 'workflow state',
          items: workflowStates
        },
        {
          title: 'task state',
          items: workflowTaskStates
        }
      ]
    }
    it('should have a default state of no name filter, and all states enabled', () => {
      store.commit('workflows/SET_WORKFLOWS', workflows)
      const wrapper = mountFunction({})
      // read: give me all the workflows in RUNNING/PAUSED/STOPPED, no
      //       matter their names or their tasks' states.
      // no workflow name filtered initially
      expect(wrapper.vm.searchWorkflows).to.equal('')
      // every workflow state filter is ON initially
      const workflowStateFiltersOn = wrapper.vm.filters[0].items
        .map(filterItem => filterItem.model)
      expect(workflowStateFiltersOn.every(model => model)).to.equal(true)
      // every task state filter is OFF initially
      const taskStateFiltersOn = wrapper.vm.filters[1].items
        .map(filterItem => filterItem.model)
      expect(taskStateFiltersOn.some(model => model)).to.equal(false)
      // we will have the two items being displayed too
      const filtered = getWorkflows(wrapper.vm.filteredWorkflows)
      expect(filtered.length).to.equal(5)
    })
    it('should not filter by name, nor by tasks state by default, but should include all workflow states', () => {
      store.commit('workflows/SET_WORKFLOWS', workflows)
      const wrapper = mountFunction({})
      wrapper.vm.filteredWorkflows = wrapper.vm.filterHierarchically(
        wrapper.vm.workflowNodes,
        wrapper.vm.searchWorkflows,
        wrapper.vm.workflowStates,
        wrapper.vm.taskStates
      )
      // we will have the two items being displayed too
      const filtered = getWorkflows(wrapper.vm.filteredWorkflows)
      const raw = getWorkflows(wrapper.vm.workflowNodes)
      expect(filtered.length).to.equal(raw.length)
    })
    describe('Filter by workflow name', () => {
      it('should filter by name', () => {
        const tests = [
          {
            searchWorkflow: '',
            expected: 5
          },
          {
            searchWorkflow: 'new',
            expected: 1
          },
          {
            searchWorkflow: 'NEW',
            expected: 1
          },
          {
            searchWorkflow: 'neW',
            expected: 1
          },
          {
            searchWorkflow: 'land',
            expected: 2
          },
          {
            searchWorkflow: 'dog',
            expected: 0
          }
        ]
        tests.forEach(test => {
          store.commit('workflows/SET_WORKFLOWS', workflows)
          const wrapper = mountFunction({})
          let filtered = getWorkflows(wrapper.vm.filteredWorkflows)
          const raw = getWorkflows(wrapper.vm.workflowNodes)
          expect(filtered.length).to.equal(raw.length)
          wrapper.vm.filteredWorkflows = wrapper.vm.filterHierarchically(
            wrapper.vm.workflowNodes,
            test.searchWorkflow,
            wrapper.vm.workflowStates,
            wrapper.vm.taskStates)
          filtered = getWorkflows(wrapper.vm.filteredWorkflows)
          expect(filtered.length).to.equal(test.expected)
        })
      })
    })
    describe('Filter by workflow state', () => {
      it('should filter by workflow state', () => {
        const tests = [
          // all states enabled
          {
            workflowStates: WorkflowState.enumValues,
            expected: 5
          },
          // enable only the ones we have in our test data set
          {
            workflowStates: [WorkflowState.RUNNING, WorkflowState.PAUSED],
            expected: 4
          },
          // enable just one of the values we have in our test data set
          {
            workflowStates: [WorkflowState.RUNNING],
            expected: 1
          },
          // leave the ones we have in our test data set un-checked
          {
            workflowStates: [],
            expected: 0
          }
        ]
        tests.forEach(test => {
          const workflowStates = initialWorkflowStates
            .map(state => {
              if (test.workflowStates.includes(state.value)) {
                return Object.assign({}, state, { model: true })
              }
              return Object.assign({}, state, { model: false })
            })
          store.commit('workflows/SET_WORKFLOWS', workflows)
          const wrapper = mountFunction({})
          const filters = createStatesFilters(workflowStates, initialWorkflowTaskStates)
          wrapper.vm.filteredWorkflows = wrapper.vm.filterHierarchically(
            wrapper.vm.workflowNodes,
            '',
            filters[0]
              .items
              .filter(item => item.model)
              .map(item => item.value.name),
            filters[1]
              .items
              .filter(item => item.model)
              .map(item => item.value.name))
          const filtered = getWorkflows(wrapper.vm.filteredWorkflows)
          expect(filtered.length).to.equal(test.expected)
        })
      })
    })
    describe('Filter by workflow tasks state', () => {
      it('should filter by workflow tasks state', () => {
        const tests = [
          // all states enabled
          {
            workflowTaskStates: TaskState.enumValues,
            expected: 2
          },
          // enable only the ones we have in our test data set
          {
            workflowTaskStates: [TaskState.RUNNING, TaskState.FAILED],
            expected: 2
          },
          // enable just one of the values we have in our test data set
          {
            workflowTaskStates: [TaskState.RUNNING],
            expected: 1
          },
          // un-checking means every task state enabled
          {
            workflowTaskStates: [],
            expected: 5
          }
        ]
        tests.forEach(test => {
          const workflowTaskStates = initialWorkflowTaskStates
            .map(state => {
              if (test.workflowTaskStates.includes(state.value)) {
                return Object.assign({}, state, { model: true })
              }
              return Object.assign({}, state, { model: false })
            })
          store.commit('workflows/SET_WORKFLOWS', workflows)
          const wrapper = mountFunction({})
          const filters = createStatesFilters(initialWorkflowStates, workflowTaskStates)
          wrapper.vm.filteredWorkflows = wrapper.vm.filterHierarchically(
            wrapper.vm.workflowNodes,
            '',
            filters[0]
              .items
              .filter(item => item.model)
              .map(item => item.value.name),
            filters[1]
              .items
              .filter(item => item.model)
              .map(item => item.value.name))
          const filtered = getWorkflows(wrapper.vm.filteredWorkflows)
          expect(filtered.length).to.equal(test.expected)
        })
      })
    })
  })
  describe('Workflow link', () => {
    it('should create an empty link for non-workflow nodes', () => {
      const link = GScan.methods.workflowLink({})
      expect(link).to.equal('')
    })
    it('should create a link for a workflow node', () => {
      const link = GScan.methods.workflowLink({
        type: 'workflow',
        node: {
          name: 'name'
        }
      })
      expect(link).to.equal('/workflows/name')
    })
  })
  describe('Toggle items values', () => {
    it('should toggle items values to true', () => {
      const items = [
        {
          model: false
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(items.every(item => item.model))
    })
    it('should toggle items values to false', () => {
      const items = [
        {
          model: true
        },
        {
          model: true
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
    it('should toggle items values to false (mixed values)', () => {
      const items = [
        {
          model: true
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
  })
})
