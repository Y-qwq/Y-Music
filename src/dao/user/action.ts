import { createActions } from 'redux-actions';
import { login as loginDao } from './dao';

export const { login } = createActions({
  LOGIN: loginDao
});