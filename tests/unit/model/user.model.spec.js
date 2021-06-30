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
import User from '@/model/User.model'

describe('User model', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const name = 'john.foe'
      const groups = ['abc', 'wheel']
      const admin = true
      const created = 'now'
      const server = '/cylc/user/john.foe'
      const user = new User(name, groups, created, admin, server)
      expect(user.username).to.equal(name)
      expect(user.groups.length === 2).to.equal(admin)
      expect(user.admin).to.equal(true)
      expect(user.created).to.equal(created)
      expect(user.server).to.equal(server)
    })
  })
})
