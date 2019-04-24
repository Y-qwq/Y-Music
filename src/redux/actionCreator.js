import {
    getLogin,
    getLogout,
    getSongUrl,
    setLike,
    getLikeList,
    getPlayListDetail,
    getPersonalizedPlayList,
    getRecommendPlayList,
    getUserPlayList,
    getSignin,
    getUserSubcount,
    getOneCategory,
    getLyric,
    getPersonalFM
} from '../util/api';
import {
    CATEGORYPLAYLIST,
    LOAGINSUCCESS,
    LOADING,
    LOAGINFAILED,
    LOGOUT,
    TOGGLESONG,
    CHANGEPLAYSTATE,
    CHANGEMODE,
    CURRENTTIME,
    TOGGLELIKE,
    LIKELIST,
    SONGDATA,
    PERSONALIZEDPLAYLIST,
    RECOMMENDPLAYLIST,
    USERCOLLECTLIST,
    PLAYALL,
    ADDPLAYALL,
    TOGGLESPECIFIEDSONG,
    USERSUBCOUNT,
    INSERTSONGTOPLAY,
    OFFSET,
    LYRIC,
    FMMODE,
} from './actionTypes';


const loaginSuccess = (payload) => {
    return {
        type: LOAGINSUCCESS,
        payload
    }
}

export const isLoading = (isLoading) => {
    return {
        type: LOADING,
        isLoading
    }
}

const loginFailed = (payload) => {
    return {
        type: LOAGINFAILED,
        payload
    }
}

const logoutSuccess = () => {
    return {
        type: LOGOUT
    }
}

export const login = (account, password, type, isAuto, lastTime) => {
    return async dispatch => {
        if (!isAuto) {
            dispatch(isLoading(true));
        }
        try {
            const res = await getLogin(account, password, type);
            if (res.data.code === 200) {
                dispatch(loaginSuccess(res.data));

                //获取用户喜欢的歌曲的ids
                dispatch(getLikeListInfo(res.data.account.id));
                dispatch(getrecommendList());
                dispatch(getuerList(res.data.account.id));
                // if (!lastTime || lastTime !== new Date().getDate()) {
                //     try {
                //         await getSignin(0); //pc端签到
                //     } catch (error) {
                //         console.log(error.response.data.msg);
                //     }
                //     try {
                //         await getSignin(1); //安卓端签到
                //     } catch (error) {
                //         console.log(error.response.data.msg);
                //     }
                // }
            } else {
                dispatch(loginFailed('登录异常'))
            }
        } catch (error) {
            if (error.response) {
                dispatch(loginFailed(error.response.data.msg))
            } else {
                dispatch(loginFailed('GG,连接不上服务器'))
            }
        }
    }
}
export const logout = () => {
    return async dispatch => {
        const res = await getLogout();
        if (res.status === 200 && res.data.code === 200) {
            dispatch(logoutSuccess());
            // 更新歌单显示
            dispatch(getPersonalizedList());
        } else {
            console.log("Logout Failed!")
        }
    }
}






// isFinish是否播放完毕（停止播放)
const toggleSong = (index, isFinish = false) => {
    return {
        type: TOGGLESONG,
        index,
        isFinish
    }
}
// 播放 暂停
export const changePlayState = (playState) => {
    return {
        type: CHANGEPLAYSTATE,
        playState
    }
}
// 播放模式
export const changeMode = (mode) => {
    return {
        type: CHANGEMODE,
        mode
    }
}
// 当前播放时间长度, isGoto:是否跳转（时间）
export const currentTime = (time, isGoto = false) => {
    return {
        type: CURRENTTIME,
        isGoto,
        time
    }
}

// 喜欢 取消喜欢歌曲
const toggleLike = (id, isLike) => {
    return {
        type: TOGGLELIKE,
        isLike,
        id
    }
}

// 获取喜欢的歌曲的列表
const setLikeList = (likeList) => {
    return {
        type: LIKELIST,
        likeList
    }
}
// 获取歌曲的url
const songData = (payload) => {
    return {
        type: SONGDATA,
        songData: payload
    }
}

// 将歌单所有歌曲添加进播放列表（追加添加）
export const addPlayAll = (payload) => {
    return {
        type: ADDPLAYALL,
        payload
    }
}

