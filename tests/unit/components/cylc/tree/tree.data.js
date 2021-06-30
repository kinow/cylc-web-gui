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

/*
 * Test data for Tree component tests.
 */

const simpleWorkflowTree4Nodes = [
  {
    id: 'user/workflow1',
    type: 'workflow',
    node: {
      __typename: 'Workflow',
      name: 'workflow1',
      state: 'running'
    },
    children: [
      {
        id: '20100101T0000Z',
        type: 'cyclepoint',
        node: {
          __typename: 'CyclePoint',
          name: '20100101T0000Z',
          state: 'failed'
        },
        children: [
          {
            id: 'user/workflow1/20100101T0000Z/foo',
            type: 'task-proxy',
            node: {
              __typename: 'TaskProxy',
              name: 'foo',
              state: 'failed'
            },
            expanded: false,
            children: [
              {
                id: 'user/workflow1/20100101T0000Z/foo/01',
                type: 'job',
                node: {
                  __typename: 'Job',
                  name: '1',
                  startedTime: '2019-08-19T22:44:42Z',
                  state: 'failed',
                  submitNum: 1,
                  customOutputs: [
                    {
                      label: 'out1',
                      message: 'Aliquam a lectus euismod, vehicula leo vel, ultricies odio.'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

const sampleWorkflow1 = {
  workflow: {
    id: 'cylc|one',
    __typename: 'Workflow',
    name: 'one',
    status: 'running',
    owner: 'cylc',
    host: 'ranma',
    port: 43066
  },
  cyclePoints: [
    {
      __typename: 'FamilyProxy',
      id: 'cylc|one|20000101T0000Z|root',
      cyclePoint: '20000101T0000Z'
    },
    {
      __typename: 'FamilyProxy',
      id: 'cylc|one|20000102T0000Z|root',
      cyclePoint: '20000102T0000Z'
    }
  ],
  familyProxies: [
    {
      id: 'cylc|one|20000101T0000Z|SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        name: 'root',
        cyclePoint: '20000102T0000Z',
        state: 'failed'
      }
    }
  ],
  taskProxies: [
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded',
      __typename: 'TaskProxy',
      name: 'eventually_succeeded',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|sleepy',
      name: 'sleepy',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|succeeded',
      name: 'succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|retrying',
      name: 'retrying',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|checkpoint',
      name: 'checkpoint',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|failed',
      name: 'failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|waiting',
      name: 'waiting',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|sleepy',
      name: 'sleepy',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|succeeded',
      name: 'succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|failed',
      name: 'failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|waiting',
      name: 'waiting',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint',
      name: 'checkpoint',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint2',
      name: 'checkpoint2',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'checkpoint2'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded',
      name: 'eventually_succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|retrying',
      name: 'retrying',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      }
    }
  ],
  jobs: [
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded|4',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16134',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:50Z',
      submittedTime: '2019-10-23T07:02:50Z',
      finishedTime: '2019-10-23T07:02:51Z',
      state: 'succeeded',
      submitNum: 4,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          },
          {
            label: 'out1',
            message: 'Aliquam a lectus euismod, vehicula leo vel, ultricies odio.'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded|3',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16094',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:46Z',
      submittedTime: '2019-10-23T07:02:46Z',
      finishedTime: '2019-10-23T07:02:47Z',
      state: 'failed',
      submitNum: 3,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded|2',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16056',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:42Z',
      submittedTime: '2019-10-23T07:02:42Z',
      finishedTime: '2019-10-23T07:02:43Z',
      state: 'failed',
      submitNum: 2,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15947',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|sleepy|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|sleepy',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16331',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:05Z',
      submittedTime: '2019-10-23T07:03:05Z',
      finishedTime: '2019-10-23T07:03:06Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|succeeded|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15951',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|retrying|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|retrying',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15948',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|checkpoint|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|checkpoint',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16213',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:56Z',
      submittedTime: '2019-10-23T07:02:56Z',
      finishedTime: '2019-10-23T07:03:03Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|failed|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|failed',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16173',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:53Z',
      submittedTime: '2019-10-23T07:02:53Z',
      finishedTime: '2019-10-23T07:02:54Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|waiting|1',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|waiting',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16332',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:05Z',
      submittedTime: '2019-10-23T07:03:05Z',
      finishedTime: '2019-10-23T07:03:06Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|succeeded|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16424',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|failed|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|failed',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16646',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:25Z',
      submittedTime: '2019-10-23T07:03:24Z',
      finishedTime: '2019-10-23T07:03:25Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|checkpoint',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16684',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:28Z',
      submittedTime: '2019-10-23T07:03:27Z',
      finishedTime: '',
      state: 'running',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint2|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|checkpoint2',
        __typename: 'TaskProxy'
      },
      __typename: 'TaskProxy',
      jobRunnerName: 'background',
      jobId: '16688',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:28Z',
      submittedTime: '2019-10-23T07:03:27Z',
      finishedTime: '',
      state: 'running',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded|4',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16607',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:22Z',
      submittedTime: '2019-10-23T07:03:21Z',
      finishedTime: '2019-10-23T07:03:22Z',
      state: 'succeeded',
      submitNum: 4,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded|3',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16569',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:18Z',
      submittedTime: '2019-10-23T07:03:17Z',
      finishedTime: '2019-10-23T07:03:18Z',
      state: 'failed',
      submitNum: 3,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded|2',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16529',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:13Z',
      submittedTime: '2019-10-23T07:03:13Z',
      finishedTime: '2019-10-23T07:03:14Z',
      state: 'failed',
      submitNum: 2,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16420',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|retrying|1',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|retrying',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16421',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    }
  ]
}

const simpleWorkflowNode = simpleWorkflowTree4Nodes[0]
const simpleCyclepointNode = simpleWorkflowTree4Nodes[0].children[0]
const simpleTaskNode = simpleCyclepointNode.children[0]
const simpleJobNode = simpleTaskNode.children[0]

export {
  simpleWorkflowTree4Nodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode,
  simpleJobNode,
  sampleWorkflow1
}
