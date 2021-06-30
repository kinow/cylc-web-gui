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
import gql from 'graphql-tag'
import Subscription from '@/model/Subscription.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import ViewState from '@/model/ViewState.model'

describe('SubscriptionQuery model', () => {
  const query = gql`query { workflow { id } }`
  const variables = {
    workflowId: 'cylc|cylc'
  }
  const name = 'root'
  const actionNames = [
    'setUp'
  ]
  const tearDownActionNames = [
    'tearDown'
  ]
  let subscriptionQuery
  beforeEach(() => {
    sinon.stub(console, 'debug')
    subscriptionQuery = new SubscriptionQuery(query, variables, name, actionNames, tearDownActionNames)
  })
  afterEach(() => {
    sinon.restore()
  })
  describe('constructor', () => {
    it('should be created', () => {
      const debug = false
      const subscription = new Subscription(subscriptionQuery, debug)
      expect(subscription.query).to.equal(subscriptionQuery)
      expect(subscription.observable).to.equal(null)
      expect(Object.keys(subscription.subscribers).length).to.equal(0)
      expect(subscription.actionNames.length).to.equal(0)
      expect(subscription.tearDownActionNames.length).to.equal(0)
      expect(subscription.reload).to.equal(false)
      expect(subscription.debug).to.equal(debug)
    })
  })
  describe('handleView', () => {
    it('should set the subscribers viewStates', () => {
      const tests = [
        {
          viewState: ViewState.ERROR,
          debug: true,
          context: {
            message: 'test'
          }
        },
        {
          viewState: ViewState.NO_STATE,
          debug: true,
          context: {
            message: 'test'
          }
        },
        {
          viewState: ViewState.LOADING,
          debug: true,
          context: {
            message: 'test'
          }
        },
        {
          viewState: ViewState.COMPLETE,
          debug: true,
          context: {
            message: 'test'
          }
        }
      ]
      for (const test of tests) {
        const subscription = new Subscription(subscriptionQuery, test.debug)
        subscription.subscribers[1] = {
          viewState: null,
          setAlert: () => {}
        }
        subscription.handleViewState(test.viewState, test.context)
        Object.values(subscription.subscribers).forEach(subscriber => {
          expect(subscriber.viewState).to.equal(test.viewState)
        })
      }
    })
  })
})
