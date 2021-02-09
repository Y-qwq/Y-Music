import Axios from 'axios';
import { IObject, IRequire } from '@/types';

export const axios = Axios.create({
  baseURL: 'https://yezijun.top:3000',
});

export const GET: IRequire = (path: string, params: IObject = {}) => axios.get(path, { params });
export const POST = axios.post;
