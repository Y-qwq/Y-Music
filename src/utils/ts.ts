import { AxiosResponse } from 'axios';

export type IObject<T = unknown> = Record<string | number | symbol, T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IRequire<T = IObject> = { (...args: any[]): Promise<AxiosResponse<T>> };
