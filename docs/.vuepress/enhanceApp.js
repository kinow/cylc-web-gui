import Job from '@/components/cylc/Job.vue'
import Task from '@/components/cylc/Task.vue'
import '@/styles/index.scss'

export default ({ Vue, options, router, siteData }) => {
  Vue.component('job', Job)
  Vue.component('task', Task)
}
