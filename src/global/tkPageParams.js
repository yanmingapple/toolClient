import { getCurReqQueryData } from '@/store/tkStore'

export default (location) => {
    return getCurReqQueryData(location)
}