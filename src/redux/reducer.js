import {
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
    PLAYLISTDETIL,
    PLAYALL,
    ADDPLAYALL,
    TOGGLESPECIFIEDSONG,
    INSERTSONGTOPLAY,
    USERSUBCOUNT,
    CATEGORYPLAYLIST,
    OFFSET,
    LYRIC,
    FMMODE,
} from './actionTypes';





const userInitialState = {
    isLogged: false,
    userInfo: {
        account: {
            id: null
        },
        profile: {
            avatarUrl: "",
            nickname: ""
        }
    },
    loginFailedMsg: '',
    loading: false
}

export function user(state = userInitialState, action) {
    switch (action.type) {
        case LOAGINSUCCESS:
            return {
                ...state,
                isLogged: true,
                userInfo: action.payload,
                loginFailedMsg: '',
                loading: false
            }
        case LOADING:
            return {
                ...state,
                loading: action.isLoading
            }

        case LOAGINFAILED:
            return {
                ...state,
                isLogged: false,
                loginFailedMsg: action.payload
            }

        case LOGOUT:
            return {
                ...state,
                isLogged: false,
                userInfo: {
                    account: {
                        id: null
                    },
                    profile: {
                        avatarUrl: "",
                        nickname: ""
                    }
                },
            }

        default:
            return state;
    }
}




const playInfoInitialState = {
    mode: 1, // 1:循环 2:顺序 3:单曲 4:随机
    tracks: [], // 曲目（歌曲id 歌手 专辑 专辑封面URL）
    playState: false, // 播放状态
    lrc: [], // 歌词
    currentIndex: -1, // 当前播放歌曲tracks中的index，-1：当前歌单没有歌曲
    likeList: new Set(), //喜欢的音乐的id Set对象
    isFM: false, // 当前是否是fm播放模式
    songData: {
        id: null,
        url: '#'
    }, //当前播放歌曲信息(URL,type...)
    currentTime: 0, //当前已播放的时间
    isGoto: false, //是否跳转播放进度
}

export function playInfo(state = playInfoInitialState, action) {
    switch (action.type) {
        case CHANGEPLAYSTATE:
            if (state.tracks.length === 0) {
                return state;
            }
            return {
                ...state,
                playState: action.playState
            }

        case TOGGLELIKE:
            // 如果喜欢，并且id不存在likeList里面，则增加该id，反之不喜欢，删除id
            if (action.isLike) {
                if (!state.likeList.has(action.id)) {
                    let likeList = new Set([...state.likeList, action.id]);
                    return {
                        ...state,
                        likeList
                    }
                }
            } else {
                if (state.likeList.has(action.id)) {
                    let likeList = new Set(state.likeList);
                    likeList.delete(action.id);
                    return {
                        ...state,
                        likeList
                    }
                }
            }

            // eslint-disable-next-line no-fallthrough
        case CHANGEMODE:
            return {
                ...state,
                mode: action.mode
            }

        case SONGDATA:
            return {
                ...state,
                songData: action.songData,
                playState: Boolean(action.songData.url)
            }

        case TOGGLESONG:
            return {
                ...state,
                currentIndex: action.index,
                lrc: [],
                playState: !action.isFinish
            }

        case LIKELIST:
            return {
                ...state,
                likeList: action.likeList
            }

        case PLAYALL:
            return {
                ...state,
                isFM: action.isFM,
                tracks: action.payload,
                currentIndex: -1,
                playState: false,
                lrc: [],
            }

        case ADDPLAYALL:
            return {
                ...state,
                tracks: [...state.tracks, ...action.payload]
            }

        case CURRENTTIME:
            return {
                ...state,
                currentTime: action.time,
                isGoto: action.isGoto
            }

        case LOGOUT:
            return {
                ...state,
                likeList: new Set()
            }

        case TOGGLESPECIFIEDSONG:
            return {
                ...state,
                songData: action.songData,
                currentIndex: action.currentIndex,
                lrc: [],
                playState: true
            }

        case INSERTSONGTOPLAY:
            let tracks = Object.assign([], state.tracks);
            tracks.splice(state.currentIndex + 1, 0, action.track);

            if (action.insertIndex === 1) {
                return {
                    ...state,
                    tracks,
                };
            } else {
                return {
                    ...state,
                    songData: action.songData,
                    currentIndex: state.currentIndex + 1,
                    lrc: [],
                    playState: true,
                    tracks
                }
            }

        case LYRIC:
            return {
                ...state,
                lrc: action.lrc
            }

        case FMMODE:
            return {
                ...state,
                isFM: action.isFM
            }

        default:
            return state;
    }
}



const playListInitialState = {
    offset: 0, // 暂存歌单偏移量
    personalizedList: [], // 推荐歌单or未登录歌单列表
    recommendList: [], // 日推歌单
    userCollectList: [], // 用户歌单（自建&&收藏的歌单）
    userPlayList: [], //用户自己的歌单(自建)
    categoryPlayList: {
        cat: "",
        playlists: []
    }, //分类歌单
    currentPlayLIstDetil: {
        playlist: {
            tags: "",
            description: '',
            coverImgUrl: "",
            id: null,
            tracks: []
        }
    }, // 当前歌单详细信息
}

export function playList(state = playListInitialState, action) {
    switch (action.type) {
        case OFFSET:
            return {
                ...state,
                offset: action.translateX
            }
        case PERSONALIZEDPLAYLIST:
            return {
                ...state,
                personalizedList: action.playList
            }

        case RECOMMENDPLAYLIST:
            return {
                ...state,
                recommendList: action.playList
            }

        case USERCOLLECTLIST:
            return {
                ...state,
                userCollectList: action.playList
            }

        case PLAYLISTDETIL:
            return {
                ...state,
                currentPlayLIstDetil: action.detil
            }

        case CATEGORYPLAYLIST:
            let categoryPlayList;
            if (action.isAdd) {
                categoryPlayList = JSON.parse(JSON.stringify(state.categoryPlayList));
                categoryPlayList.playlists = categoryPlayList.playlists.concat(action.payload.playlists)
            } else {
                categoryPlayList = action.payload;
            }
            return {
                ...state,
                categoryPlayList
            }
        case USERSUBCOUNT:
            const userPlayList = state.userCollectList.slice(0, action.payload.createdPlaylistCount);
            return {
                ...state,
                userPlayList
            }

        default:
            return state;
    }
}