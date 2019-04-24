import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { message } from "antd";
import { Menu, Item, animation, contextMenu, Separator, Submenu, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.min.css";
import MyIcon from "../../assets/MyIcon";
import "./index.scss";
import {
  toogeleSpecifiedSong,
  playAll,
  insertSongToPlay,
  setToglleLike
} from "../../redux/actionCreator";
import { changePlayListSongs, getSongDetail } from "../../util/api";

/**
 * @property {Array} playlist {tracks}
 * @property {String} artistsName
 * @property {String} albumName
 * @property {Function} changeCount
 */
class SongList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 右键点击的歌曲
      rightClickTrack: {},
      // 右键点击的歌曲的索引
      rightClickIndex: -1
    };
  }

  onHandleSetLike = (like, id, event) => {
    event.stopPropagation();
    this.setState({ triggerRender: !this.state.triggerRender });
    this.props.handleSetLike(like, id);
  };

  handleShowMenu = (track, index, e) => {
    this.setState({
      rightClickTrack: track,
      rightClickIndex: index
    });
    contextMenu.show({
      id: "list-menu",
      event: e
    });
  };

  handleRedirect = (id, type) => {
    this.props.history.push(`/playlistdetail/${type}/${id}`);
  };

  /**
   * 歌单——收藏歌曲 & 删除歌曲操作
   * @param {String} op 操作 add or del
   * @param {Number} pid 歌单id
   * @param {Number} trackIds 操作的歌曲id
   * @param {Boolean} like 操作的是不是我喜欢的歌单
   */
  handleChangePlayListSongs = async (op, pid, trackIds, like) => {
    const hide = message.loading("添加中...", 0);

    try {
      if (like) {
        this.props.handleSetLike(op === "add" ? true : false, trackIds);
      } else {
        let res = await changePlayListSongs(op, pid, trackIds);
        if (res.data.code !== 200) throw new Error("更改歌曲失败！");
      }
      if (op === "del") {
        this.props.playlist.tracks.splice(this.state.rightClickIndex, 1);
        this.setState({ rightClickIndex: -1, rightClickTrack: {} });
        this.props.changeCount(this.props.playlist.tracks.length);
      }
      // 关闭加载提示
      setTimeout(hide);
      message.success(op === "add" ? "添加歌曲成功！" : "删除歌曲成功！", 1);
    } catch (err) {
      setTimeout(hide);
      message.error(op === "add" ? "添加歌曲失败！" : "删除歌曲失败！", 1);
    }
  };

  render() {
    const {
      playlist,
      likeList,
      currSongId,
      handlePlaySong,
      isLogged,
      userPlayList,
      userId,
      artistsName,
      albumName
    } = this.props;
    const { tracks } = playlist;
    return (
      <div className="song-list">
        <table className="list-table">
          <thead>
            <tr className="list-row-head">
              <th className="list-head-null" />
              {isLogged && <th className="list-head-null" />}
              <th className="list-head">歌名</th>
              <th className="list-head">歌手</th>
              <th className="list-head">专辑</th>
            </tr>
          </thead>
          <tbody>
            {tracks &&
              tracks.map((track, index) => {
                return (
                  <tr
                    key={index}
                    className="list-row"
                    onContextMenu={this.handleShowMenu.bind(this, track, index)}
                    onDoubleClick={handlePlaySong.bind(this, index, track, 1, tracks)}
                  >
                    <td className="list-count">
                      {currSongId === track.id ? (
                        <MyIcon type="icon-shengyin1" style={{ fontSize: "20px" }} />
                      ) : index < 9 ? (
                        "0" + (index + 1)
                      ) : (
                        index + 1
                      )}
                    </td>
                    {isLogged && (
                      <td className="list-action">
                        <MyIcon
                          type={
                            likeList.has(track.id) ? "icon-aixin-red-copy" : "icon-aixin-list-copy"
                          }
                          className="list-heart"
                          onClick={this.onHandleSetLike.bind(
                            this,
                            likeList.size !== undefined && !likeList.has(track.id),
                            track.id
                          )}
                        />
                      </td>
                    )}
                    <td className="list-song list-song-name">
                      <span className="list-span">{track.name}</span>
                    </td>
                    <td className="list-song">
                      <span className="list-span">
                        {track[artistsName] &&
                          track[artistsName].map((a, i) => {
                            return (
                              <span key={i + index * 9999}>
                                <p
                                  className="list-song-artist"
                                  onClick={this.handleRedirect.bind(this, a.id, "artist")}
                                >
                                  {a.name}
                                </p>
                                {i !== track[artistsName].length - 1 && "/"}
                              </span>
                            );
                          })}
                      </span>
                    </td>
                    <td className="list-song list-song-album">
                      <span
                        className="list-span"
                        onClick={this.handleRedirect.bind(this, track[albumName].id, "album")}
                      >
                        {track[albumName].name}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <Menu
          id="list-menu"
          animation={animation.zoom}
          theme={theme.light}
          style={{ zIndex: 9999 }}
        >
          <Item onClick={handlePlaySong.bind(this, null, this.state.rightClickTrack, 2)}>
            <MyIcon type="icon-bofang2" className="list-menu-icon" />
            播放
          </Item>
          <Item onClick={handlePlaySong.bind(this, null, this.state.rightClickTrack, 3)}>
            <MyIcon type="icon-xiayishoubofang" className="list-menu-icon" />
            下一首播放
          </Item>
          {isLogged && (
            <>
              <Separator />
              <Submenu
                label={
                  <>
                    <MyIcon type="icon-tianjiawenjianjia" className="list-menu-icon" />
                    收藏的歌单
                  </>
                }
                arrow={<MyIcon type="icon-bofang4" className="list-menu-collect" />}
              >
                {userPlayList &&
                  userPlayList.map((list, index) => {
                    return (
                      <Item
                        key={list.id}
                        onClick={this.handleChangePlayListSongs.bind(
                          this,
                          "add",
                          list.id,
                          this.state.rightClickTrack.id,
                          index === 0
                        )}
                      >
                        <MyIcon type="icon-gedan" className="list-menu-icon" />
                        {index === 0 ? "我喜欢的音乐" : list.name}
                      </Item>
                    );
                  })}
              </Submenu>
            </>
          )}
          {playlist.userId === userId && (
            <>
              <Separator />
              <Item
                onClick={this.handleChangePlayListSongs.bind(
                  this,
                  "del",
                  playlist.id,
                  this.state.rightClickTrack.id
                )}
              >
                <MyIcon type="icon-laji" className="list-menu-icon" />
                从歌单中删除
              </Item>
            </>
          )}
        </Menu>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.user.userInfo.account.id,
    likeList: state.playInfo.likeList,
    currSongId:
      state.playInfo.tracks[state.playInfo.currentIndex] &&
      state.playInfo.tracks[state.playInfo.currentIndex].id,
    isLogged: state.user.isLogged,
    userPlayList: state.playList.userPlayList
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * 鼠标事件：歌单播放歌曲
     * @param {Object} track
     * @param {Number} type
     * type:1 播放该歌单,并直接跳到该歌曲播放  index,type,tracks
     * type:2 播放该歌曲
     * type:3 下一首播放
     */
    handlePlaySong: async (index, track, type, tracks) => {
      if (/^\/search\//g.test(ownProps.location.pathname)) {
        type = type === 1 ? 2 : type;
        let res = await getSongDetail(track.id);
        if (res.data.code === 200 && res.data.songs.length > 0) {
          track = res.data.songs[0];
        }
      }
      switch (type) {
        case 1:
          dispatch(playAll(tracks));
          dispatch(toogeleSpecifiedSong(index, track.id));
          break;
        case 2:
          dispatch(insertSongToPlay(0, track));
          break;
        case 3:
          dispatch(insertSongToPlay(1, track));
          break;
        default:
          break;
      }
    },

    handleSetLike: (like, id) => {
      dispatch(setToglleLike(like, id));
    }
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SongList)
);
