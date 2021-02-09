import { handleActions, Action } from 'redux-actions';
import { updater, EqualStrategy } from '@utils/index';
import { login } from './action';

export interface IUser {
  profile?: {
    userId: number,
    avatarUrl: string,
    nickname: string,
  }
}

export const userReducer = handleActions({
  [login as any]: (state: IUser, { payload }: Action<IUser>) => {
    return updater.update<IUser>(state, payload, {
      equal: EqualStrategy.shallowEqualStrategy
    });
  }
}, {});