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
  <div id="graphiql" ref="graphiql">Loading...</div>
</template>

<script>
import pageMixin from '@/mixins'
import ReactDOM from 'react-dom'
import React from 'react'
import GraphiQL from 'graphiql'
import { fallbackGraphQLFetcher, graphQLFetcher } from '@/graphql/graphiql'

export default {
  name: 'GraphiQL',
  mixins: [pageMixin],
  metaInfo () {
    return {
      title: 'GraphiQL'
    }
  },
  data () {
    return {
      fetcher: null,
      subscription: null
    }
  },
  mounted () {
    this.fetcher = this.createFetcher()
    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher: this.fetcher,
        defaultVariableEditorOpen: false
      }),
      this.$refs.graphiql
    )
  },
  beforeRouteLeave (to, from, next) {
    // Important to remember to unsubscribe, otherwise a user may accidentally create several
    // subscriptions/observers, causing performance issues on both frontend and backend.
    if (this.subscription !== null) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    next()
  },
  methods: {
    createFetcher () {
      const subscriptionClient = this.$workflowService.subscriptionClient
      return subscriptionClient !== null
        ? graphQLFetcher(subscriptionClient, fallbackGraphQLFetcher, this)
        : fallbackGraphQLFetcher
    }
  }
}
</script>

<style scoped>
@import '~graphiql/graphiql.min.css';

body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  width: 100%;
}

#graphiql {
  height: 100vh;
}
</style>
