<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-form validate>
    <!-- the mutation title -->
    <h3
     style="text-transform: capitalize;"
    >
      {{ mutation.name }}
    </h3>

    <!-- the mutation description -->
    <v-expansion-panels
     accordion
     flat
     hover
     v-if="longDescription"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>
          <vue-markdown
           :source="shortDescription"
          />
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <vue-markdown
           :source="longDescription"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <vue-markdown
     v-else
     :source="shortDescription"
    />

    <!-- the form inputs -->
    <v-list>
      <v-list-item
       v-for="input in inputs"
       v-bind:key="input.label"
      >
        <v-list-item-content>
          <v-list-item-title>
            <!-- input label - the display title for this input -->
            {{ input.label }}
            <!-- help button - tooltip for more information -->
            <v-tooltip bottom
              v-if="input.description"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ icons.help }}
                </v-icon>
              </template>
              <!-- wrap the tooltip in a div with restricted width to force
                   line wrapping -->
              <div
                style="
                  width: 20vw;
                  text-align: center;
                "
              >
              <vue-markdown>
                {{ input.description }}
              </vue-markdown>
              </div>
            </v-tooltip>
          </v-list-item-title>
          <form-input
            v-model="model[input.label]"
            :gqlType="input.gqlType"
            :types="types"
            :label="input.label"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-form>
</template>

<script>
import VueMarkdown from 'vue-markdown/src/build'

import cloneDeep from 'lodash/cloneDeep'
import { mdiHelpCircleOutline } from '@mdi/js'

import FormInput from '@/components/graphqlFormGenerator/FormInput'
import { getNullValue } from '@/utils/aotf'

export default {
  name: 'form-generator',

  components: {
    'vue-markdown': VueMarkdown,
    'form-input': FormInput
  },

  props: {
    mutation: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      default: () => []
    },
    initialData: {
      type: Object
    },
    callbackSubmit: {
      // called when the user submits the form
      type: Function
    }
  },

  data: () => ({
    model: {},
    icons: {
      help: mdiHelpCircleOutline
    }
  }),

  created () {
    this.reset()
  },

  computed: {
    /* Provide a list of all form inputs for this mutation. */
    inputs () {
      const ret = []
      for (const arg of this.mutation.args) {
        ret.push({
          gqlType: arg.type,
          label: arg.name,
          description: arg.description
        })
      }
      return ret
    },

    /* Return the first line of the description. */
    shortDescription () {
      return (this.mutation.description || '').split('\n', 1)[0] || ''
    },

    /* Return the subsequent lines of the description */
    longDescription () {
      return (this.mutation.description || '').split('\n').slice(1).join('\n')
    }
  },

  watch: {
    mutation: function () {
      // reset the form if the mutation changes
      // (i.e. this component is being re-used)
      this.reset()
    }
  },

  methods: {
    /* Set this form to its initial conditions. */
    reset () {
      // begin with the initial data
      const model = cloneDeep(this.initialData || {})

      // then apply default values from the schema
      let defaultValue
      for (const arg of this.mutation.args) {
        if (arg.name in model) {
          // if the argument is defined in the initial data leave it unchanged
          continue
        }
        if (arg.defaultValue) {
          // if a default value is provided in the schema use it
          defaultValue = JSON.parse(
            // default values arrive as JSON strings in the introspection
            // result so need to be converted here
            arg.defaultValue
          )
          if (!defaultValue) {
            defaultValue = getNullValue(arg.type, this.types)
          }
        } else {
          // if no default value is provided choose a sensible null value
          // NOTE: IF we set null as the default type for a list
          //       THEN tried to change it to [] later this would break
          //       THIS would break Vue model
          defaultValue = getNullValue(arg.type, this.types)
        }
        model[arg.name] = defaultValue
      }

      // done
      this.model = model
    },

    submit () {
      // TODO: validate
      if (this.callbackSubmit) {
        this.callbackSubmit(this.model)
      }
    }
  }
}
</script>
