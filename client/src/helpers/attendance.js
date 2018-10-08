//Methods for api calls for attendance data
import axios from 'axios';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const Api = {
  get: (url, params = {}) => {
    return axios.get(url, { headers, params }).then(({ data }) => data);
  },
  post: (url, data = {}, params = {}) => {
    return axios.post(baseURL + url, data, { headers, params }).then(({ data }) => data);
  },
  delete: (url, params = {}) => {
    return axios.delete(baseURL + url, { headers, params }).then(({ data }) => data);
  },
};

export default Api;