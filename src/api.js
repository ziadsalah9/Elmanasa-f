import axios from 'axios'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

export default axios
