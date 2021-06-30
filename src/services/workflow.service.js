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

import isEqual from 'lodash/isEqual'
import union from 'lodash/union'
import ViewState from '@/model/ViewState.model'
import Subscription from '@/model/Subscription.model'
import {
  getIntrospectionQuery,
  getMutationArgsFromTokens,
  mutate,
  primaryMutations,
  processMutations,
  tokenise
} from '@/utils/aotf'
import store from '@/store/index'
import { createApolloClient } from '@/graphql/index'
/* eslint-disable no-unused-vars */
import { DocumentNode, print } from 'graphql'
import { SubscriptionClient } from 'subscriptions-transport-ws'
/* eslint-enable no-unused-vars */

class WorkflowService {
  /**
   * @constructor
   * @param {string} httpUrl
   * @param {SubscriptionClient|null} subscriptionClient
   */
  constructor (httpUrl, subscriptionClient) {
    this.debug = process.env.NODE_ENV !== 'production'

    this.subscriptionClient = subscriptionClient
    this.apolloClient = createApolloClient(httpUrl, subscriptionClient)

    /**
     * This is the mapping of Vue components/views subscriptions. Not necessarily
     * GraphQL subscriptions. A Vue components/views subscription results, ultimately,
     * in a GraphQL subscription. But you may have 10 Vue components/views subscriptions,
     * all using the same query. In this case, we end up with a single, merged, GraphQL
     * query, and a single Apollo Client GraphQL subscription.
     *
     * The Apollo Client GraphQL subscription can be accessed via the Subscription
     * attribute `.observable`, or via the `.subscriptionClient`.
     *
     * @type {Object.<String, Subscription>}
     */
    this.subscriptions = {}

    // mutations defaults
    this.mutations = null
    this.types = null
    this.associations = null
    this.primaryMutations = primaryMutations

    this.loadMutations()
  }

  // --- Mutations

  /**
   * Call a mutation on the given identifier.
   *
   * Will only work if no additional information (other than the identifier
   * itself) is required.
   *
   * Requires an absolute identifier (i.e. must include the workflow name).
   *
   * @param {String} mutationName
   * @param {String} id
   */
  mutate (mutationName, id) {
    const mutation = this.getMutation(mutationName)
    return mutate(
      mutation,
      getMutationArgsFromTokens(
        mutation,
        tokenise(id)
      ),
      this.apolloClient
    )
  }

  /**
   * Load mutations for internal use from GraphQL introspection.
   */
  loadMutations () {
    // TODO: this assumes all workflows use the same schema which is and
    //       isn't necessarily true, not quite sure, come back to this later.
    this.apolloClient.query({
      query: getIntrospectionQuery(),
      fetchPolicy: 'no-cache'
    }).then((response) => {
      this.mutations = response.data.__schema.mutationType.fields
      this.types = response.data.__schema.types
      processMutations(this.mutations, this.types)
    })
  }

  /**
   * Return a mutation by name.
   *
   * @param {String} mutationName
   */
  getMutation (mutationName) {
    return this.mutations.find(mutation => mutation.name === mutationName)
  }

  // --- GraphQL query subscriptions

  /**
   * @param {Vue} componentOrView
   * @returns {Subscription}
   */
  getOrCreateSubscription (componentOrView) {
    const queryName = componentOrView.query.name
    let subscription = this.subscriptions[queryName]
    if (!subscription) {
      subscription = this.subscriptions[queryName] = new Subscription(componentOrView.query)
    }
    return subscription
  }

  /**
   * @param {Vue} componentOrView
   */
  subscribe (componentOrView) {
    // First we retrieve the existing, or create a new subscription (and add to the pool).
    const subscription = this.getOrCreateSubscription(componentOrView)
    if (!subscription.subscribers[componentOrView._uid]) {
      // NOTE: make sure to remove it afterwards to avoid memory leaks!
      subscription.subscribers[componentOrView._uid] = componentOrView
      // Then we recompute the query, checking if variables match, and action name is set.
      this.recompute(subscription)
    }
    // Otherwise we are calling subscribe for a component or view already subscribed.
  }

  /**
   * Start any pending subscriptions.
   */
  startSubscriptions () {
    const pendingSubscriptions = Object.values(this.subscriptions)
      .filter(subscription => {
        return subscription.observable === null || subscription.reload
      })
    pendingSubscriptions.forEach(subscription => this.startSubscription(subscription))
  }

