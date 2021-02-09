import axios from 'axios';
import { IObject, IRequire } from '@utils/ts';

export const require = axios.create({
  baseURL: 'https://yezijun.top:3000',
});

export const GET: IRequire = (path: string, params: IObject = {}) => require.get(path, { params });
export const POST = require.post;
