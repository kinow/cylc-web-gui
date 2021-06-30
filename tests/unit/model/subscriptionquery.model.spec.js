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
import gql from 'graphql-tag'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'

describe('SubscriptionQuery model', () => {
  describe('constructor', () => {
    it('should be created', () => {
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
      const subscriptionQuery = new SubscriptionQuery(query, variables, name, actionNames, tearDownActionNames)
      expect(subscriptionQuery.query).to.equal(query)
      expect(subscriptionQuery.variables).to.deep.equal(variables)
      expect(subscriptionQuery.name).to.equal(name)
      expect(subscriptionQuery.actionNames).to.deep.equal(actionNames)
      expect(subscriptionQuery.tearDownActionNames).to.deep.equal(tearDownActionNames)
    })
  })
})
