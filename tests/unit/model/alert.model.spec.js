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
import Alert from '@/model/Alert.model'

describe('Alert model', () => {
  beforeEach(() => {
    sinon.stub(console, 'log')
  })
  afterEach(() => {
    sinon.restore()
  })
  describe('constructor', () => {
    it('should be created', () => {
      const text = 'my error'
      const icon = 'error-icon'
      const color = 'success'
      const alert = new Alert(text, icon, color)
      expect(alert.getText()).to.equal(text)
      expect(alert.getIcon()).to.equal(icon)
      expect(alert.getColor()).to.equal(color)
    })
  })
})
