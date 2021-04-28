import Job from '@/components/cylc/Job.vue'
import Menu from '@/components/cylc/cylcObject/Menu'
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