// 播放歌单所有歌曲（替换当前歌单）
export const playAll = (payload, isFM = false) => {
    return {
        type: PLAYALL,
        payload,
        isFM
    }
}

// 切换到指定歌曲
export const toggleSpecified = (songData, currentIndex) => {
    return {
        type: TOGGLESPECIFIEDSONG,
        songData,
        currentIndex
    }
}
// 插入一首歌，1：插入到下一首 0：插入到当前位置（立即播放）
export const insertOnePlay = (index, track, songData) => {
    if (index === 1) {
        return {
            type: INSERTSONGTOPLAY,
            insertIndex: index,
            track
        }
    } else {
        return {
            type: INSERTSONGTOPLAY,
            insertIndex: index,
            track,
            songData
        }
    }
}

// 歌词
export const lyric = (lrc) => {
    return {
        type: LYRIC,
        lrc
    }
}

// 更改FM模式
export const FmMode = (isFM) => {
    return {
        type: FMMODE,
        isFM
    }
}

// 解析歌词
const parseLrc = lrc => {
    let pattern = /\[\d{2}:\d{2}.{0,5}\]/g;
    let lines = lrc.split("\n");
    let result = [];

    // 没有歌词滚动的情况下
    if (!pattern.test(lrc)) {
        result.push([0, '~>_<~ 该歌词不支持滚动！'])
        for (let line of lines) {
            result.push([0, line]);
        }
        return result;
    }

    // 删掉没有以时间开头的段落
    while (!pattern.test(lines[0])) {
        lines = lines.slice(1);
    }
    lines[lines.length - 1].length === 0 && lines.pop();

    for (let data of lines) {
        // 获取内容
        let index = data.lastIndexOf("]");
        let value = data.substring(index + 1);

        // 两种格式解析 [02:07.44][00:42.54]心中满是悔恨  or  [00:42.54]心中满是悔恨 [02:07.44]心中满是悔恨
        const times = data.match(pattern);
        for (const time of times) {
            // 去除时间左右中括号
            let timeString = /\[(\d{2}:\d{2}.{0,5})\]/g.exec(time)[1]
            let timeArr = timeString.split(":");
            result.push([
                parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]),
                value
            ]);
        }
    }
    result.sort(function (a, b) {
        return a[0] - b[0];
    });
    return result;
};

