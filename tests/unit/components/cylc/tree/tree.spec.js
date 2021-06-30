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

import * as CylcTree from '@/components/cylc/tree/index'
import { expect } from 'chai'
import {
  createCyclePointNode,
  createFamilyProxyNode,
  createJobNode,
  createTaskProxyNode,
  createWorkflowNode
} from '@/components/cylc/tree/nodes'
import sinon from 'sinon'
import TaskState from '@/model/TaskState.model'
import Vue from 'vue'

/**
 * Tests for the CylcTree class.
 */
describe('CylcTree', () => {
  let workflow
  beforeEach(() => {
    workflow = {
      tree: {},
      lookup: {}
    }
    const workflowNode = createWorkflowNode({
      id: WORKFLOW_ID
    })
    CylcTree.addWorkflow(workflowNode, workflow)
  })
  describe('sortedIndexBy', () => {
    it('should assign 0 when given an empty array', () => {
      const cyclePoint = createCyclePointNode({
        id: 'cylc|workflow|1',
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      expect(workflow.tree.children[0].id).to.equal(cyclePoint.id)
    })
    it('should use numeric/natural sort for cycle points', () => {
      const cyclePoints = ['1', '10', '100', '2', '3', '4']
      for (const cyclePoint of cyclePoints) {
        CylcTree.addCyclePoint(createCyclePointNode({
          id: `cylc|workflow|${cyclePoint}`,
          cyclePoint: cyclePoint
        }), workflow, {})
      }
      // NB: cycle points are sorted in reverse order by default
      const expectedOrder = ['100', '10', '4', '3', '2', '1']
      expectedOrder.forEach((expected, index) => {
        expect(workflow.tree.children[index].node.name).to.equal(expected)
      })
    })
    it('should use numeric/natural sort for families and tasks, using the object type as well', () => {
      CylcTree.addCyclePoint(createCyclePointNode({
        id: 'cylc|workflow|1',
        cyclePoint: '1'
      }), workflow, {})
      // 2 families, 10FAM and 1FAM under the cyclepoint 1 (must be sorted as 1FAM and 10FAM)
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: 'cylc|workflow|1|10FAM',
        name: '10FAM',
        firstParent: {
          name: 'root'
        }
      }), workflow, {})
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: 'cylc|workflow|1|1FAM',
        name: '1FAM',
        firstParent: {
          name: 'root'
        }
      }), workflow, {})
      // 3 tasks, 1TASK, 100TASK, 2TASK under the cyclepoint 1 (must be sorted as 1TASK, 2TASK, and 10TASK)
      CylcTree.addTaskProxy(createTaskProxyNode({
        id: 'cylc|workflow|1|1TASK',
        name: '1TASK',
        firstParent: {
          name: 'root'
        }
      }), workflow, {})
      CylcTree.addTaskProxy(createTaskProxyNode({
        id: 'cylc|workflow|1|10TASK',
        name: '10TASK',
        firstParent: {
          name: 'root'
        }
      }), workflow, {})
      CylcTree.addTaskProxy(createTaskProxyNode({
        id: 'cylc|workflow|1|2TASK',
        name: '2TASK',
        firstParent: {
          name: 'root'
        }
      }), workflow, {})

      // Now we must have the families before the tasks, and everything sorted
      const expectedChildren = ['1FAM', '10FAM', '1TASK', '2TASK', '10TASK']
      const cyclePoint = workflow.tree.children[0]
      const children = cyclePoint.children
      expectedChildren.forEach((expected, index) => {
        expect(children[index].node.name).to.equal(expected)
      })
    })
    it('should sort cyclepoints ascending correctly', () => {
      const options = {
        cyclePointsOrderDesc: false
      }
      CylcTree.addCyclePoint(createCyclePointNode({
        id: 'cylc|workflow|7',
        cyclePoint: '7'
      }), workflow, options)
      CylcTree.addCyclePoint(createCyclePointNode({
        id: 'cylc|workflow|5',
        cyclePoint: '5'
      }), workflow, options)
      CylcTree.addCyclePoint(createCyclePointNode({
        id: 'cylc|workflow|6',
        cyclePoint: '6'
      }), workflow, options)
      const expectedChildren = ['5', '6', '7']
      const cyclePoints = workflow.tree.children
      expectedChildren.forEach((expected, index) => {
        expect(cyclePoints[index].node.name).to.equal(expected)
      })
    })
  })
  const WORKFLOW_ID = 'cylc|workflow'
  it('Should create a tree with a given workflow', () => {
    const workflowNode = createWorkflowNode({
      id: WORKFLOW_ID
    })
    CylcTree.clear(workflow)
    CylcTree.addWorkflow(workflowNode, workflow, {})
    expect(workflow.tree.id).to.equal(WORKFLOW_ID)
  })
  it('Should clear the tree and lookup map', () => {
    CylcTree.clear(workflow)
    expect(workflow.lookup).to.deep.equal({})
    expect(workflow.tree).to.deep.equal({})
  })
  it('Should return true for isEmpty if empty, false otherwise', () => {
    expect(CylcTree.isEmpty(workflow)).to.equal(false)
    CylcTree.clear(workflow)
    expect(CylcTree.isEmpty(workflow)).to.equal(true)
  })
  // cycle points
  describe('Cycle points', () => {
    it('Should add cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
      expect(workflow.tree.children[0].id).to.equal(`${WORKFLOW_ID}|1`)

      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].id).to.equal(`${WORKFLOW_ID}|2`)
      expect(workflow.tree.children[1].id).to.equal(`${WORKFLOW_ID}|1`)
    })
    it('Should add cycle points sorted DESC by default', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
      expect(workflow.tree.children[0].id).to.equal(cyclePoint1.id)

      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].id).to.equal(cyclePoint2.id)
      expect(workflow.tree.children[1].id).to.equal(cyclePoint1.id)
    })
    it('Should add cycle points sorted ASC if !cyclePointsOrderDesc', () => {
      const options = {
        cyclePointsOrderDesc: !CylcTree.DEFAULT_CYCLE_POINTS_ORDER_DESC
      }
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint2, workflow, options)
      expect(workflow.tree.children.length).to.equal(1)
      expect(workflow.tree.children[0].id).to.equal(cyclePoint2.id)

      CylcTree.addCyclePoint(cyclePoint1, workflow, options)
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].id).to.equal(cyclePoint1.id)
      expect(workflow.tree.children[1].id).to.equal(cyclePoint2.id)
    })
    it('Should not add a cycle point twice', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
    })
    it('Should update cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
      expect(workflow.tree.children[0].id).to.equal(`${WORKFLOW_ID}|1`)
      expect(workflow.tree.children[0].children.length).to.equal(0)
      cyclePoint1.children.push({
        id: 10
      })
      CylcTree.updateCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
      expect(workflow.tree.children[0].id).to.equal(`${WORKFLOW_ID}|1`)
      expect(workflow.tree.children[0].children.length).to.equal(1)
    })
    it('Should not update a cycle point if not already in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.updateCyclePoint(cyclePoint1, workflow, {})
      expect(workflow.tree.children.length).to.equal(0)
    })
    it('Should remove cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
      CylcTree.removeCyclePoint(cyclePoint1.id, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
    })
    it('Should remove cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
      CylcTree.removeCyclePoint(cyclePoint1.id, workflow, {})
      expect(workflow.tree.children.length).to.equal(1)
    })
    it('Should ignore if the cycle point to remove is not in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.removeCyclePoint(cyclePoint1.id, workflow, {})
      expect(workflow.tree.children.length).to.equal(0)
    })
    it('Should tally cyclepoints keeping reactivity', () => {
      // Pretend this is the data returned from GraphQL.
      const node = {
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      }
      // And this is part of the CylcTree that will be passed to a Vue component.
      const cyclePoint = createCyclePointNode(node)
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      // Instead of creating a full-blown component, let's imitate what it does
      // creating a reactive pointer to the cylcTree (as if it had been passed
      // via props to a component).
      const reactive = Vue.observable(workflow)
      // And now let's pretend we have received a delta and need to tally the
      // cyclepoint state.
      CylcTree.tallyCyclePointStates(workflow)
      // The .tallyCyclePointStates function will have created the .state property,
      // and since this property is used in a template, now the test must verify
      // that .state is reactive!
      const reactiveNode = reactive.tree.children[0].node
      const stateReactiveGetter = Object.getOwnPropertyDescriptor(reactiveNode, 'state').get
      // When you add a property in a JS object, the property descriptor contains a .value
      // property, not not a .get nor a .set. Whereas when Vue creates an observable for you,
      // it kindly provides the getter and setter, used/monitored in the template.
      expect(stateReactiveGetter).to.not.equal(undefined)
    })
  })
  // family proxies
  describe('Family proxies', () => {
    let cyclePoint1
    let cyclePoint2
    beforeEach(() => {
      cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
    })
    it('Should add family proxies even without a parent', () => {
      // This is because we may have a family proxy found in a task proxy first parent, or in another
      // family proxy first parent, that is not in the tree yet.
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam`
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(0)
      expect(workflow.tree.children[1].children.length).to.equal(0)
      expect(workflow.lookup[familyProxy1.id]).to.not.equal(null)
    })
    it('Should add family proxies even if already in the tree, merging it', () => {
      // This is because we may have a family proxy found in another family proxy first parent,
      // then the next time we add it, it is because we found it in the family proxy part of the
      // graphql response. When that happens, we must actually add-update it, merging with the
      // extra data found in graphql family proxies entry.
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam2`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        firstParent: {
          id: familyProxyId2
        }
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.lookup[familyProxyId2].id).to.not.equal(null)
      expect(workflow.lookup[familyProxy1.id].node.state).to.equal('')
      const familyProxy1Again = createFamilyProxyNode({
        id: familyProxyId1,
        state: TaskState.WAITING.name
      })
      CylcTree.addFamilyProxy(familyProxy1Again, workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(0)
      expect(workflow.tree.children[1].children.length).to.equal(0)
      expect(workflow.lookup[familyProxy1.id].id).to.not.equal(null)
      expect(workflow.lookup[familyProxy1.id].node.state).to.equal(TaskState.WAITING.name)
    })
    it('Should add family proxies under the cycle point when first parent is root', () => {
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        cyclePoint: cyclePoint1.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.tree.children[1].children[0].id).to.equal(familyProxyId1)
    })
    it('Should add family proxies under another family proxy successfully', () => {
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam2`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        cyclePoint: cyclePoint1.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      const familyProxy2 = createFamilyProxyNode({
        id: familyProxyId2,
        firstParent: {
          id: familyProxy1.id
        }
      })
      CylcTree.addFamilyProxy(familyProxy2, workflow, {})
      expect(workflow.tree.children[1].children[0].id).to.equal(familyProxyId1)
      expect(workflow.tree.children[1].children[0].children[0].id).to.equal(familyProxyId2)
    })
    it('Should add family proxies under another family proxy successfully (even if the parent family proxy does not exist in the tree yet!)', () => {
      // We may have a child family proxy, before the parent family proxy is created. In this case, we have to create the
      // parent family proxy, add to the tree, and link parent-child family proxies.
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      const familyProxy2 = createFamilyProxyNode({
        id: familyProxyId2,
        firstParent: {
          id: familyProxyId1
        }
      })
      CylcTree.addFamilyProxy(familyProxy2, workflow, {})
      expect(workflow.lookup[familyProxyId1].id).to.equal(familyProxyId1)
      expect(workflow.lookup[familyProxyId1].children[0].id).to.equal(familyProxyId2)
    })
    it('Should not add a family proxy twice to lookup, nor to its parent', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`,
        cyclePoint: cyclePoint2.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(1)
    })
    it('Should update family proxies', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      })
      CylcTree.addFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.lookup[familyProxy1.id].state).to.equal(undefined)
      familyProxy1.state = TaskState.WAITING.name
      CylcTree.updateFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.lookup[familyProxy1.id].state).to.equal(TaskState.WAITING.name)
    })
    it('Should not update a family proxy if it is not in the tree', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      })
      CylcTree.updateFamilyProxy(familyProxy1, workflow, {})
      expect(workflow.lookup[familyProxy1.id]).to.equal(undefined)
    })
    it('Should remove family proxies', () => {
      const rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${CylcTree.FAMILY_ROOT}`,
        name: CylcTree.FAMILY_ROOT,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: cyclePoint2.id
        }
      })
      CylcTree.addFamilyProxy(rootFamilyProxy, workflow, {})
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].children.length).to.equal(0)
      expect(workflow.tree.children[1].children.length).to.equal(0)

      const childFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam2`,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: rootFamilyProxy.id,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(childFamilyProxy, workflow, {})
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].children.length).to.equal(1)
      expect(workflow.tree.children[1].children.length).to.equal(0)
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)

      const grandChildFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam3`,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: childFamilyProxy.id
        }
      })
      CylcTree.addFamilyProxy(grandChildFamilyProxy, workflow, {})
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].children.length).to.equal(1)
      expect(workflow.tree.children[1].children.length).to.equal(0)
      expect(workflow.tree.children[0].children[0].children.length).to.equal(1)
      expect(workflow.tree.children[0].children[0].children[0].children.length).to.equal(0)

      CylcTree.removeFamilyProxy((grandChildFamilyProxy.id), workflow, {})
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)
      CylcTree.removeFamilyProxy((childFamilyProxy.id), workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(0)
      CylcTree.removeFamilyProxy(rootFamilyProxy.id, workflow, {})
      // the cycle point 2 was removed as its root family was removed (i.e. now the cycle point must be empty!)
      expect(workflow.tree.children.length).to.equal(1)
    })
  })
  // task proxies
  describe('Task Proxies', () => {
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    beforeEach(() => {
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|${CylcTree.FAMILY_ROOT}`,
        name: CylcTree.FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      CylcTree.addFamilyProxy(rootFamilyProxy, workflow, {})
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      CylcTree.addFamilyProxy(familyProxy, workflow, {})
    })
    it('Should add task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should not add task proxies twice', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(1)
    })
    it('Should add task proxies under root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        },
        cyclePoint: cyclePoint.node.name,
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const rootFamily = cyclepoint.children[0]
      expect(rootFamily.children.length).to.equal(0)
      // NOTE: the root family is not added, so we have the family and the task here, as the
      // task's parent was the root family.
      expect(cyclepoint.children.length).to.equal(2)
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(0)
      const task = cyclepoint.children[1]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should add task proxies under a family that is under the root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(1)
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should add task proxies and report if the parent is invalid', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: '-1'
        },
        state: TaskState.RUNNING.name
      })
      const sandbox = sinon.createSandbox()
      sandbox.stub(console, 'error')
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      expect(console.error.calledOnce).to.equal(true)
      const task = workflow.lookup[taskProxyId]
      expect(task.id).to.equal(taskProxyId)
      sandbox.restore()
    })
    it('Should update task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      taskProxy.node.state = TaskState.WAITING.name
      CylcTree.updateTaskProxy(taskProxy, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].node.state).to.equal(TaskState.WAITING.name)
    })
    it('Should not change the state of an existing task proxy when updating it', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].node.state).to.equal(TaskState.RUNNING.name)

      // state="running", now a delta without state should NOT change the existing state
      const updateTaskProxy = createTaskProxyNode({
        id: taskProxyId
      })
      CylcTree.updateTaskProxy(updateTaskProxy, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].node.state).to.equal(TaskState.RUNNING.name)
    })
    it('Should not update an task proxy if it is not in the tree', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      const orphanTaskProxy = createTaskProxyNode({
        id: 'NA',
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      CylcTree.updateTaskProxy(orphanTaskProxy, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].node.state).to.equal(taskProxyState)
    })
    it('Should remove task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      CylcTree.removeTaskProxy(taskProxy.id, workflow, {})
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)
    })
    it('Should remove task proxies if added to the root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        },
        cyclePoint: cyclePoint.id,
        state: taskProxyState
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      // NOTE: 0 is the fam family, 1 is the task proxy that was added to the
      // cycle point because its parent is the root family
      const task = cyclepoint.children[1]
      expect(task.node.state).to.equal(taskProxyState)
      CylcTree.removeTaskProxy(taskProxy.id, workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(1)
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)
      expect(workflow.tree.children[0].children[0].id).to.equal(familyProxy.id)
    })
    it('Should not remove task proxies if not added to the tree', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name,
          cyclePoint: cyclePoint.id
        },
        cyclePoint: cyclePoint.id,
        state: taskProxyState
      })
      CylcTree.removeTaskProxy(taskProxy.id, workflow, {})
      expect(workflow.tree.children[0].children.length).to.equal(1)
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)
      expect(workflow.tree.children[0].children[0].id).to.equal(familyProxy.id)
    })
  })
  // jobs
  describe('Jobs', () => {
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    let taskProxy
    beforeEach(() => {
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|${CylcTree.FAMILY_ROOT}`,
        name: CylcTree.FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      CylcTree.addFamilyProxy(rootFamilyProxy, workflow, {})
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      CylcTree.addFamilyProxy(familyProxy, workflow, {})
      taskProxy = createTaskProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`,
        firstParent: {
          id: familyProxy.id
        },
        task: {
          meanElapsedTime: 3.0
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
    })
    it('Should add jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const fmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const startedDate = new Date()
      const startedTime = fmt.format(startedDate)
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.FAILED.name,
        startedTime
      })
      const sandbox = sinon.createSandbox()
      sandbox.stub(Date, 'now').returns(startedDate.getTime() + 15000)
      CylcTree.addJob(job, workflow, {})
      sandbox.restore()
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
    })
    it('Should not add jobs twice', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addJob(job, workflow, {})
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      expect(task.children.length).to.equal(1)
    })
    it('Should update jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const state = TaskState.RUNNING.name
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: state
      })
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.node.state).to.equal(state)
      job.node.state = TaskState.WAITING.name
      CylcTree.updateJob(job, workflow, {})
      expect(task.children[0].node.state).equal(TaskState.WAITING.name)
    })
    it('Should not update a job if it is not in the tree', () => {
      const jobId = `${taskProxy.id}|1`
      const state = TaskState.RUNNING.name
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: state
      })
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.children.length).equal(0)
      CylcTree.updateJob(job, workflow, {})
      expect(task.children.length).equal(0)
    })
    it('Should remove jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      CylcTree.removeJob(job.id, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].children.length).to.equal(0)
    })
    it('Should not remove invalid jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      CylcTree.removeJob(null, workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].children.length).to.equal(1)
    })
    it('Should not remove if job is not in the tree', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      CylcTree.removeJob('-1', workflow, {})
      expect(workflow.tree.children[0].children[0].children[0].children.length).to.equal(1)
    })
    it('Should display most recent jobs at the top', () => {
      CylcTree.addJob(createJobNode({
        id: `${taskProxy.id}|2`,
        name: '2',
        state: TaskState.FAILED.name,
        submitNum: 2,
        firstParent: {
          id: taskProxy.id
        }
      }), workflow, {})
      CylcTree.addJob(createJobNode({
        id: `${taskProxy.id}|3`,
        name: '3',
        state: TaskState.SUCCEEDED.name,
        submitNum: 3,
        firstParent: {
          id: taskProxy.id
        }
      }), workflow, {})
      CylcTree.addJob(createJobNode({
        id: `${taskProxy.id}|1`,
        name: '1',
        state: TaskState.SUCCEEDED.name,
        submitNum: 1,
        firstParent: {
          id: taskProxy.id
        }
      }), workflow, {})

      const expectedJobs = ['3', '2', '1']
      const jobsCreated = workflow.tree
        .children[0] // cycle points
        .children[0] // family proxies
        .children[0] // task proxies
        .children // jobs
      expectedJobs.forEach((expected, index) => {
        expect(jobsCreated[index].node.name).to.equal(expected)
      })
    })
  })
  describe('Recursive delete nodes', () => {
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    let taskProxy
    beforeEach(() => {
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.id}|${CylcTree.FAMILY_ROOT}`,
        name: CylcTree.FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      CylcTree.addFamilyProxy(rootFamilyProxy, workflow, {})
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}||FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      CylcTree.addFamilyProxy(familyProxy, workflow, {})
      taskProxy = createTaskProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addTaskProxy(taskProxy, workflow, {})
    })
    it('Should recursively delete children nodes', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      CylcTree.addJob(job, workflow, {})
      const cyclepoint = workflow.tree.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      CylcTree.removeCyclePoint(cyclePoint.id, workflow, {})
      expect(workflow.tree.children.length).to.equal(0)
    })
  })
  describe('Tally cycle point states', () => {
    // NOTE: we are using two cycle points with two families each for now, but we can
    // add more later. In this case, we are also using RUNNING and WAITING,
    // as these two influence the state based on whether the isStopped is true or
    // false, i.e. in one case RUNNING will come first, in the other WAITING.
    let cyclePoint1
    let cyclePoint2
    beforeEach(() => {
      cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint1, workflow, {})
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|FAM1`,
        name: 'FAM1',
        state: TaskState.RUNNING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        },
        cyclePoint: cyclePoint1.id
      }), workflow, {})
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|FAM2`,
        name: 'FAM2',
        state: TaskState.WAITING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        },
        cyclePoint: cyclePoint1.id
      }), workflow, {})
      cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      CylcTree.addCyclePoint(cyclePoint2, workflow, {})
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|FAM1`,
        name: 'FAM1',
        state: TaskState.WAITING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        },
        cyclePoint: cyclePoint2.id
      }), workflow, {})
      CylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|FAM2`,
        name: 'FAM2',
        state: TaskState.RUNNING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${CylcTree.FAMILY_ROOT}`,
          name: CylcTree.FAMILY_ROOT
        },
        cyclePoint: cyclePoint2.id
      }), workflow, {})
    })
    it('Should tally the cycle point states if stopped', () => {
      expect(workflow.tree.children.length).to.equal(2)
      expect(workflow.tree.children[0].state).to.equal(undefined)
      expect(workflow.tree.children[1].state).to.equal(undefined)
      CylcTree.tallyCyclePointStates(workflow)
      expect(workflow.tree.children[0].node.state).to.equal(TaskState.RUNNING.name)
      expect(workflow.tree.children[1].node.state).to.equal(TaskState.RUNNING.name)
    })
  })
})
