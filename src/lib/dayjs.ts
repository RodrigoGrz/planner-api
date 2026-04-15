import 'dayjs/locale/pt-br'
import utc from 'dayjs/plugin/utc'

import dayjs from 'dayjs'

dayjs.locale('pt-br')
dayjs.extend(utc)

export { dayjs }
