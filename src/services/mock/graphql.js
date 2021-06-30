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

const data = require('./json/index')

/**
 * Mapping between a query and the returned data. The returned data
 * can be generated programmatically, or with GraphiQL, or another GraphQL
 * command line.
 */
const DATA_MAPPING = {
  IntrospectionQuery: data.IntrospectionQuery,
  OnWorkflowTreeDeltasData: {
    deltas: {
      added: data.OnWorkflowTreeDeltasData
    }
  },
  DashboardSubscriptionQuery: data.DashboardSubscriptionQuery,
  GscanSubscriptionQuery: {
    deltas: {
      added: data.GscanSubscriptionQuery
    }
  },
  WorkflowsTableQuery: data.WorkflowsTableQuery
}

/**
 * Given a GraphQL query, this function tries to fetch the operation
 * name from a subscription, query, or mutation GraphQL query.
 *
 * Sometimes requests contain the .OperationName properties, but other
 * times they don't, so we have to try to guess it either from the
 * query name, or from its text (this function does the former, for
 * introspection we are searching for __schema elsewhere).
 *
 * Returns an empty string if not found.
 *
 * @param {string} query - GraphQL query
 * @returns {string} operation name, or empty string if not found
 */
function getOperationName (query) {
  const regexp = /\s*(subscription|query|mutation)\s+([a-zA-Z0-9_]+)/
  const match = regexp.exec(query)
  if (match && match.length >= 3) {
    return match[2]
  }
  return ''
}

/**
 * Get the response for a given GraphQL query operation name.
 *
 * @param {string} operationName - GraphQL query operation name (e.g. GScanQuery, WorkflowTableQuery, etc)
 * @returns {*} GraphQL response
 */
function getGraphQLQueryResponse (operationName) {
  // Return the data if we have that in the DATA_MAPPING dict
  return DATA_MAPPING[operationName] || {}
}

/**
 * Will take care of guessing the operation name from the GraphQL request,
 * and returning the valid response (if any).
 *
 * @param {*} request - Express HTTP GraphQL request
 * @returns {*} GraphQL response
 */
function handleGraphQLRequest (request) {
  const isSchemaQuery = request.body.query.includes('__schema')
  const operationName = isSchemaQuery
    ? 'IntrospectionQuery'
    : getOperationName(request.body.query)
  return getGraphQLQueryResponse(operationName)
}

module.exports = {
  getOperationName,
  getGraphQLQueryResponse,
  handleGraphQLRequest
}
