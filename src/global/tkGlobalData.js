import store from '@/store'
export default {
  subName: '科目',
  optionsCount: 4,
  getSystemData: () => store.getters.systemData
}