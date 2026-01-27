import { reactive,toRefs } from 'vue'
export default function(searchParam) {
  let searchData = reactive({...searchParam})
  return {
    searchData:{...toRefs(searchData)},
  }
}