import axios from 'axios';

export const require = axios.create({
  baseURL: 'https://yezijun.top:3000',
});

export const GET = (path: string, params: unknown = {}) => require.get(path, { params });
export const POST = require.post;
