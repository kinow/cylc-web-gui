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

import Vue from 'vue'

/**
 * Only effectively used if we return something. Otherwise Lodash will use its default merge
 * function. We use it here not to mutate objects, but to check that we are not losing
 * reactivity in Vue by adding a non-reactive property into an existing object (which should
 * be reactive and used in the node tree component).
 *
 * @see https://docs-lodash.com/v4/merge-with/
 * @param {?*} objValue - destination value in the existing object (same as object[key])
 * @param {?*} srcValue - source value from the object with new values to be merged
 * @param {string} key - name of the property being merged (used to access object[key])
 * @param {*} object - the object being mutated (original, destination, the value is retrieved with object[key])
 * @param {*} source - the source object
 */
function mergeWithCustomizer (objValue, srcValue, key, object, source) {
  if (srcValue !== undefined) {
    // 1. object[key], or objValue, is undefined
    //    meaning the destination object does not have the property
    //    so let's add it with reactivity!
    if (objValue === undefined) {
      Vue.set(object, `${key}`, srcValue)
    }
    // 2. object[key], or objValue, is defined but without reactivity
    //    this means somehow the object got a new property that is not reactive
    //    so let's now make it reactive with the new value!
    if (object[key] && !object[key].__ob__) {
      Vue.set(object, `${key}`, srcValue)
    }
  }
}

export {
  mergeWithCustomizer
}
