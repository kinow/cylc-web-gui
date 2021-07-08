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
import TaskState from '@/model/TaskState.model'
import JobState from '@/model/JobState.model'

const BASE_ID = 'cylc|workflow|1'

const simpleTableTasks = [
  {
    id: `${BASE_ID}|taskA`,
    node: {
      id: `${BASE_ID}|taskA`,
      state: TaskState.RUNNING.name,
      name: 'taskA',
      meanElapsedTime: 2000
    },
    latestJob: {
      platform: 'localhost',
      jobRunnerName: 'background',
      jobId: '1',
      submittedTime: new Date(),
      startedTime: new Date(),
      finishedTime: null,
      state: JobState.RUNNING.name
    }
  },
  {
    id: `${BASE_ID}|taskB`,
    node: {
      id: `${BASE_ID}|taskB`,
      state: TaskState.WAITING.name,
      name: 'taskB'
    },
    latestJob: {}
  },
  {
    id: `${BASE_ID}|taskC`,
    node: {
      id: `${BASE_ID}|taskC`,
      state: TaskState.SUBMITTED.name,
      name: 'taskC'
    },
    latestJob: {}
  }
]

export {
  simpleTableTasks
}
