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
import Vuex from 'vuex'
import { print } from 'graphql/language'
import gql from 'graphql-tag'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import Subscription from '@/model/Subscription.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import storeOptions from '@/store/options'
import WorkflowService from '@/services/workflow.service'
import * as graphqlModule from '@/graphql/index'
import ViewState from '@/model/ViewState.model'

const sandbox = sinon.createSandbox()

Vue.use(Vuex)

describe('WorkflowService', () => {
  const store = new Vuex.Store(storeOptions)
  /**
   * @type {String}
   */
  const url = '/graphql'
  /**
   * @type {ApolloClient}
   */
  let apolloClient
  /**
   * @type {SubscriptionClient|null}
   */
  let subscriptionClient
  /**
   * @type {WorkflowService}
   */
  let service
  /**
   * @type {SubscriptionQuery}
   */
  let subscriptionQuery
  /**
   * @type {Vue}
   */
  let view
  /**
   * @type {Subscription}
   */
  let subscription
  beforeEach(() => {
    sandbox.stub(console, 'debug')
    apolloClient = sandbox.spy({
      query: () => {},
      subscribe: (options) => {
        return {
          subscribe: (subscriptionOptions) => {}
        }
      }
    })
    subscriptionClient = null
    sandbox.stub(graphqlModule, 'createApolloClient').returns(apolloClient)
    // TODO: really load some mutations
    sandbox.stub(WorkflowService.prototype, 'loadMutations').returns({})
    service = new WorkflowService(url, subscriptionClient)
    // subscription query
    subscriptionQuery = new SubscriptionQuery(
      gql`
        query {
          workflows {
            id
          }
        }`,
      {
        workflowId: 'cylc|test'
      },
      'root',
      [],
      [])
    // Subscription
    subscription = new Subscription(subscriptionQuery, true)
    service.subscriptions[subscriptionQuery.name] = subscription
    // Add one View as subscriber to Subscription
    /**
     * @type {Vue}
     */
    view = {
      _uid: 'view',
      query: subscriptionQuery,
      viewState: ViewState.NO_STATE,
      setAlert: () => {}
    }
    service.subscribe(view)
  })
  afterEach(() => {
    sandbox.restore()
  })
  describe('constructor', () => {
    it('should create an object correctly', () => {
      expect(service.apolloClient).to.not.equal(null)
    })
  })
  describe('getOrCreateSubscription', () => {
    it('should return existing subscriptions', () => {
      const existingSubscription = service.getOrCreateSubscription(view)
      expect(existingSubscription).to.deep.equal(subscription)
    })
    it('should create new subscriptions and add to local cache', () => {
      delete service.subscriptions[view.query.name]
      expect(Object.keys(service.subscriptions).length).to.equal(0)
      const newSubscription = service.getOrCreateSubscription(view)
      expect(Object.keys(service.subscriptions).length).to.equal(1)
      expect(service.subscriptions[view.query.name]).to.deep.equal(newSubscription)
    })
  })
  describe('startSubscriptions', () => {
    it('should start pending subscriptions', () => {
      const spy = sandbox.spy(service, 'startSubscription')
      service.startSubscriptions()
      expect(spy.calledOnce).to.equal(true)
    })
  })
  describe('startSubscription', () => {
    it('should stop the subscription if already started, before starting again', () => {
      const observable = { unsubscribe: () => {} }
      const spy = sandbox.spy(observable, 'unsubscribe')
      subscription.observable = observable
      service.startSubscription(subscription)
      expect(spy.calledOnce).to.equal(true)
    })
    it('should call the subscription callback', () => {
      const workflowName = 'test'
      const myStartDeltasSubscription = (query, variables, subscriptionOptions) => {
        subscriptionOptions.next({ data: workflowName })
      }
      const startDeltasSubscriptionStub = sandbox.stub(
        service,
        'startDeltasSubscription')
      startDeltasSubscriptionStub.callsFake(myStartDeltasSubscription)
      // we need to add a callback to be called...
      subscriptionQuery.actionNames.push('workflows/setWorkflowName')
      service.startSubscription(subscription)
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
    describe('ViewState', () => {
      it('should set the view state to COMPLETE when it successfully starts a subscription', () => {
        expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.NO_STATE)
        service.startSubscription(subscription)
        expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.COMPLETE)
      })
      it('should set the view state to ERROR if it fails to start the deltas subscription', () => {
        expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.NO_STATE)
        const stub = sandbox.stub(service, 'startDeltasSubscription')
        stub.throws()
        service.startSubscription(subscription)
        expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.ERROR)
      })
      it('should set the view state to COMPLETE when it successfully starts a subscription', () => {
        expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.NO_STATE)
        const myStartDeltasSubscription = (query, variables, subscriptionOptions) => {
          subscriptionOptions.error('test')
        }
        const startDeltasSubscriptionStub = sandbox.stub(
          service,
          'startDeltasSubscription')
        startDeltasSubscriptionStub.callsFake(myStartDeltasSubscription)
        const spy = sandbox.spy(subscription, 'handleViewState')
        service.startSubscription(subscription)
        // The error happens, but immediately, so the view state is set to COMPLETE. In
        // real-life, there will be a few milliseconds delay between the JS creation of
        // the object, and the first WebSockets message with an error, so we will use
        // a spy here instead.
        // expect(subscription.subscribers[view._uid].viewState).to.equal(ViewState.ERROR)
        // Called first time to set as LOADING. Then as ERROR. Finally COMPLETE.
        expect(spy.calledThrice).to.equal(true)
      })
    })
  })
  describe('startDeltasSubscription', () => {
    // the bulk of tests for startDeltasSubscription are e2e tests, here we only test
    // a few simple scenarios
    it('should throw an error if no query provided', () => {
      expect(() => { service.startDeltasSubscription(null, null, null) }).to.throw()
    })
  })
  describe('merge', () => {
    it('should merge two queries correctly', () => {
      const query1 = new SubscriptionQuery(
        gql`
        query {
          workflows {
            id
          }
        }`,
        subscriptionQuery.variables,
        'root',
        [],
        [])
      /**
       * @type {Vue}
       */
      const view1 = {
        _uid: 'view1',
        query: query1
      }
      service.subscribe(view1)
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(query1.query)
      const initialQuery = print(service.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)

      const query2 = new SubscriptionQuery(
        gql`
        query {
        workflows {
          name
        }
      }`,
        subscriptionQuery.variables,
        'root',
        [],
        [])
      /**
       * @type {Vue}
       */
      const view2 = {
        _uid: 'view2',
        query: query2
      }
      service.subscribe(view2)
      // now the queries must have been merged
      const finalQuery = print(service.subscriptions.root.query.query)
      expect(finalQuery).to.contain('name')
    })
  })
  describe('recompute', () => {
    it('should not change query if no views were added', () => {
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(subscriptionQuery.query)
      const initialQuery = print(service.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)
      // calling recompute with the same query shouldn't change the original query
      service.recompute(service.subscriptions.root)
      const finalQuery = print(service.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(finalQuery)
    })
    it('should throw an error if there are no subscribers', () => {
      delete subscription.subscribers[view._uid]
      expect(() => { service.recompute(subscription) }).to.throw()
    })
    it('should throw an error if the subscribers have different variables', () => {
      const anotherQuery = new SubscriptionQuery(
        gql`query { workflow { id } }`,
        {
          invalidVariable: true
        },
        'test',
        [],
        [])
      subscription.subscribers[anotherQuery.name] = {
        _uid: 'view',
        query: anotherQuery,
        viewState: ViewState.NO_STATE,
        setAlert: () => {}
      }
      expect(() => { service.recompute(subscription) }).to.throw()
    })
  })
  describe('unsubscribe', () => {
    it('should warn about queries that do not exist', () => {
      const stub = sandbox.stub(console, 'warn')
      service.unsubscribe({
        query: {
          name: 'missing'
        }
      })
      expect(stub.calledOnce).to.equal(true)
    })
    it('should call unsubscribe if last subscriber is unsubscribed', () => {
      const stub = sandbox.stub(service, 'stopSubscription')
      service.unsubscribe(view)
      expect(stub.calledOnce).to.equal(true)
    })
    it('should NOT call unsubscribe if there are still subscribers left', () => {
      const anotherView = {
        _uid: 'test',
        query: subscriptionQuery
      }
      service.subscribe(anotherView)
      const stub = sandbox.stub(service, 'stopSubscription')
      service.unsubscribe(view)
      expect(stub.calledOnce).to.equal(false)
    })
  })
  describe('stopSubscription', () => {
    it('should remove the subscription', () => {
      subscription.observable = {
        unsubscribe: () => {}
      }
      expect(service.subscriptions[subscription.query.name]).to.not.equal(null)
      service.stopSubscription(subscription)
      expect(service.subscriptions[subscription.query.name]).to.equal(undefined)
    })
    it('should call the tear down callbacks', () => {
      subscription.observable = {
        unsubscribe: () => {}
      }
      const workflows = [1, 2, 3]
      store.commit('workflows/SET_WORKFLOWS', workflows)
      subscription.tearDownActionNames.push('workflows/clearWorkflows')
      expect(store.state.workflows.workflows).to.deep.equal(workflows)
      service.stopSubscription(subscription)
      expect(store.state.workflows.workflows).to.deep.equal([])
    })
  })
})
