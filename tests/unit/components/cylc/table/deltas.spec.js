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
import sinon from 'sinon'
import Vue from 'vue'
import JobState from '@/model/JobState.model'
import TaskState from '@/model/TaskState.model'
import WorkflowState from '@/model/WorkflowState.model'
import applyWorkflowDeltas from '@/components/cylc/workflow/deltas'
import applyTreeDeltas from '@/components/cylc/table/deltas'

const sandbox = sinon.createSandbox()

/**
 * Tests for the tree deltas module.
 */
describe('Deltas', () => {
  let table
  let lookup
  beforeEach(() => {
    table = {}
    lookup = {}
    sandbox.stub(console, 'log')
  })
  afterEach(() => {
    sandbox.restore()
  })
  const expectNoErrors = (result) => {
    expect(result.errors.length).to.equal(0, result.errors.join('. '))
  }
  const WORKFLOW_ID = 'cylc|workflow'
  it('Should clear the table if the workflow started', () => {
    // create 5 tasks
    [...Array(5).keys()].forEach(i => {
      table[i] = {
        id: i,
        node: {
          id: i
        },
        latestJob: null
      }
    })
    // The table now should have 5 entries.
    expect(Object.keys(table).length).to.equal(5)
    // Then we send a delta with the workflow added, and with the state
    // of running.
    const deltas = {
      deltas: {
        id: WORKFLOW_ID,
        added: {
          workflow: {
            id: WORKFLOW_ID,
            status: WorkflowState.RUNNING.name
          },
          taskProxies: [
            {
              id: 10,
              state: TaskState.RUNNING.name
            }
          ]
        }
      }
    }
    applyWorkflowDeltas(deltas, lookup)
    const result = applyTreeDeltas(deltas, table, lookup)
    expectNoErrors(result)
    // The table will have been cleared, and the new task proxy added, so
    // the table now will have only one entry (the task proxy).
    expect(Object.keys(table).length).to.equal(1)
  })
  describe('Added', () => {
    it('Should apply added deltas', () => {
      // create 5 tasks
      [...Array(5).keys()].forEach(i => {
        table[i] = {
          id: i,
          node: {
            id: i
          },
          latestJob: null
        }
      })
      // The table now should have 5 entries.
      expect(Object.keys(table).length).to.equal(5)
      // Then we send a delta with the workflow added, and with the state
      // of running.
      const deltas = {
        deltas: {
          id: WORKFLOW_ID,
          added: {
            taskProxies: [
              {
                id: 10,
                state: TaskState.RUNNING.name
              },
              {
                id: 11,
                state: TaskState.WAITING.name
              }
            ],
            jobs: [
              {
                id: 100,
                submitNum: 1,
                firstParent: {
                  id: 11
                }
              }
            ]
          }
        }
      }
      applyWorkflowDeltas(deltas, lookup)
      const result = applyTreeDeltas(deltas, table, lookup)
      expectNoErrors(result)
      // The table will have been cleared, and the new task proxy added, so
      // the table now will have only one entry (the task proxy).
      expect(Object.keys(table).length).to.equal(7)
      expect(table[11].latestJob.id).to.equal(100)
    })
    it('Should collect errors', () => {
      // create 5 tasks
      [...Array(5).keys()].forEach(i => {
        table[i] = {
          id: i,
          node: {
            id: i
          },
          latestJob: null
        }
      })
      // The table now should have 5 entries.
      expect(Object.keys(table).length).to.equal(5)
      // Then we send a delta with the workflow added, and with the state
      // of running.
      const deltas = {
        deltas: {
          id: WORKFLOW_ID,
          added: {
            taskProxies: [
              {
                id: 10,
                state: TaskState.RUNNING.name
              },
              {
                id: 11,
                state: TaskState.WAITING.name
              }
            ],
            jobs: [
              {
                id: 100,
                submitNum: 1,
                firstParent: {
                  id: 11
                }
              }
            ]
          }
        }
      }
      applyWorkflowDeltas(deltas, lookup)
      const stub = sandbox.stub(Vue, 'set')
      stub.callsFake(() => {
        throw new Error('test')
      })
      const result = applyTreeDeltas(deltas, table, lookup)
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][1].message).to.contain('test')
    })
  })
  describe('Updated', () => {
    beforeEach(() => {
      // create 5 tasks
      [...Array(5).keys()].forEach(i => {
        table[i] = {
          id: i,
          node: {
            id: i,
            state: TaskState.RUNNING.name
          },
          latestJob: {
            id: i + 10,
            state: JobState.RUNNING.name,
            submitNum: 1,
            firstParent: {
              id: i
            }
          }
        }
      })
    })
    afterEach(() => {
      Object.keys(table).forEach(i => {
        Vue.delete(table, i)
      })
    })
    it('Should apply updated deltas', () => {
      expect(table[1].node.state).to.equal(TaskState.RUNNING.name)
      expect(table[1].latestJob.state).to.equal(JobState.RUNNING.name)
      const deltas = {
        deltas: {
          id: WORKFLOW_ID,
          updated: {
            taskProxies: [
              {
                id: 1,
                state: TaskState.FAILED.name
              }
            ],
            jobs: [
              {
                id: 11,
                submitNum: 1,
                firstParent: {
                  id: 1
                },
                state: JobState.SUBMIT_FAILED.name
              }
            ]
          }
        }
      }
      applyWorkflowDeltas(deltas, lookup)
      const result = applyTreeDeltas(deltas, table, lookup)
      expectNoErrors(result)
      expect(table[1].node.state).to.equal(TaskState.FAILED.name)
      expect(table[1].latestJob.state).to.equal(JobState.SUBMIT_FAILED.name)
    })
    it('Should collect errors', () => {
      expect(table[1].node.state).to.equal(TaskState.RUNNING.name)
      expect(table[1].latestJob.state).to.equal(JobState.RUNNING.name)
      const deltas = {
        deltas: {
          id: WORKFLOW_ID,
          updated: {
            taskProxies: [
              {
                id: 1,
                state: TaskState.FAILED.name
              }
            ],
            jobs: [
              {
                id: 11,
                submitNum: 1,
                firstParent: {
                  id: 1
                },
                state: JobState.SUBMIT_FAILED.name
              }
            ]
          }
        }
      }
      applyWorkflowDeltas(deltas, lookup)
      const stub = sandbox.stub(Vue, 'set')
      stub.callsFake(() => {
        throw new Error('test')
      })
      const result = applyTreeDeltas(deltas, table, lookup)
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][1].message).to.contain('test')
    })
  })
  describe('Pruned', () => {
    beforeEach(() => {
      // create 5 tasks
      [...Array(5).keys()].forEach(i => {
        const taskProxy = {
          id: i,
          state: TaskState.RUNNING.name
        }
        const job = {
          id: i + 10,
          state: JobState.RUNNING.name,
          submitNum: 1,
          firstParent: {
            id: i
          }
        }
        lookup[taskProxy.id] = taskProxy
        lookup[job.id] = job
        table[i] = {
          id: i,
          node: taskProxy,
          latestJob: job
        }
      })
    })
    afterEach(() => {
      Object.keys(lookup).forEach(i => {
        Vue.delete(lookup, i)
      })
      Object.keys(table).forEach(i => {
        Vue.delete(table, i)
      })
    })
    it('Should apply pruned deltas', () => {
      expect(table[1]).to.not.equal(undefined)
      expect(table[2].latestJob).to.not.equal(undefined)
      const deltas = {
        deltas: {
          id: WORKFLOW_ID,
          pruned: {
            taskProxies: [
              1
            ],
            jobs: [
              12
            ]
          }
        }
      }
      applyWorkflowDeltas(deltas, lookup)
      const result = applyTreeDeltas(deltas, table, lookup)
      expectNoErrors(result)
      expect(table[1]).to.equal(undefined)
      expect(table[2].latestJob).to.deep.equal({})
    })
  })
})
