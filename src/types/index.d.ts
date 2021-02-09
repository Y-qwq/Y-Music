import { AxiosResponse } from 'axios';

// common
export { IState } from '@/redux/reducers';

export type IObject<T = unknown> = Record<string | number | symbol, T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IRequire<T = IObject> = { (...args: any[]): Promise<AxiosResponse<T>> };
