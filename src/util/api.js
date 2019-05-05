import axios from 'axios';
import{message} from 'antd';
export const HOSTNAME = 'http://39.108.180.34:3000';

let timestamp = () => new Date().getTime();

axios.defaults.timeout = 5000;

const codeMessage = new Map([
    [400, '发出的请求有错误，服务器没有进行新建或修改数据的操作。'],
    [401, '用户没有权限（令牌、用户名、密码错误）。'],
    [403, '用户得到授权，但是访问是被禁止的。'],
    [404, '发出的请求针对的是不存在的记录，服务器没有进行操作。'],
    [406, '请求的格式不可得。'],
    [410, '请求的资源被永久删除，且不会再得到的。'],
    [422, '当创建一个对象时，发生一个验证错误。'],
    [500, '服务器发生错误，请检查服务器。'],
    [502, '网关错误。'],
    [503, '服务不可用，服务器暂时过载或维护。'],
    [504, '网关超时。'],
]);


// 添加一个返回拦截器
axios.interceptors.response.use((response) => {
    return response;
  }, (error) => {
      console.log(error.response)
      if(codeMessage.has(error.response.status)){
        message.error(codeMessage.get(error.response.status),1);
      }
    return Promise.reject(error);
  });

const GET = (url, params) => {
    return axios.get(HOSTNAME + url, {
        params
    });
}

// 手机 or Email登录
export const getLogin = (account, password, type) => {
    if (type === 'email') {
        return GET(`/login/${type}`, {
            email: account,
            password
        });
    } else {
        return GET(`/login/${type}`, {
            phone: account,
            password,
            timestamp: timestamp()
        });
    }
}
// 退出
export const getLogout = () => {
    return GET('/logout');
}
// 获取登录状态
export const getLoginStatus = () => {
    return GET('/login/status');
}
export const getSignin = (type) => {
    return GET('/daily_signin', {
        type
    })
}
// 获取喜欢的歌曲的id列表
export const getLikeList = (uid) => {
    return GET('/likelist', {
        uid
    });
}
// 设置喜欢的歌曲，like=false 取消喜欢
export const setLike = (id, like) => {
    return GET('/like', {
        id,
        like,
        timestamp: timestamp()
    });
}
// 获取歌曲详情
export const getSongDetail = (ids) => {
    return GET('/song/detail', {
        ids
    })
}
// 获取歌单详情
export const getPlayListDetail = (id) => {
    return GET('/playlist/detail', {
        id,
        timestamp: timestamp()
    });
}
// 获取歌曲url(可多个 , 用逗号隔开  ?id=405998841,33894312)
export const getSongUrl = (id) => {
    return GET('/song/url', {
        id
    });
}
//未登录时获取的推荐歌单
export const getPersonalizedPlayList = () => {
    return GET('/personalized');
}
// 登录后的日推歌单
export const getRecommendPlayList = () => {
    return GET('/recommend/resource');
}
// 日推歌曲
export const getRecommendSongs = () => {
    return GET('/recommend/songs');
}
// 用户自建&&收藏歌单
export const getUserPlayList = (uid) => {
    return GET('/user/playlist', {
        uid,
        timestamp: timestamp()
    });
}

/**
 * 收藏 or 取消收藏 歌单
 * @param {Number} id 
 * @param {Number} t 1:收藏,2:取消收藏
 */
export const setPlaylistSubscribe = (id, t) => {
    return GET('/playlist/subscribe', {
        t,
        id,
        timestamp: timestamp()
    });
}

// 获取用户订阅信息
export const getUserSubcount = () => {
    return GET('/user/subcount', {
        timestamp: timestamp()
    });
}

/**
 * 对歌单添加或删除歌曲
 * @param {String} op add or del 
 * @param {Number} pid
 * @param  {...Number} id
 */
export const changePlayListSongs = (op, pid, ...ids) => {
    let tracks = ids.join(',');
    return GET('/playlist/tracks', {
        op,
        pid,
        tracks
    });
}

// 获取歌单分类信息
export const getPlayListCategory = () => {
    return GET('/playlist/catlist');
}

/**
 * 获取一类分类的歌单
 * @param {String} cat 分类名 
 * @param {Number} limit 获取数量 
 */
export const getOneCategory = (cat, limit, offset = 0) => {
    // 不手动添加cat，axios会在转义的基础上再次转义
    return GET(`/top/playlist?cat=${encodeURIComponent(cat)}`, {
        limit,
        offset
    });
}

export const getComment = (id, limit, offset = 0) => {
    return GET('/comment/music', {
        id,
        limit,
        offset: offset * limit
    });
}

// 获取专辑内容
export const getAlbum = (id) => {
    return GET('/album', {
        id
    });
}

// 获取歌手信息
export const getArtist = (id) => {
    return GET('/artists', {
        id
    })
}

// 获取歌词
export const getLyric = (id) => {
    return GET('/lyric', {
        id
    });
}

// 获取FM歌曲
export const getPersonalFM = () => {
    return GET('/personal_fm', {
        timestamp: timestamp()
    });
}

// 获取搜索建议
export const getSuggest = (keywords) => {
    return GET('/search/suggest', {
        keywords
    });
}


/**
 * 获取搜索结果
 * @param {String} keywords 关键词
 * @param {Number} type 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
 * @param {Number} offset 偏移量
 * @param {Number} limit 返回数量
 */
export const getSearch = (keywords, type = 1, offset = 0, limit = 100) => {
    return GET(`/search?keywords=${encodeURIComponent(keywords)}`, {
        type,
        offset,
        limit
    })
}