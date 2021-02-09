import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxPromise from 'redux-promise';
import reduxLogger from 'redux-logger';
import { reducers } from '@/redux/reducers';

export const store =
  process.env.NODE_ENV === 'production'
    ? createStore(reducers, applyMiddleware(reduxThunk, reduxPromise))
    : createStore(reducers, applyMiddleware(reduxThunk, reduxPromise, reduxLogger));
