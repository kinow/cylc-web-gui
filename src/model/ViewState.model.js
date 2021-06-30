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

import { Enumify } from 'enumify'

/**
 * Represents the state of a view, like views with subscriptions, or other views
 * that load data.
 *
 * Besides the obvious loading and complete, it also includes the initial NO_STATE
 * state, and the COMPLETE state.
 *
 * @see https://dev.to/mpocock1/state-management-how-to-tell-a-bad-boolean-from-a-good-boolean-260n
 * @see https://lillo.dev/articles/slaying-a-ui-antipattern/1-fetch-data-with-elm-pattern/
 */
class ViewState extends Enumify {
  static NO_STATE = new ViewState()
  static LOADING = new ViewState()
  static ERROR = new ViewState()
  static COMPLETE = new ViewState()
  static _ = this.closeEnum()
}

export default ViewState
