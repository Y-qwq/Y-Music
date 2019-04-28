import React, { Component } from "react";
import { connect } from "react-redux";
import { easeCubicOut } from "d3-ease";
import { Animate } from "react-move";

import MyIcon from "../../assets/MyIcon.js";
import { currentTime } from "../../redux/actionCreator";
import { timeConversion, download } from "../../util/util";
import "./index.scss";

// 进度条宽度
const MAX_BAR_WIDTH = 520;

export class MusicDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      marginTop: (window.innerHeight / 10 - 71.5) * 2.5,
      width: window.innerWidth / 5 + 750,
      height: window.innerHeight - 86 - 95,
      curTimeBarWidth: 0, // 拖拽时的进度条长度
      curLineIndex: -1 // 歌词 当前行
    };
    // 进度条Ref
    this.barRef = React.createRef();
    // 歌词Ref
    this.lrcScrollRef = React.createRef();

    // 定时器
    this.easiingTimer = null;
    this.scrollingTimer = null;

    // flag
    this.moving = false;
    this.wheeling = false;
    this.barLeft = 0;

    // 1 / scale缩小的值,用于解决缩小后拖动进度条不准问题
    this.scale = 1;

    this.handleChangeSize.bind(this);
    this.handleClickMove.bind(this);
    this.handleClickUp.bind(this);
  }

  componentDidMount() {
    if (this.props.location.pathname === "/FM") this.scale = 1 / 0.9;
    this.lrcScrollRef.current.onwheel = this.handleWheeling;
    window.addEventListener("resize", this.handleChangeSize);
    window.addEventListener("mousemove", this.handleClickMove);
    window.addEventListener("mouseup", this.handleClickUp);
  }

  componentWillUnmount() {
    this.barRef = null;
    this.lrcScrollRef = null;
    clearTimeout(this.easiingTimer);
    clearTimeout(this.scrollingTimer);
    window.removeEventListener("resize", this.handleChangeSize);
    window.removeEventListener("mousemove", this.handleClickMove);
    window.removeEventListener("mouseup", this.handleClickUp);
  }

  componentDidUpdate(preProps, preState) {
    // 时间变化检测是否歌词移动
    if (this.props.curTime !== preProps.curTime) {
      this.handleCheckLrc(this.props.curTime);
    }

    // 滚动歌词
    if (!this.wheeling && preState.curLineIndex !== this.state.curLineIndex) {
      this.handleEasing();
    }
  }

  // 改变尺寸时调整位置
  handleChangeSize = () => {
    this.setState({
      width: window.innerWidth / 5 + 750,
      height: window.innerHeight - 86 - 95,
      marginTop: (window.innerHeight / 10 - 71.5) * 2.5
    });
    this.barLeft = this.barRef.current.getBoundingClientRect().left;
  };
  // 拖动时更改进度条长度
  handleChangeTimeBar = e => {
    const curTimeBarWidth = (e.clientX - this.barLeft) * this.scale;
    this.setState({ curTimeBarWidth });
  };

  // 进度条按下时
  handleClickDown = e => {
    e.stopPropagation();
    if (/^.*?\.(mp3|wav|flac|ape|aac|ogg)$/.test(this.props.songData.url)) {
      this.barLeft = this.barRef.current.getBoundingClientRect().left;
      this.setState({
        barLeft: this.barRef.current.getBoundingClientRect().left
      });
      this.moving = true;
      const curTimeBarWidth = (e.clientX - this.barLeft) * this.scale;
      this.setState({ curTimeBarWidth });
    }
  };
  // 移动进度条时
  handleClickMove = e => {
    if (this.moving) {
      let curTimeBarWidth = (e.clientX - this.barLeft) * this.scale;
      curTimeBarWidth = curTimeBarWidth > MAX_BAR_WIDTH ? MAX_BAR_WIDTH : curTimeBarWidth;
      curTimeBarWidth = curTimeBarWidth < 0 ? 0 : curTimeBarWidth;
      this.setState({
        curTimeBarWidth
      });
    }
  };
  // 松开进度条时
  handleClickUp = e => {
    if (this.moving === true) {
      e.stopPropagation();
      this.moving = false;
      this.props.onGotoTime(this.widthToTime(), true);

      this.handleCheckLrc(this.widthToTime() * 1000);
    }
  };

  // 检测歌词是否需要跳转
  handleCheckLrc = curTime => {
    let curLineIndex = -1;
    const { lrc } = this.props;
    for (const index of lrc.keys()) {
      if (curTime / 1000 - 0.1 < lrc[index][0]) {
        curLineIndex = index === 0 ? 0 : index - 1;
        break;
      }
    }
    if (curLineIndex === -1) curLineIndex = lrc.length - 1;

    this.setState({ curLineIndex });
  };

  // 当前宽度转化为时间 单位:s
  widthToTime = () => {
    const totalTime = Math.floor((this.props.curTrack.dt || this.props.curTrack.duration) / 1000);
    return (this.state.curTimeBarWidth / MAX_BAR_WIDTH) * totalTime;
  };

  // 歌词缓动
  handleEasing = () => {
    clearTimeout(this.easiingTimer);
    if (this.lrcScrollRef.current) {
      // 获取目标元素 相对父元素top
      const next = document.getElementsByClassName("song-line-next")[0];
      // 移动到相对歌词框顶部位置
      const targetTop = next ? next.offsetTop - 160 : 99999;
      const curScrollTop = this.lrcScrollRef.current.scrollTop;
      const diff = targetTop - curScrollTop;

      // t: 当前时间； b: 初始值；c: 变化量； d: 持续时间
      let b = curScrollTop,
        c = diff,
        d = 30,
        t = 0;

      const run = () => {
        this.lrcScrollRef.current.scrollTop = b + Math.ceil(c * easeCubicOut((t += 1 / d)));
        this.easiingTimer = setTimeout(run, 1000 / 60);
        if (t >= 1) {
          clearTimeout(this.easiingTimer);
        }
      };
      run();
    }
  };

  // 歌词渲染
  renderLrc = () => {
    const { lrc } = this.props;
    return lrc.map((line, index) => {
      return (
        <span
          key={index}
          className={
            this.state.curLineIndex === index
              ? "song-line"
              : this.state.curLineIndex + 1 === index
              ? "song-line-next"
              : ""
          }
        >
          <p className="song-lyric">{line[1] !== "" ? line[1] : "\n"}</p>
          {lrc[index][2] !== undefined && <p className="song-tlyric">{line[2]}</p>}
        </span>
      );
    });
  };

  // 手动滚动歌词中，取消歌词缓动效果
  handleWheeling = () => {
    this.wheeling = true;
    clearTimeout(this.scrollingTimer);
    this.scrollingTimer = setTimeout(() => {
      this.wheeling = false;
      clearTimeout(this.scrollingTimer);
    }, 2000);
  };

  // 下载封面
  handleDownloadCover = (url, name) => {
    const type = /.*?\.(jpg|bmp|gif|ico|pcx|jpeg|png)$/.exec(url);
    if (type) {
      name = name + "." + type[1];
    }
    download(url, name);
  };

  handleClickArtist = id => {
    this.props.history.push(`/playlistdetail/artist/${id}`);
  };

  render() {
    const { curTrack, curTime, lrc } = this.props;
    if (curTrack) {
      let barWidth = (curTime / (curTrack.dt || curTrack.duration)) * MAX_BAR_WIDTH;
      barWidth = barWidth > MAX_BAR_WIDTH ? MAX_BAR_WIDTH : barWidth;

      let singers = [];
      const ar = curTrack.ar ? "ar" : "artists";
      curTrack[ar].map(one => singers.push([one.id, one.name]));

      return (
        <Animate
          start={{
            scale: 0.1,
            opacity: 0
          }}
          enter={{
            scale: [this.props.location.pathname === "/FM" ? 0.9 : 1],
            opacity: [1],
            width: this.state.width,
            height: this.state.height,
            timing: { duration: 300 }
          }}
          update={{
            width: this.state.width,
            height: this.state.height,
            marginTop: this.state.marginTop
          }}
        >
          {({ opacity, scale, height, width, marginTop }) => {
            return (
              <div
                className="music-detail"
                style={{
                  transform: `scale(${scale})`,
                  height,
                  opacity,
                  gridColumn: this.props.location.pathname === "/FM" ? "2" : "1/3",
                  transformOrigin: this.props.location.pathname === "/FM" ? "center" : "bottom left"
                }}
              >
                <div
                  className="content"
                  style={{
                    marginTop,
                    width
                  }}
                >
                  <div className="left-song-info">
                    <h1>{curTrack.name}</h1>
                    <div className="song-artists">
                      {singers.map((ar, idx) => {
                        return (
                          <span key={"ar" + idx}>
                            <p
                              className="song-one-artist"
                              onClick={this.handleClickArtist.bind(this, ar[0])}
                            >
                              {ar[1]}
                            </p>
                            <p>{singers.length - 1 !== idx && " / "}</p>
                          </span>
                        );
                      })}
                    </div>
                    <article className="song-lyrics" ref={this.lrcScrollRef}>
                      <div className="lyrics-context">
                        {lrc.length > 0 ? (
                          this.renderLrc()
                        ) : (
                          <p className="song-lyric-none">⊙ω⊙ 没有歌词！</p>
                        )}
                      </div>
                    </article>
                  </div>
                  <div className="right-play-info">
                    <img src={this.props.curUrl} alt="" className="song-cover" draggable={false} />
                    <div className="play-time">
                      {this.moving
                        ? timeConversion(this.widthToTime() * 1000)
                        : timeConversion(curTime)}
                      /{timeConversion(curTrack.dt || curTrack.duration)}
                    </div>
                    <MyIcon
                      type="icon-xiangji_"
                      className="download-cover"
                      onClick={this.handleDownloadCover.bind(
                        this,
                        this.props.curUrl,
                        curTrack.name
                      )}
                    />
                    <div className="total-time-bar" onMouseDown={e => this.handleClickDown(e)}>
                      <div
                        className="current-time-bar"
                        ref={this.barRef}
                        style={{
                          width: this.moving ? this.state.curTimeBarWidth : barWidth
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Animate>
      );
    } else {
      return <div />;
    }
  }
}

const mapStateToProps = state => {
  const tracks = state.playInfo.tracks;
  const curIndex = state.playInfo.currentIndex;
  const curTrack = tracks[curIndex];

  let curUrl = null;
  if (curTrack && curTrack.al && curTrack.al.picUrl) {
    curUrl = curTrack.al.picUrl;
  } else if (curTrack && curTrack.album && curTrack.album.picUrl) {
    curUrl = curTrack.album.picUrl;
  }

  return {
    curUrl,
    curTrack,
    lrc: state.playInfo.lrc,
    isFM: state.playInfo.isFM,
    songData: state.playInfo.songData,
    curTime: Math.floor(state.playInfo.currentTime * 1000)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onGotoTime: time => {
      dispatch(currentTime(time, true));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MusicDetail);
