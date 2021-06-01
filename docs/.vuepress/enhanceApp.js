// https://github.com/vuejs/vuepress/issues/1434#issuecomment-816268942
if (typeof window !== 'undefined') {
  window.global = window
}

import Job from '@/components/cylc/Job.vue'
// import Menu from '@/components/cylc/cylcObject/Menu'
// Otherwise we get 'Uncaught ReferenceError: global is not defined' from 'at Object../node_modules/markdown-it-toc-and-anchor/dist/index.js'
const Menu = require('@/components/cylc/cylcObject/Menu.vue').default
import Task from '@/components/cylc/Task.vue'
import '@/styles/index.scss'
import Vuetify from 'vuetify'

export default ({ Vue, options, router, siteData }) => {
  Vue.use(Vuetify);
  options.vuetify = new Vuetify({})
  Vue.component('menu', Menu)
  Vue.component('job', Job)
  Vue.component('task', Task)
}
