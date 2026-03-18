import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://universe-oinp.onrender.com/api'
})

export default instance