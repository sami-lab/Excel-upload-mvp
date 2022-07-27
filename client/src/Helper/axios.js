import axios from 'axios';

let baseURL = process.env.REACT_APP_API_URL + '/api/v1';

const instance = axios.create({
  baseURL,
});
export default instance;