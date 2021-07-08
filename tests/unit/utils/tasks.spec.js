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
import TaskState from '@/model/TaskState.model'
import { extractGroupState, taskStartTime, taskEstimatedDuration, latestJob } from '@/utils/tasks'

describe('tasks', () => {
  describe('extractGroupState', () => {
    it('should return the correct state for the node groups when not stopped', () => {
      [
        [
          TaskState.FAILED.name, // expected
          [TaskState.WAITING, TaskState.FAILED].map((state) => state.name)], // childStates
        [
          TaskState.WAITING.name,
          [TaskState.WAITING].map((state) => state.name)],
        [
          TaskState.RUNNING.name,
          [TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name)]
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], false)
        expect(groupState).to.equal(val[0])
      })
    })
    it('should return the correct state for the node groups when stopped', () => {
      [
        [
          TaskState.RUNNING.name, // expected
          [TaskState.WAITING, TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name)], // childStates
        [
          TaskState.SUCCEEDED.name,
          [TaskState.SUCCEEDED].map((state) => state.name)],
        [
          TaskState.RUNNING.name,
          [TaskState.SUBMITTED, TaskState.RUNNING, TaskState.EXPIRED].map((state) => state.name)]
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], true)
        expect(groupState).to.equal(val[0])
      })
    })
    it('should return empty when no states provided', () => {
      expect(extractGroupState([])).to.equal('')
    })
  })
  describe('taskStartTime', () => {
    it('should return the correct value for taskStatTime', () => {
      const tests = [
        {
          taskProxy: null,
          job: null,
          expected: null
        },
        {
          taskProxy: {},
          job: null,
          expected: null
        },
        {
          taskProxy: {
            state: TaskState.WAITING.name
          },
          job: {},
          expected: null
        },
        {
          taskProxy: {
            state: TaskState.RUNNING.name
          },
          job: {
            startedTime: 1
          },
          expected: 1
        }
      ]
      tests.forEach(test => {
        const result = taskStartTime(test.taskProxy, test.job)
        expect(result).to.equal(test.expected)
      })
    })
  })
  describe('taskEstimatedDuration', () => {
    it('should return the correct value for taskEstimatedDuration', () => {
      const tests = [
        {
          taskProxy: null,
          expected: null
        },
        {
          taskProxy: {},
          expected: null
        },
        {
          taskProxy: {
            task: {}
          },
          expected: null
        },
        {
          taskProxy: {
            task: {
              meanElapsedTime: 1
            }
          },
          expected: 1
        }
      ]
      tests.forEach(test => {
        const result = taskEstimatedDuration(test.taskProxy)
        expect(result).to.equal(test.expected)
      })
    })
  })
  describe('latestJob', () => {
    it('should return the correct value for latestJob', () => {
      const tests = [
        {
          taskProxy: null,
          expected: null
        },
        {
          taskProxy: {},
          expected: null
        },
        {
          taskProxy: {
            children: []
          },
          expected: null
        },
        {
          taskProxy: {
            children: [
              1
            ]
          },
          expected: 1
        }
      ]
      tests.forEach(test => {
        expect(latestJob(test.taskProxy)).to.equal(test.expected)
      })
    })
  })
})
