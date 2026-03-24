import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const fetchPositions = async () => {
  const { data } = await api.get('/positions');
  return data;
};

export const createPosition = async (positionData) => {
  const { data } = await api.post('/positions', positionData);
  return data;
};

export const updatePosition = async (id, positionData) => {
  const { data } = await api.put(`/positions/${id}`, positionData);
  return data;
};

export const fetchCandidates = async () => {
  const { data } = await api.get('/candidates');
  return data;
};

export const createCandidate = async (candidateData) => {
  const { data } = await api.post('/candidates', candidateData);
  return data;
};

export const updateCandidate = async (id, candidateData) => {
  const { data } = await api.put(`/candidates/${id}`, candidateData);
  return data;
};

export const fetchUpdates = async () => {
  const { data } = await api.get('/updates');
  return data;
};

export const fetchAnalytics = async (duration = 'all') => {
  const response = await axios.get(`${API_URL}/analytics?duration=${duration}`);
  return response.data;
};

export default api;