// 获取歌词
export const getoneLyric = () => {
    return async (dispatch, getState) => {
        const playInfo = getState().playInfo;
        if (playInfo.currentIndex < 0) return;
        const id = playInfo.tracks[playInfo.currentIndex].id;
        try {
            let res = await getLyric(id);
            if (res.data.lrc && !res.data.uncollected) {
                let {
                    lrc: {
                        lyric: oLrc
                    },
                    tlyric: {
                        lyric: tLrc
                    }
                } = res.data;
                if (oLrc) {
                    oLrc = parseLrc(oLrc);
                    // 合并翻译歌词到原歌词内[['time','oLrc','tLrc']...]
                    if (tLrc) {
                        tLrc = parseLrc(tLrc);
                        let flag = 0;
                        try {
                            for (const index of oLrc.keys()) {
                                if (oLrc[index][0] === tLrc[flag][0]) {
                                    oLrc[index].push(tLrc[flag++][1]);
                                }
                            }
                        } catch (err) {}
                    }
                    dispatch(lyric(oLrc));
                }
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}


// 切换到指定歌曲（播放列表内）
export const toogeleSpecifiedSong = (index, id) => {
    return async dispatch => {
        let data = await getSongUrls(id);
        if (data && data[0]) {
            dispatch(toggleSpecified(data[0], index));
        }
    }
}

// 插入一首歌到播放列表，1：插入到下一首 0：插入到当前位置（立即播放）
export const insertSongToPlay = (index, track) => {
    return async (dispatch, getState) => {
        // 歌单为空的情况下直接播放
        const playInfo = getState().playInfo;
        index = playInfo.tracks.length === 0 ? 0 : index;

        if (index === 1) {
            !playInfo.isFM && dispatch(insertOnePlay(index, track));
        } else {
            const data = await getSongUrls(track.id);
            if (data && data[0] && data[0].url) {
                playInfo.isFM && dispatch(playAll([]));
                dispatch(insertOnePlay(index, track, data[0]));
            }
        }
    }
}


//获取歌曲url
export const getSongUrls = async (id) => {
    try {
        let res = await getSongUrl(id);
        if (res.data.code === 200) {
            return res.data.data;
        }
    } catch (err) {
        console.log(err && err.response && err.response.data && err.response.data.msg);
        return null;
    }
}


/**
 * @param {Boolean} isNext true:下一首  false:上一首
 * @param {Boolean} isAuto 是否系统自动切歌
 * @param {Boolean} isFirst 播放歌曲（（非随机）从第一首开始播放）
 */
export const onToggleSong = (isNext, isAuto = true, isFirst = false) => {
    return async (dispatch, getState) => {
        const playInfo = getState().playInfo;
        // FM模式下，播放模式改为顺序播放
        const mode = playInfo.isFM ? 2 : playInfo.mode;
        let currentIndex = playInfo.currentIndex;
        let tracksLength = playInfo.tracks.length;
        //下一个歌曲在tracks中的index
        let nextIndex = null;
        //是否播放完当前播放列表
        let isFinish = false;

        // 模拟最后一首歌手动切换下一首的情形以达到播放歌单的效果
        if (isFirst) {
            currentIndex = tracksLength - 1;
            isAuto = false;
            isNext = true;
        }

        // 歌曲url
        let songdata = null;
        // 获取url失败次数
        let count = 0;
        // 连续播放失败时，计算差值
        let diff = 0;

        if (playInfo.tracks.length === 0) {
            return
        }
        do {
            // 4:随机播放
            if (mode === 4) {
                nextIndex = Math.round(Math.random() * (tracksLength - 1));
            } else {
                // 判断是否播完列表的歌曲
                isFinish = currentIndex + count >= tracksLength - 1;
                if (isNext) {
                    // 计算差值
                    diff = currentIndex + count - (tracksLength - 1);
                    // 差值大于0时才取值，即当前播放的歌曲index + 失败次数 > 播放列表的长度时,才取值。
                    diff = diff > 0 ? diff : 0;
                    nextIndex = isFinish ? 0 + diff : currentIndex + 1 + count;
                } else {
                    // 计算差值
                    diff = currentIndex - count;
                    // 差值小于0时才取值，即当前播放的歌曲index - 失败次数 <= 0 时,才取值。
                    diff = diff < 0 ? diff : 0;
                    nextIndex = currentIndex - count <= 0 ? tracksLength - 1 + diff : currentIndex - 1 - count;
                }
            }

            switch (mode) {
                case 1:
                case 3:
                case 4:
                    dispatch(toggleSong(nextIndex));
                    break;
                case 2:
                    dispatch(toggleSong(nextIndex, isFinish && isAuto));
                    break;
                default:
                    return;
            }
            // 顺序播放，播放结束
            if (isAuto && isFinish && mode === 2) {
                return;
            };
            try {
                // 获取歌曲信息，更新songData
                let res = await getSongUrls(playInfo.tracks[nextIndex].id);
                if (res && res[0]) {
                    songdata = res[0];
                    dispatch(songData(songdata));
                } else {
                    count++;
                    continue;
                }
            } catch (err) {
                console.log(err && err.response && err.response.data && err.response.data.msg);
            }
            count++
            // 当url尾缀不是音乐格式时，切歌，连续10次播放失败，则取消播放
        } while (!/^.*?\.(mp3|wav|flac|ape|aac|ogg)$/.test(songdata.url) && count < 10);
    }
}


export const getFM = () => {
    return async (dispatch, getState) => {
        const playInfo = getState().playInfo;
        if (!playInfo.isFM) {
            dispatch(playAll([]));
        }
        try {
            let res = await getPersonalFM();
            if (res.data.code === 200) {
                if (!playInfo.isFM) {
                    dispatch(playAll(res.data.data, true));
                    dispatch(onToggleSong(true, false, true));
                } else {
                    dispatch(addPlayAll(res.data.data));
                }
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}


// 切换喜欢❤状态
export const setToglleLike = (isLike, trackId) => {
    return async (dispatch, getState) => {
        //获取当前歌曲id
        const playInfo = getState().playInfo;
        const curIndex = playInfo.currentIndex;
        let id = null
        // 喜欢指定id歌曲
        if (trackId) {
            id = trackId;
        } else {
            //如果当前歌单为空，操作无效
            if (curIndex === -1) {
                return
            };
            // 喜欢当前播放歌曲
            id = playInfo.tracks[curIndex].id;
        }
        try {
            let res;
            if (isLike) {
                res = await setLike(id, true);
            } else {
                res = await setLike(id, false);
            }
            if (res.data.code === 200) {
                dispatch(toggleLike(id, isLike));
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}

// 获取喜欢的歌曲的ids
export const getLikeListInfo = () => {
    return async (dispatch, getState) => {
        let uid = getState().user.userInfo.account.id;
        try {
            let res = await getLikeList(uid);
            let likeList = new Set(res.data.ids);
            dispatch(setLikeList(likeList));
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}

















// 推荐歌单or未登录歌单列表
const personalizedPlayList = (payload) => {
    return {
        type: PERSONALIZEDPLAYLIST,
        playList: payload
    }
}
// 登录后的日推歌单
const recommendPlayList = (payload) => {
    return {
        type: RECOMMENDPLAYLIST,
        playList: payload
    }
}
// 用户的歌单
const uerPlayList = (payload) => {
    return {
        type: USERCOLLECTLIST,
        playList: payload
    }
}

// 只获得用户的歌单
export const setUserSubcount = (payload) => {
    return {
        type: USERSUBCOUNT,
        payload
    }
}

// 获取某类歌单
export const categoryPlayList = (payload, isAdd) => {
    return {
        type: CATEGORYPLAYLIST,
        payload,
        isAdd
    }
}

export const setOffset = (translateX) => {
    return {
        type: OFFSET,
        translateX
    }
}

// 获取用户的歌单
export const getUserSubcountInfo = () => {
    return async (dispatch, getState) => {
        if (getState().user.isLogged) {
            try {
                let res = await getUserSubcount();
                if (res.data.code === 200) {
                    dispatch(setUserSubcount(res.data))
                }
            } catch (err) {
                console.log(err && err.response && err.response.data && err.response.data.msg);
            }
        }
    }
}

//获取歌单详细信息
export const getOnePlayListDetail = (id, playall = false) => {
    return async dispatch => {
        try {
            let res = await getPlayListDetail(id);
            if (res.data.code === 200 && playall) {
                if (playall) {
                    dispatch(playAll(res.data.playlist.tracks));
                    dispatch(onToggleSong(true, false, true));
                }
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}

// 推荐歌单or未登录歌单列表
export const getPersonalizedList = () => {
    return async dispatch => {
        try {
            let res = await getPersonalizedPlayList();
            if (res.data.code === 200) {
                dispatch(personalizedPlayList(res.data.result));
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}


// 登录后的日推歌单
export const getrecommendList = () => {
    return async dispatch => {
        try {
            let res = await getRecommendPlayList();
            if (res.data.code === 200) {
                console.log(res.data);
                dispatch(recommendPlayList(res.data.recommend));
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}

// 用户的歌单
export const getuerList = (id) => {
    return async (dispatch, getState) => {
        let uid = id || getState().user.userInfo.account.id;
        try {
            let res = await getUserPlayList(uid);
            if (res.data.code === 200) {
                dispatch(uerPlayList(res.data.playlist));
                // 获取用户歌单后再获取各类歌单数目，以区分自建歌单和收藏歌单
                dispatch(getUserSubcountInfo());
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}

// 分类歌单
export const getCategoryPlayList = (cat, limit = 50, isNext) => {
    return async (dispatch, getState) => {
        let offset = 0;
        let catList = getState().playList.categoryPlayList;
        if (isNext && catList.more) {
            offset = catList.playlists.length;
        }
        try {
            let res = await getOneCategory(cat, limit, offset);
            if (res.data.code === 200) {
                dispatch(categoryPlayList(res.data, offset > 0 ? true : false));
            }
        } catch (err) {
            console.log(err && err.response && err.response.data && err.response.data.msg);
        }
    }
}