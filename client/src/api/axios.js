import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://your-render-url.onrender.com/api'
})

export default instance