import { combineReducers, CombinedState, StateFromReducersMapObject } from 'redux';
import { userReducer } from '@dao/user';
import { DATA_KEY } from '@enums/index';

const reducersMap = {
  [DATA_KEY.USER]: userReducer,
};

export const reducers = combineReducers(reducersMap);

export type IState = CombinedState<StateFromReducersMapObject<typeof reducersMap>>;
