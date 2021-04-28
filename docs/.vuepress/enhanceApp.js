import Job from '@/components/cylc/Job.vue'
import '@/styles/index.scss'

export default ({ Vue, options, router, siteData }) => {
  Vue.component('job', Job)
}
