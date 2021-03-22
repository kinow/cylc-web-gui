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

/* eslint-disable */
const checkpoint = {
    "workflows": [
        {
            "id": "user|one",
            "name": "one",
            "status": "running",
            "owner": "user",
            "host": "user-VirtualBox",
            "port": 43099,
            "stateTotals": {
                "waiting": 1,
                "expired": 1,
                "preparing": 0,
                "submit-failed": 0,
                "submitted": 1,
                "running": 0,
                "failed": 2,
                "succeeded": 0
            },
            "cyclePoints": [
                {
                    "id": "user|one|20000102T0000Z|root",
                    "cyclePoint": "20000102T0000Z"
                },
                {
                    "id": "user|one|20000101T0000Z|root",
                    "cyclePoint": "20000101T0000Z"
                }
            ],
            "taskProxies": [
                {
                    "id": "user|one|20000102T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "submitted",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    },
                    "task": {
                        "meanElapsedTime": 2.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|checkpoint|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|checkpoint"
                            },
                            "jobRunnerName": "background",
                            "jobId": "21145",
                            "host": "localhost",
                            "startedTime": "",
                            "submittedTime": "2021-03-22T02:35:24Z",
                            "finishedTime": "",
                            "state": "submitted",
                            "submitNum": 1,
                            "taskProxy": {
                                "outputs": [
                                    {
                                        "label": "submitted",
                                        "message": "submitted"
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|failed",
                    "name": "failed",
                    "state": "failed",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|failed|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|failed"
                            },
                            "jobRunnerName": "background",
                            "jobId": "21081",
                            "host": "localhost",
                            "startedTime": "2021-03-22T02:35:20Z",
                            "submittedTime": "2021-03-22T02:35:19Z",
                            "finishedTime": "2021-03-22T02:35:21Z",
                            "state": "failed",
                            "submitNum": 1,
                            "taskProxy": {
                                "outputs": [
                                    {
                                        "label": "failed",
                                        "message": "failed"
                                    },
                                    {
                                        "label": "started",
                                        "message": "started"
                                    },
                                    {
                                        "label": "submitted",
                                        "message": "submitted"
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "expired",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "expired"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000102T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "expired",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000102T0000Z|waiting",
                    "name": "waiting",
                    "state": "waiting",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000101T0000Z|waiting",
                    "name": "waiting",
                    "state": "expired",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "expired"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": []
                }
            ],
            "familyProxies": [
                {
                    "id": "user|one|20000102T0000Z|BAD",
                    "name": "BAD",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "submitted",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "submitted",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    }
                }
            ]
        }
    ]
}
export { checkpoint }
