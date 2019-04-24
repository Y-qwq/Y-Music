import { combineReducers } from 'redux';
import {playInfo,user,playList} from './reducer';

const reducers = combineReducers({
    user,// 用户信息
    playInfo,// 播放信息
    playList,// 歌单
})

export default reducers;