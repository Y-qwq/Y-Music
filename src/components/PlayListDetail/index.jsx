import React, { Component } from "react";
import { connect } from "react-redux";
import { Icon, Spin } from "antd";

import {
  getPlayListDetail,
  setPlaylistSubscribe,
  getRecommendSongs,
  getAlbum,
  getArtist
} from "../../util/api.js";
import MyIcon from "../../assets/MyIcon";
import { playAll, onToggleSong, addPlayAll, getuerList } from "../../redux/actionCreator";
import { download } from "../../util/util.js";
import { PlayAll, Collected, Collect } from "../Button";
import SongList from "../SongList";
import "./index.scss";

class PlayListDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createrId: -1, // 歌单创始人ID
      detail: { tracks: [], name: "" }, //歌单信息
      showDescription: false, //是否显示简介
      artistsName: "ar", // 歌手的变量名
      albumName: "al", // 专辑变量名
      coverImgUrl: "",
      renderFlag: false
    };
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    this.switchType();
  }

  componentDidUpdate(preProps) {
    if (this.props.match.params.id !== preProps.match.params.id) {
      this.switchType();
      this.contentRef.current.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    this.contentRef = null;
  }

  switchType = async () => {
    this.setState({ renderFlag: true });
    const {
      match: {
        params: { id, type }
      }
    } = this.props;
    if (type === "album") {
      await this.handleGetAlbumsSonogs(id);
    }
    if (type === "artist") {
      await this.handleGetArtistInfo(id);
    }
    if (type === "playlist") {
      if (id === "0") {
        // 获取日推歌单
        await this.handleGetRecommendSongs();
      } else {
        // 获取普通歌单
        await this.handleGetPlayListDetail(id);
      }
    }
    this.setState({ renderFlag: false });
  };

  // 获取日推歌曲
  handleGetRecommendSongs = async () => {
    let res = await getRecommendSongs();
    res.data.code === 200 &&
      this.setState({
        detail: { tracks: res.data.recommend, name: "每日歌单推荐" },
        artistsName: "artists",
        albumName: "album",
        coverImgUrl: res.data.recommend[0].album.picUrl
      });
  };

  // 获取歌单歌曲
  handleGetPlayListDetail = async id => {
    let res = await getPlayListDetail(id);
    res.data.code === 200 &&
      this.setState({
        artistsName: "ar",
        albumName: "al",
        detail: res.data.playlist,
        createrId: res.data.playlist.userId,
        coverImgUrl: res.data.playlist.coverImgUrl
      });
  };

  // 获取专辑歌曲
  handleGetAlbumsSonogs = async id => {
    let res = await getAlbum(id);
    if (res.data.code === 200) {
      res.data.album.tracks = res.data.songs;
      this.setState({
        artistsName: "ar",
        albumName: "al",
        coverImgUrl: res.data.album.picUrl,
        detail: res.data.album,
        createrId: -1
      });
    }
  };

  // 获取歌手信息&歌曲
  handleGetArtistInfo = async id => {
    let res = await getArtist(id);
    if (res.data.code === 200) {
      res.data.artist.tracks = res.data.hotSongs;
      res.data.artist.description = res.data.artist.briefDesc;
      this.setState({
        artistsName: "ar",
        albumName: "al",
        coverImgUrl: res.data.artist.img1v1Url,
        detail: res.data.artist,
        createrId: -1
      });
    }
  };

  // 切换是否显示全简介
  handleShowDescription = () => {
    this.setState({
      showDescription: !this.state.showDescription
    });
  };

  // 更改歌单收藏状态
  handleToggleCollect = async () => {
    let subscribed = this.state.detail.subscribed;
    let t = subscribed ? 2 : 1;
    let res = await setPlaylistSubscribe(this.state.detail.id, t);
    if (res.data.code === 200) {
      this.setState({
        detail: {
          ...this.state.detail,
          subscribed: !subscribed,
          subscribedCount: this.state.detail.subscribedCount + (t === 1 ? 1 : -1)
        }
      });
      this.props.refreshCollect();
    }
  };

  // 更改歌曲数目
  handleChangeCount = count => {
    this.setState({
      detail: {
        ...this.state.detail,
        trackCount: count
      }
    });
  };

  // 添加所有歌曲到播放列表
  handleAddPlayAll = () => {
    this.props.onAddPlayAll(this.state.detail.tracks, this.props.tracks.length === 0);
  };

  // 下载封面
  handleDownloadCover = (url, name) => {
    const type = /.*?\.(jpg|bmp|gif|ico|pcx|jpeg|png)$/.exec(url);
    if (type) {
      name = name + "." + type[1];
    }
    download(url, name);
  };


  render() {
    const { showDescription, detail, artistsName, albumName, coverImgUrl, createrId } = this.state;
    const { onPlayAll, match, isLogged, userId } = this.props;
    return (
      <div className="list-detail" ref={this.contentRef} >
        <Spin spinning={this.state.renderFlag} size="large">
          <div className="list-info">
            <img src={coverImgUrl} alt="" draggable={false} className="list-pic" />
            <MyIcon
              type="icon-xiangji_"
              className="download-cover"
              onClick={this.handleDownloadCover.bind(this, coverImgUrl, detail.name)}
            />
            <div className="list-description">
              <h1>{detail.name}</h1>
              <div className="list-buttons">
                <PlayAll
                  fontSize="16px"
                  onClickPlayAll={() => {
                    onPlayAll(detail.tracks);
                  }}
                  onClickAddPlayAll={this.handleAddPlayAll}
                />
                {match.params.id !== "0" && match.params.type === "playlist" && isLogged ? (
                  detail.subscribed ? (
                    <Collected
                      num={detail.subscribedCount}
                      onClickToggle={this.handleToggleCollect}
                      disabled={userId === createrId}
                    />
                  ) : (
                    <Collect
                      num={detail.subscribedCount}
                      onClickToggle={this.handleToggleCollect}
                      disabled={userId === createrId}
                    />
                  )
                ) : (
                  ""
                )}
                {/* <DownloadAll /> */}
              </div>
              <p className="list-count">
                歌曲数：
                {detail.tracks.length}
              </p>
              {detail.tags && detail.tags.length > 0 && (
                <p className="list-tags">标签：{detail.tags.join("/")}</p>
              )}
              {detail.description && (
                <>
                  <p
                    className={
                      showDescription
                        ? "list-description-detail-show"
                        : "list-description-detail-unshow"
                    }
                  >
                    简介：{detail.description}
                  </p>
                  <Icon
                    type="down"
                    className={`list-description-more ${showDescription &&
                      "list-description-more-true"}`}
                    onClick={this.handleShowDescription}
                  />
                </>
              )}
            </div>
          </div>
          {Object.keys(detail).length !== 0 && (
            <SongList
              playlist={detail}
              artistsName={artistsName}
              albumName={albumName}
              changeCount={count => this.handleChangeCount(count)}
            />
          )}
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isLogged: state.user.isLogged,
    tracks: state.playInfo.tracks,
    userId: state.user.userInfo.account.id
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onPlayAll: playlist => {
      dispatch(playAll(playlist));
      dispatch(onToggleSong(true, false, true));
    },
    onAddPlayAll: (tracks, play) => {
      // 歌单没有，则立即播放歌曲
      if (play) {
        dispatch(addPlayAll(tracks));
        dispatch(onToggleSong(true, false, true));
      } else {
        dispatch(addPlayAll(tracks));
      }
    },
    // 刷新收藏的歌单
    refreshCollect: () => {
      dispatch(getuerList());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayListDetail);
