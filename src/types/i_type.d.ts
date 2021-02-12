import { AxiosResponse } from 'axios';
import { WritableKeys } from './utils';

// common
export { IState } from '@/redux/reducers';

export type IObject<T = unknown, K extends string | number | symbol = string> = Record<K, T>;

export type IRequire<T = IObject> = { (...args: any[]): Promise<AxiosResponse<T>> };

export type AudioOptions = Pick<HTMLAudioElement, WritableKeys<HTMLAudioElement>>;
