import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Icon, Popover, Slider, message, Modal } from "antd";

import MyIcon from "../../assets/MyIcon";
import { getComment, changePlayListSongs } from "../../util/api";
import { timeConversion, download } from "../../util/util";
import {
  onToggleSong,
  changePlayState,
  setToglleLike,
  changeMode,
  currentTime,
  playAll,
  toogeleSpecifiedSong,
  getoneLyric,
  getFM,
  getuerList
} from "../../redux/actionCreator";
import "./index.scss";

const { ipcRenderer } = window.require("electron");

class PlayBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowLyrics: false,
      playListVisible: false,
      collectVisible: false,
      modeVisble: false,
      commentCount: 0,
      volume: 100,
      hide: false
    };
    this.audioRef = React.createRef();
  }

  componentDidMount() {
    // 全局快捷键按键
    ipcRenderer.on("store-data", (event, store) => {
      this.handleGlobalShortcut(store);
    });

    // 快捷键
    document.addEventListener("keydown", this.handleShortcut);
    window.addEventListener("visibilitychange", this.handleCheckWindow);
  }

  handleGlobalShortcut = e => {
    switch (e) {
      case "volumeUp":
        this.state.volume < 100 && this.handleChangeVolume(this.state.volume + 1);
        break;
      case "volumeDown":
        this.state.volume > 0 && this.handleChangeVolume(this.state.volume - 1);
        break;
      case "nextMusic":
        this.props.onToggleSong(true);
        break;
      case "prevMusic":
        this.props.onToggleSong(false);
        break;
      case "changePlayingStatus":
        this.handleTogglePlayState();
        break;
      case "like":
        this.props.isLogged && this.props.onToggleLike(true);
        break;

      default:
        break;
    }
  };

  handleShortcut = e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (e.key === "Escape" || e.key === "Backspace") {
      this.props.history.goBack();
    }
    if (e.ctrlKey) {
      switch (e.key) {
        case " ":
          e.preventDefault();
          this.handleTogglePlayState();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.state.volume < 100 && this.handleChangeVolume(this.state.volume + 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          this.state.volume > 0 && this.handleChangeVolume(this.state.volume - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          this.props.onToggleSong(true);
          break;
        case "ArrowLeft":
          e.preventDefault();
          this.props.onToggleSong(false);
          break;
        case "L":
        case "l":
          e.preventDefault();
          this.props.isLogged && this.props.onToggleLike(true);
          break;
        default:
          break;
      }
    }
  };

  // 监听窗口是否隐藏
  handleCheckWindow = () => {
    this.setState({
      hide: document.hidden ? true : false
    });
  };

  // 更新当前播放时间
  handleTimeUpdate = e => {
    if (
      !this.state.hide &&
      (this.props.location.pathname === "/musicdetail" || this.props.location.pathname === "/FM")
    ) {
      this.props.onSetCurrentTime(e.currentTarget.currentTime);
    }
  };

  // 播放列表显示与隐藏
  hide = () => {
    this.setState({
      playListVisible: false
    });
  };
  handleVisibleChange = playListVisible => {
    if (!this.props.isFM) {
      this.setState({ playListVisible });
    }
  };

  // 歌词显示切换按钮
  handleToggleShow = () => {
    const isShowLyrics = !this.state.isShowLyrics;
    this.setState({
      isShowLyrics
    });
    if (isShowLyrics && this.props.curTrack !== null) {
      this.props.onGetLyric();
    }
  };

  // 修改音量时
  handleChangeVolume = volume => {
    this.setState({
      volume: volume
    });
    this.audioRef.current.volume = volume / 100;
  };

  // 播放 / 暂停
  handleTogglePlayState = () => {
    this.props.onChangePlayState(!this.props.playInfo.playState);
  };

  handleCleanPlayList = () => {
    // 如果在音乐详情界面，则返回再清除播放列表
    const { location, history } = this.props;
    if (location.pathname === "/musicdetail") {
      history.goBack();
    }

    setTimeout(() => {
      this.props.onCleanPlayList();
    });
    this.setState({
      playListVisible: false
    });
  };

  // 显示音乐详情
  handleShowMusicDetail = () => {
    const { curTrack, location, history, isFM, onGetLyric } = this.props;
    if (curTrack) {
      if (!isFM) {
        location.pathname !== `/musicdetail` && history.push(`/musicdetail`);
      } else {
        location.pathname !== `/FM` && history.push(`/FM`);
      }
      onGetLyric();
    }
  };

  // 获取评论数
  handleGetCommentCount = async id => {
    let res = await getComment(id, 0);
    if (res.data.code === 200) {
      this.setState({
        commentCount: res.data.total > 999 ? "999+" : res.data.total
      });
    }
  };

  /**
   * 收藏歌曲操作
   * @param {Number} pid 歌单id
   * @param {Number} trackIds 操作的歌曲id
   * @param {Boolean} like 操作的是不是我喜欢的歌单
   */
  handleChangePlayListSongs = async (pid, trackIds, like) => {
    const hide = message.loading("添加中...", 0);
    try {
      if (like) {
        this.props.onSetLike(true, trackIds);
      } else {
        let res = await changePlayListSongs("add", pid, trackIds);
        if (res.data.code !== 200) throw new Error("更改歌曲失败！");
      }
      // 关闭加载提示
      setTimeout(hide);
      message.success("添加歌曲成功！", 1);
      this.props.onRefreshUserList();
    } catch (err) {
      setTimeout(hide);
      message.error("添加歌曲失败！", 1);
    }
    this.setState({ collectVisible: false });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.playInfo.playState !== this.props.playInfo.playState) {
      if (/^.*?\.(mp3|wav|flac|ape|aac|ogg)$/.test(this.audioRef.current.src)) {
        if (this.props.playInfo.playState) {
          this.audioRef.current.play();
        } else {
          this.audioRef.current.pause();
        }
      }
    }

    // 切歌时
    if (
      this.props.curTrack &&
      this.props.curTrack.id !== (prevProps.curTrack && prevProps.curTrack.id)
    ) {
      // 获取评论数
      this.handleGetCommentCount(this.props.curTrack.id);

      // 获取歌词
      if (
        this.state.isShowLyrics ||
        this.props.location.pathname === "/FM" ||
        this.props.location.pathname === "/musicdetail"
      ) {
        this.props.onGetLyric();
      }

      // FM最后一首歌，添加FM歌曲
      if (this.props.isFM && this.props.tracksLength - 1 === this.props.curIndex) {
        this.props.onAddFM();
      }

      // 没有版权，全局提示
      if (this.props.songData.url === null) {
        message.error("( •̥́ ˍ •̀ू ) 亲，不是会员或没有版权呢！");
        if (this.props.playInfo.playState) {
          this.props.onChangePlayState(false);
        }
      }
    }

    // 播放时间跳转
    if (this.props.playInfo.isGoto) {
      this.audioRef.current.currentTime = this.props.playInfo.currentTime;
      if (!this.props.playInfo.playState) {
        this.props.onChangePlayState(true);
      }
    }
  }

  // 点击对应收藏列表时
  handleClickMenuItem = (type, data) => {
    this.setState({ modeVisble: false });

    switch (type) {
      case "download":
        const { songData, curTrack, singers } = this.props;
        download(songData.url, curTrack.name + " - " + singers);
        break;

      case "collect":
        this.handleChangePlayListSongs(data.pid, data.id, data.like);
        break;

      default:
        break;
    }
  };

  render() {
    const {
      onToogeleSpecifiedSong,
      onChangeMode,
      onToggleLike,
      onToggleSong,
      playInfo,
      tracksLength,
      curTrack,
      singers,
      songData,
      isLogged,
      isLike,
      curIndex,
      tracks
    } = this.props;

    // 音量
    const volumeBar = (
      <div id="bar-volume-bar">
        <Slider
          vertical
          defaultValue={100}
          value={this.state.volume}
          onChange={this.handleChangeVolume}
        />
      </div>
    );

    // 收藏歌曲弹出的对话框
    const collectModal = (
      <Modal
        visible={this.state.collectVisible}
        title={"收藏到..."}
        onCancel={() => {
          this.setState({ collectVisible: false });
        }}
        footer={null}
        width={350}
        className="collect-modal"
      >
        <table className="collect-modal-table">
          <tbody>
            {this.props.userPlayList.map((oneData, index) => {
              return (
                <tr
                  key={"collectModal" + index}
                  onClick={this.handleClickMenuItem.bind(this, "collect", {
                    pid: oneData.id,
                    id: this.props.curTrack && this.props.curTrack.id,
                    like: index === 0
                  })}
                >
                  <td className="left">
                    <img src={oneData.coverImgUrl} alt="" className="cover" />
                    <p className="name">{index === 0 ? "我喜欢的歌曲" : oneData.name}</p>
                  </td>
                  <td className="right">
                    <p>{oneData.trackCount}首</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal>
    );

    // 播放模式
    const playMode = (
      <div id="bar-play-menu">
        {curTrack && songData.url && (
          <MyIcon
            type="icon-xiazai"
            className="bar-icon icon-download"
            onClick={this.handleClickMenuItem.bind(this, "download")}
          />
        )}
        {isLogged && curIndex >= 0 && (
          <MyIcon
            type="icon-Add-Folder"
            className="bar-icon"
            onClick={() => {
              this.setState({ collectVisible: true, modeVisble: false });
            }}
          />
        )}

        <div id="play-mode">
          <MyIcon
            type="icon-xunhuan"
            className={playInfo.mode === 1 ? "bar-icon bar-icon-loop" : "none"}
            onClick={() => {
              onChangeMode(2);
            }}
          />
          <MyIcon
            type="icon-shunxubofang"
            className={playInfo.mode === 2 ? "bar-icon bar-icon-order" : "none"}
            onClick={() => {
              onChangeMode(3);
            }}
          />
          <MyIcon
            type="icon-danqutongbu"
            className={playInfo.mode === 3 ? "bar-icon bar-icon-single" : "none"}
            onClick={() => {
              onChangeMode(4);
            }}
          />
          <MyIcon
            type="icon-suijibofang"
            className={playInfo.mode === 4 ? "bar-icon bar-icon-random" : "none"}
            onClick={() => {
              onChangeMode(1);
            }}
          />
        </div>
      </div>
    );

    // 播放列表头部
    const playListTitle = (
      <div className="bar-play-list-title">
        <h4>播放列表</h4>
        <Icon type="close" className="play-list-close" onClick={this.hide} />
      </div>
    );

    // 播放列表内容
    const playListContent = (
      <div className="bar-play-list-content">
        <div className="play-list-content">
          <div className="play-list-button">
            <p className="play-list-count">总{tracks.length}首</p>
            <p className="play-list-clean" onClick={this.handleCleanPlayList}>
              <MyIcon type="icon-laji" />
              清空
            </p>
          </div>
          {tracks.map((track, index) => {
            let singers = [];
            let ar = track.ar ? "ar" : "artists";
            track[ar].map(one => singers.push(one.name));

            return (
              <div
                className="play-list-one"
                key={index}
                onDoubleClick={onToogeleSpecifiedSong.bind(this, index, track.id)}
              >
                {curIndex === index &&
                  (playInfo.playState ? (
                    <MyIcon type="icon-bofangzanting" className="play-list-icon" />
                  ) : (
                    <MyIcon type="icon-bofang" className="play-list-icon" />
                  ))}
                <p className="play-list-name">{track.name}</p>
                <p className="play-list-singer">{singers.join("/")}</p>
                <p className="play-list-time">{timeConversion(track.dt || track.duration)}</p>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div id="play-bar">
        <div id="bar-left" style={{ width: !isLogged || curIndex < 0 ? "95px" : "190px" }}>
          <div
            className={`bar-lyrices ${this.state.isShowLyrics ? "bar-show-lyrices" : ""}`}
            onClick={() => {
              this.handleToggleShow();
              message.info("_(:з」∠)_ 该功能尚未完善！");
            }}
          >
            词
          </div>

          <Popover content={volumeBar} trigger="click">
            <MyIcon
              type={this.state.volume === 0 ? "icon-jingyin" : "icon-shengyin"}
              className="bar-icon"
            />
          </Popover>

          {isLogged && curIndex >= 0 && (
            <>
              <MyIcon
                type={isLike ? "icon-aixin-red-copy" : "icon-aixin-copy-copy-copy"}
                className="bar-icon"
                onClick={() => {
                  onToggleLike(!isLike);
                }}
              />

              <div
                id="bar-comment"
                onClick={() => {
                  message.info("_(:з」∠)_ 该功能尚未完善！");
                }}
              >
                <MyIcon type="icon-pinglundianjizhuang" className="bar-icon bar-icon-comment" />
                <p id="bar-comment-num">{this.state.commentCount}</p>
              </div>
            </>
          )}
          <Popover
            content={playMode}
            trigger="click"
            visible={this.state.modeVisble}
            onVisibleChange={modeVisble => {
              this.setState({ modeVisble });
            }}
          >
            <MyIcon type="icon-caidan" className="bar-icon" />
          </Popover>
        </div>

        <div id="bar-center">
          <Icon
            type="step-backward"
            className="bar-icon play-icon"
            onClick={() => {
              onToggleSong(false);
            }}
          />

          <MyIcon
            type={playInfo.playState ? "icon-bofangzanting" : "icon-bofang"}
            className="bar-icon play-icon play-icon-center"
            onClick={this.handleTogglePlayState}
          />

          <Icon
            type="step-forward"
            className="bar-icon play-icon"
            onClick={() => {
              onToggleSong(true);
            }}
          />
        </div>

        <div id="bar-right">
          <div className="bar-right-frist">
            <p className="song-name" onClick={this.handleShowMusicDetail.bind(this)}>
              {curTrack ? `${curTrack.name}      ${singers}` : "Σ( ° △ °|||)︴播放列表空辽！"}
            </p>
          </div>
          <Popover
            trigger="click"
            title={playListTitle}
            content={playListContent}
            placement="topRight"
            visible={this.state.playListVisible}
            onVisibleChange={this.handleVisibleChange}
          >
            <p className={this.props.isFM ? "" : "right-song-list"}>
              {this.props.isFM
                ? "FM"
                : `${playInfo.currentIndex === -1 ? 0 : playInfo.currentIndex + 1}/${tracksLength}`}
            </p>
          </Popover>
        </div>

        {collectModal}

        <audio
          ref={this.audioRef}
          autoPlay={true}
          src={songData && songData.url ? songData.url : ""}
          preload="auto"
          loop={playInfo.mode === 3 ? true : false}
          onEnded={this.props.onToggleSong.bind(this, true, true)}
          onTimeUpdate={this.handleTimeUpdate.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  let tracks = state.playInfo && state.playInfo.tracks;
  let tracksLength = state.playInfo.tracks.length;
  let curIndex = state.playInfo.currentIndex;
  let curTrack = curIndex >= 0 && tracksLength >= 0 ? tracks[curIndex] : null;

  let singers = "";

  if (curTrack && curTrack.artists) {
    curTrack.artists.forEach(e => {
      singers += e.name + "/";
    });
  } else if (curTrack && curTrack.ar) {
    curTrack.ar.forEach(e => {
      singers += e.name + "/";
    });
  }
  singers = singers.substring(0, singers.length - 1);

  let isLike =
    state.playInfo.likeList.size !== undefined &&
    state.playInfo.likeList.has(curTrack && curTrack.id);

  return {
    isLogged: state.user.isLogged,
    playInfo: state.playInfo,
    songData: state.playInfo.songData,
    isFM: state.playInfo.isFM,
    userPlayList: state.playList.userPlayList,
    tracksLength,
    curIndex,
    curTrack,
    singers,
    isLike,
    tracks
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onToggleSong: (isNext, isAuto = false) => {
      dispatch(onToggleSong(isNext, isAuto));
    },
    onChangePlayState: playState => {
      dispatch(changePlayState(playState));
    },
    onToggleLike: isLike => {
      dispatch(setToglleLike(isLike));
    },
    onChangeMode: mode => {
      dispatch(changeMode(mode));
    },
    onCleanPlayList: () => {
      dispatch(playAll([]));
    },
    onToogeleSpecifiedSong: (index, id) => {
      dispatch(toogeleSpecifiedSong(index, id));
    },
    onGetLyric: () => {
      dispatch(getoneLyric());
    },
    onSetCurrentTime: time => {
      dispatch(currentTime(time));
    },
    onAddFM: () => {
      dispatch(getFM());
    },
    onSetLike: (like, id) => {
      dispatch(setToglleLike(like, id));
    },
    onRefreshUserList: () => {
      dispatch(getuerList());
    }
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PlayBar)
);
