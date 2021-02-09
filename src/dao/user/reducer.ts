import { handleActions } from 'redux-actions';
import { login } from './action';

export const userReducer = handleActions({
  [login as any]: (state, payload: {} = {}) => {
    return payload;
  }
}, {});