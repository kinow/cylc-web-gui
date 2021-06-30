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
import ViewState from '@/model/ViewState.model'
import { mapActions } from 'vuex'

/**
 * A mixin for data common to views and components with a view state. Useful
 * when you load data for the view, and have loading state such as NO_STATE,
 * LOADING, ERROR, COMPLETE, etc.
 *
 * Also maps the setAlert action, to notify the user about errors.
 *
 * @see ViewState
 * @see Alert
 */
export default {
  data () {
    return {
      viewState: ViewState.NO_STATE
    }
  },
  computed: {
    isLoading () {
      return this.viewState === ViewState.LOADING
    }
  },
  methods: {
    ...mapActions(['setAlert'])
  }
}
