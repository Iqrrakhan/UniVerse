import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://universe-api.onrender.com/api'  // ← your ACTUAL Render URL
})

export default instance