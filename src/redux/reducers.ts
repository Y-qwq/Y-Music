import { combineReducers } from 'redux';
import { userReducer } from '@dao/user';
import { DataKey } from '@enums/index';

export const reducers = combineReducers({
  [DataKey.USER.value]: userReducer
});