  /**
   * Start a Subscription for a view or component.
   *
   * @param {Subscription} subscription
   */
  startSubscription (subscription) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Starting subscription ${subscription.query.name}`, subscription)
    }
    subscription.handleViewState(ViewState.LOADING, null)

    // Stop if already running.
    if (subscription.observable !== null) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug(`Subscription for query [${subscription.query.name}] already running. Stopping it...`)
      }
      this.stopSubscription(subscription)
    }

    try {
      // Then start subscription.
      subscription.observable = this.startDeltasSubscription(
        subscription.query.query,
        subscription.query.variables,
        {
          next: function next (response) {
            subscription.actionNames.forEach(actionName => {
              store.dispatch(actionName, response.data).then(() => {})
            })
          },
          error: function error (err) {
            subscription.handleViewState(ViewState.ERROR, err)
          }
        }
      )
      this.subscriptions[subscription.query.name] = subscription
      // All done!
      subscription.handleViewState(ViewState.COMPLETE, null)
    } catch (e) {
      subscription.handleViewState(ViewState.ERROR, e)
    }
  }

  /**
   * Create and start a deltas GraphQL subscription. It will result in a JS
   * Observable being created to monitor the subscription. Apollo Client is
   * used here to create the observer and the subscription.
   *
   * @param query {DocumentNode} - an already parsed GraphQL query (i.e. not a `string`)
   * @param variables {{}}
   * @param subscriptionOptions {{
   *   next: Function,
   *   error: Function
   * }}
   * @returns {Subscription}
   */
  startDeltasSubscription (query, variables, subscriptionOptions) {
    if (!query) {
      throw new Error('You must provide a query for the subscription')
    }
    if (!variables) {
      variables = {}
    }
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug('graphql query:', query.loc.source.body)
      // eslint-disable-next-line no-console
      console.debug('graphql variables:', variables)
    }
    return this.apolloClient.subscribe({
      query: query,
      variables: variables,
      fetchPolicy: 'no-cache'
    }).subscribe({
      next (value) {
        subscriptionOptions.next(value)
      },
      error (errorValue) {
        subscriptionOptions.error(errorValue)
      }
    })
  }

  unsubscribe (componentOrView) {
    const subscription = this.subscriptions[componentOrView.query.name]
    if (!subscription) {
      // eslint-disable-next-line no-console
      console.warn(`Could not unsubscribe [${componentOrView.query.name}]: Not Found`)
      return
    }
    // Remove viewOrComponent subscriber
    delete subscription.subscribers[componentOrView._uid]
    // If no more subscribers, then stop the subscription.
    if (Object.keys(subscription.subscribers).length === 0) {
      this.stopSubscription(subscription)
    }
  }

  stopSubscription (subscription) {
    // Stop WebSockets subscription.
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Stopping subscription ${subscription.query.name}`)
    }
    subscription.observable.unsubscribe()
    subscription.tearDownActionNames.forEach(actionName => {
      store.dispatch(actionName).then(() => {})
    })
    delete this.subscriptions[subscription.query.name]
  }

  // --- Merging GraphQL queries...

  /**
   * @param {Subscription} subscription
   */
  recompute (subscription) {
    const subscribers = Object.values(subscription.subscribers)
    if (subscribers.length === 0) {
      throw new Error('Error recomputing subscription: No Subscribers.')
    }

    // We will use the first subscriber to compare its variables, and also will
    // merge other queries into its base query, in-place.
    const baseSubscriber = subscribers[0]

    // Reset.
    const initialQuery = print(baseSubscriber.query.query)
    subscription.query.query = baseSubscriber.query.query
    subscription.actionNames = baseSubscriber.query.actionNames
    subscription.tearDownActionNames = baseSubscriber.query.tearDownActionNames

    subscribers.slice(1)
      .forEach(subscriber => {
        if (!isEqual(subscriber.query.variables, baseSubscriber.query.variables)) {
          throw new Error('Error recomputing subscription: Query variables do not match.')
        }
        this.mergeQueries(baseSubscriber.query.query, subscriber.query.query)
        union(subscription.actionNames, subscriber.query.actionNames)
        union(subscription.tearDownActionNames, subscriber.query.tearDownActionNames)
      })
    const finalQuery = print(baseSubscriber.query.query)
    // TODO: consider using a better approach than print(a) === print(b)
    // If we changed the query due to query-merging, then we know we must reload its
    // GraphQL subscription (i.e. stop subscription, start a new one with the server).
    if (initialQuery !== finalQuery) {
      subscription.reload = true
    }
    // And here we set the new merged-query. Voila!
    subscription.query.query = baseSubscriber.query.query
  }

  gClone (query) {
    /** Clone a GraphQL query.
     * Why oh why isn't there a better way of doing this in JS!
     * @param {Object} query - Parsed GraphQL query.
     * @return {Object} Deep clone of the provided query.
     */
    // TODO - consider serialising via parse(print(query));
    return JSON.parse(JSON.stringify(query))
  }

  getSelections (a) {
    /**
     * Return map of selections present on a node.
     * @param {Object} a - Node of GraphQL query.
     * @return {Object} All selections present on this node.
     */
    if (!a.selectionSet || !a.selectionSet.selections) {
      return {}
    }
    const selections = {}
    for (const selection of a.selectionSet.selections) {
      if (selection.kind === 'Field') {
        let key = selection.name.value
        if (selection.alias) {
          key = selection.alias.value
        }
        selections[key] = selection
      }
    }
    return selections
  }

  mergeSelection (a, b) {
    /**
     * Merge node b into node a (modifies a in-place).
     * @param {Object} a - Node of a GraphQL query.
     * @param {Object} b - Node of a GraphQL query.
     */
    const aSel = this.getSelections(a)
    const bSel = this.getSelections(b)
    for (const selection in bSel) {
      if (!(selection in aSel)) {
        a.selectionSet.selections.push(this.gClone(bSel[selection]))
      } else {
        this.mergeSelection(aSel[selection], bSel[selection])
      }
    }
  }

  mergeQueries (a, b) {
    /**
     * Merge two graphql schema (modifies a in-place).
     * @param {Object} a - Parsed GraphQL query.
     * @param {Object} b - Parsed GraphQL query.
     */
    this.mergeSelection(a.definitions[0], b.definitions[0])
  }
}

export default WorkflowService
