import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://universe-oinp.onrender.com'  // ← your ACTUAL Render URL
})

export default instance