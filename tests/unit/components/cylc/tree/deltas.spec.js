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

import { expect } from 'chai'
import { applyDeltas } from '@/components/cylc/tree/deltas'
import CylcTree, { FAMILY_ROOT } from '@/components/cylc/tree/tree'
import {
  createCyclePointNode, createFamilyProxyNode,
  createWorkflowNode
} from '@/components/cylc/tree'
import sinon from 'sinon'
import TaskState from '@/model/TaskState.model'

/**
 * Tests for the tree deltas module.
 */
describe('Deltas', () => {
  const WORKFLOW_ID = 'cylc|workflow'
  it('Should skip if no deltas provided', () => {
    expect(applyDeltas, null, null).to.throw(Error)
  })
  it('Should clear the tree if shutdown is found in the deltas', () => {
    const cylcTree = new CylcTree(createWorkflowNode({
      id: WORKFLOW_ID
    }))
    expect(cylcTree.lookup.size).to.equal(1)
    applyDeltas({
      shutdown: true
    }, cylcTree)
    expect(cylcTree.lookup.size).to.equal(0)
  })
  it('Should not tally the cycle point states unless deltas were provided', () => {
    // NOTE: tree is not empty, so we don't apply the initial burst of data to the tree!
    const cylcTree = new CylcTree(createWorkflowNode({
      id: WORKFLOW_ID
    }))
    const fakeTree = sinon.spy(cylcTree)
    applyDeltas({
      id: WORKFLOW_ID
    }, fakeTree)
    expect(fakeTree.tallyCyclePointStates.called).to.equal(false)
  })
  it('Should warn if the initial data burst has invalid data', () => {
    const sandbox = sinon.createSandbox()
    sandbox.stub(console, 'error')
    const cylcTree = new CylcTree()
    applyDeltas({}, cylcTree)
    expect(console.error.calledOnce).to.equal(true)
    sandbox.restore()
  })
  describe('Initial data burst', () => {
    let cylcTree
    beforeEach(() => {
      cylcTree = new CylcTree()
    })
    it('Should create the CylcTree structure using the initial data burst', () => {
      const deltasWithInitialDataBurst = {
        id: WORKFLOW_ID,
        shutdown: false,
        added: {
          workflow: {
            id: WORKFLOW_ID,
            cyclePoints: [],
            familyProxies: [],
            taskProxies: []
          }
        }
      }
      const fakeTree = sinon.spy(cylcTree)
      applyDeltas(deltasWithInitialDataBurst, fakeTree)
      expect(cylcTree.root.id).to.equal(WORKFLOW_ID)
      expect(fakeTree.tallyCyclePointStates.called).to.equal(true)
    })
  })
  describe('Added', () => {
    let cylcTree
    beforeEach(() => {
      cylcTree = new CylcTree(createWorkflowNode({
        id: WORKFLOW_ID
      }))
    })
    it('Should apply added deltas', () => {
      const cyclePointId = `${WORKFLOW_ID}|1`
      const deltasAdded = {
        id: WORKFLOW_ID,
        shutdown: false,
        added: {
          cyclePoints: [
            {
              cyclePoint: cyclePointId
            }
          ]
        }
      }
      const fakeTree = sinon.spy(cylcTree)
      applyDeltas(deltasAdded, fakeTree)
      expect(cylcTree.root.children[0].id).to.equal(cyclePointId)
      expect(fakeTree.tallyCyclePointStates.called).to.equal(true)
    })
  })
  describe('Updated', () => {
    let cylcTree
    let cyclePoint
    let familyProxy
    beforeEach(() => {
      cylcTree = new CylcTree(createWorkflowNode({
        id: WORKFLOW_ID
      }))
      cyclePoint = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.id}|FAM`,
        state: TaskState.RUNNING.name.toLowerCase(),
        cyclePoint: cyclePoint.id,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint.id}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
    })
    it('Should apply updated deltas', () => {
      const deltasUpdated = {
        id: WORKFLOW_ID,
        shutdown: false,
        updated: {
          familyProxies: [
            {
              id: familyProxy.id,
              state: TaskState.FAILED.name.toLowerCase()
            }
          ]
        }
      }
      const fakeTree = sinon.spy(cylcTree)
      applyDeltas(deltasUpdated, fakeTree)
      expect(cylcTree.root.children[0].children[0].node.state).to.equal(TaskState.FAILED.name.toLowerCase())
      expect(fakeTree.tallyCyclePointStates.called).to.equal(true)
    })
  })
  describe('Pruned', () => {
    let cylcTree
    let cyclePoint
    let familyProxy
    beforeEach(() => {
      cylcTree = new CylcTree(createWorkflowNode({
        id: WORKFLOW_ID
      }))
      cyclePoint = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.id}|FAM`,
        state: TaskState.RUNNING.name.toLowerCase(),
        cyclePoint: cyclePoint.id,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint.id}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
    })
    it('Should apply updated deltas', () => {
      const fakeTree = sinon.spy(cylcTree)
      const deltasPruningFamily = {
        id: WORKFLOW_ID,
        shutdown: false,
        pruned: {
          familyProxies: [
            familyProxy.id
          ]
        }
      }
      applyDeltas(deltasPruningFamily, fakeTree)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(fakeTree.tallyCyclePointStates.called).to.equal(true)

      // when you prune the root family, the cycle point must be removed too
      const deltasPruningCyclePoint = {
        id: WORKFLOW_ID,
        shutdown: false,
        pruned: {
          familyProxies: [
            familyProxy.node.firstParent.id
          ]
        }
      }
      applyDeltas(deltasPruningCyclePoint, fakeTree)
    })
  })
})