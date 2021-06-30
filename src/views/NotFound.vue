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
  <v-container
      fill-height
      fluid>
    <v-layout
        align-center
        justify-center>
      <v-flex
          xs12
          sm8
          md4>
        <v-card>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{ $t('NotFound.title') }}</h3>
            </div>
          </v-card-title>
          <v-card-text>
            {{ $t('NotFound.message') }}
          </v-card-text>
          <v-card-actions>
            <button @click="$router.go(-1)" class="v-btn success">{{ $t('NotFound.goBack') }}</button>
            <router-link to="/" tag="button" class="white--text success v-btn">{{ $t('NotFound.toHomepage') }}</router-link>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import pageMixin from '@/mixins/index'

export default {
  mixins: [pageMixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.notFound')
    }
  }
}
</script>
