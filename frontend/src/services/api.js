import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchTradeSignal = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/trade_signal`, data);
    return response.data;
  } catch (error) {
    console.error("API 请求失败:", error);
    throw error;
  }
};
