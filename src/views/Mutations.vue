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
  <div class="c-mutations">
    <div v-if="!loaded">
      Loading...
    </div>
    <div v-if="loaded"
     style="padding: 1em;"
    >
      <v-select
        v-model="selectedMutation"
        :items="mutationNames"
        label="Mutation"
      />
      <mutation
       v-if="selectedMutation"
       :mutation="getMutation(selectedMutation)"
       :types="types"
      />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { getIntrospectionQuery as getGraphQLIntrospectionQuery, print } from 'graphql'

import Mutation from '@/components/cylc/Mutation'
import subscriptionViewMixin from '@/mixins/subscriptionView'

export function associate (mutations, objects) {
  const associations = {}
  for (const mutation of mutations) {
    associations[mutation.name] = []
    let pointer = null
    let multiple = null
    let flag = null
    for (const argument of mutation.args) {
      pointer = argument.type
      multiple = false
      flag = false
      while (pointer) {
        // walk down the nested type tree
        if (pointer.kind === 'LIST') {
          multiple = true
        } else if (pointer.name) {
          for (const objectName in objects) {
            for (
              const [type, impliesMultiple] of objects[objectName]
            ) {
              if (pointer.name === type) {
                associations[mutation.name].push({
                  argument: argument.name,
                  cylcObject: objectName,
                  multiple: multiple || impliesMultiple
                })
                flag = true
                break
              }
            }
            if (flag) { break }
          }
          if (flag) { break }
        }
        pointer = pointer.ofType
      }
    }
  }
  return associations
}

export default {
  name: 'Mutations',
  mixins: [subscriptionViewMixin],
  components: {
    Mutation
  },
  data: () => ({
    loaded: false,
    selectedMutation: 'sampleMutation',
    types: [],
    mutations: {},
    associations: {},
    selectedAssociation: null,
    cylcObjects: {
      // object: [[typeName: String, impliesMultiple: Boolean]]
      Workflow: [
        ['WorkflowID', false]
      ],
      CyclePoint: [
        ['CyclePoint', false],
        ['CyclePointGlob', true]
      ],
      Namespace: [
        ['NamespaceName', false],
        ['NamespaceIDGlob', true]
      ],
      Task: [
        ['TaskID', false]
      ],
      Job: [
        ['JobID', false]
      ]
    }
  }),
  computed: {
    mutationNames () {
      const names = []
      if (!this.mutations) {
        return names
      }
      for (const mutation of this.mutations) {
        names.push(mutation.name)
      }
      return names
    },

    sampleMutation () {
      // create a mutation with one argument per input type
      const args = []
      for (const type of this.types) {
        if (
          type.kind !== 'OBJECT' &&
          type.name[0] !== '_'
        ) {
          args.push({
            name: type.name,
            type: {
              name: type.name,
              kind: type.kind
            }
          })
        }
      }

      // add a nested NonNull component
      args.push({
        name: 'NonNull<String>',
        defaultValue: '"Can\'t null this"',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: 'String',
            kind: 'SCALAR'
          }
        }
      })

      // add a nested List component
      args.push({
        name: 'List<String>',
        defaultValue: '["abc"]',
        type: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: 'String',
            kind: 'SCALAR'
          }
        }
      })

      // add a double nested NonNull, List component
      args.push({
        name: 'NonNull<List<NonNull<String>>>',
        defaultValue: '["abc"]',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: null,
            kind: 'LIST',
            ofType: {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: 'String',
                kind: 'SCALAR'
              }
            }
          }
        }
      })

      // add a triple nested Object, List component
      args.push({
        name: 'List<BroadcastSetting>',
        defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
        type: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: 'BroadcastSetting',
            kind: 'INPUT_OBJECT'
          }
        }
      })

      // add a quintuple nested Object just for fun
      // (if this works all is good!)
      // NOTE: always debug from the lowest level of nesting
      // NOTE: BroadcastSetting = NonNull<String>, NonNull<String>
      args.push({
        name: 'NonNull<List<NonNull<BroadcastSetting>>>',
        defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: null,
            kind: 'LIST',
            ofType: {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: 'BroadcastSetting',
                kind: 'INPUT_OBJECT'
              }
            }
          }
        }
      })

      return {
        name: 'Sample Mutation',
        description: 'Example containing all data types present in the schema.',
        args: args
      }
    }
  },
  created () {
    this.getSchema()
  },
  methods: {
    getIntrospectionQuery () {
      // we are only interested in mutations so can make our life
      // a little easier by restricting the scope of the default
      // introspection query
      const fullIntrospection = gql(getGraphQLIntrospectionQuery())
      const mutationQuery = gql(`
        query {
          __schema {
            mutationType {
              ...FullType
            }
            types {
              ...FullType
            }
          }
        }
      `)
      // TODO: this returns all types, we only need certain ones

      // NOTE: we are converting to string form then re-parsing
      // back to a query, as something funny happens when you
      // try to modify the gql objects by hand.
      return gql(
        // the query we actually want to run
        print(mutationQuery.definitions[0]) +
        // the fragments which power it
        print(fullIntrospection.definitions[1]) +
        print(fullIntrospection.definitions[2]) +
        print(fullIntrospection.definitions[3])
      )
    },
    getSchema () {
      this.$workflowService.apolloClient.query({
        query: this.getIntrospectionQuery(),
        fetchPolicy: 'no-cache'
      }).then((response) => {
        this.mutations = response.data.__schema.mutationType.fields
        this.types = response.data.__schema.types
        this.associate()
        this.loaded = true
      })
    },
    getMutation (name) {
      if (name === 'sampleMutation') {
        return this.sampleMutation
      }
      for (const mutation of this.mutations) {
        if (mutation.name === name) {
          return mutation
        }
      }
    },
    /* Associate mutations with cylc objects (e.g. workflows, cyclepoints) */
    associate (mutations, objects) {
      this.associations = associate(this.mutations, this.cylcObjects)
    },
    /* Return names of mutations which relate to the provided object type.
     *
     * Returns a dictionary: {
     *   // mutation name
     *   name,
     *   // the argument of the mutation which relates to the type.
     *   argument,
     *   // true if more than one object can be provided
     *   // (i.e. the argument accepts a glob, list or list of globs)
     *   multiple
     * }
     */
    filterAssociations (cylcObject) {
      const ret = []
      let association
      for (const mutationName in this.associations) {
        association = this.associations[mutationName]
        for (const entry of association) {
          if (entry.cylcObject === cylcObject) {
            ret.push({
              name: mutationName,
              argument: entry.argument,
              multiple: entry.multiple
            })
            break
          }
        }
      }
      return ret
    }
  }
}
</script>
