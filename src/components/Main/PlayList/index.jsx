import React, { Component } from "react";
import MyIcon from "../../../assets/MyIcon";
import { connect } from "react-redux";
import { getOnePlayListDetail, setOffset } from "../../../redux/actionCreator";
import "./index.scss";

class PlayList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: "picUrl",
      playList: [],
      playListWidth: "",
      type: "find", // 当前组件显示的内容
      showListName: 0, // 显示该id歌单名字
      translateX: 0 // 位移量
    };
    // 组件是否要卸载 用于取消componentWillReceiveProps事件，防止内存泄漏
    this.isUnmount = false;

    // 暂存定时器
    this.timer = null;

    // 区分拖动与点击事件
    this.downTime = null;
    this.upTime = null;

    //存储星期x
    this.week = null;

    // 歌单拖动相关
    // 直接监听window，然后事件处理时取消冒泡，以达到鼠标即使移出歌单的div也能继续移动的效果
    window.onmouseup = e => this.handleStopMove(e);
    window.onmousemove = e => this.handleMoving(e);
    window.onresize = () => this.offsetListener(this.state.translateX);
    this.lastX = null;
    this.moving = false;
  }

  componentDidMount() {
    // 主要是监听用鼠标侧键从歌单返回时事件，因为props不变化,componentWillReceiveProps触发不了
    if (this.props.match.params.type === "collect") {
      this.setState({
        type: "collect",
        translateX: this.props.offset
      });
    } else if (this.props.match.params.type === "find") {
      this.setState({
        type: "find",
        translateX: this.props.offset
      });
    }
    this.handleShowDaliy();
    this.initialPlayList(this.props, this.props.match.params.type);
  }

  componentWillUnmount() {
    this.props.onSetOffset(this.state.translateX);
    this.isUnmount = true;
    window.onmouseup = null;
    window.onmousemove = null;
    window.onresize = null;
  }

  componentDidUpdate(preProps, preState) {
    // 监听偏移量，检测是否需要修改当前translateX的值
    if (preProps.isLogged !== this.props.isLogged) {
      this.offsetListener(this.state.translateX);
    }

    // 监听路由参数是否变化动态更新歌单
    if (
      !this.isUnmount &&
      preProps.match.params.type !== this.props.match.params.type &&
      this.props.match.params.type === "collect"
    ) {
      this.setState({
        type: "collect"
      });
    } else if (
      !this.isUnmount &&
      preProps.match.params.type !== this.props.match.params.type &&
      this.props.match.params.type === "find"
    ) {
      this.setState({
        type: "find"
      });
    }

    // 更改显示歌单时重新初始化歌单属性信息
    if (
      this.props.categoryList.cat !== preProps.categoryList.cat ||
      this.props.personalizedList.length !== preProps.personalizedList.length ||
      this.props.recommendList.length !== preProps.recommendList.length ||
      this.state.type !== preState.type
    ) {
      this.initialPlayList(this.props, this.props.match.params.type);
    }
  }

  // 初始化歌单列表属性
  initialPlayList = (props, type) => {
    const { isLogged, personalizedList, recommendList, userCollectList, categoryList } = props;

    let imageUrl = "";
    let playList = [];

    if (type === "find") {
      if (categoryList.playlists && categoryList.playlists.length > 0) {
        imageUrl = "coverImgUrl";
        playList = categoryList.playlists;
      } else {
        imageUrl = "picUrl";
        if (isLogged) {
          const res = new Map();
          // 日推歌单加推荐歌单后需要去重
          playList = recommendList
            .concat(personalizedList)
            .filter(song => !res.has(song.id) && res.set(song.id, 1));
        } else {
          playList = personalizedList;
        }
      }
    } else if (type === "collect") {
      imageUrl = "coverImgUrl";

      if (isLogged) {
        playList = userCollectList;
      } else {
        playList = [];
      }
    }
    // 动态设置div的宽度，确保宽度大于总的歌单宽
    if (playList && playList.length > 0) {
      var playListWidth =
        playList.length % 2 === 0 && isLogged && type === "find"
          ? playList.length * 95.5 + 227
          : playList.length * 95.5 + 36;
    }
    this.setState({
      playListWidth,
      imageUrl,
      playList
    });
  };

  // 设置显示的星期
  handleShowDaliy = () => {
    switch (new Date().getDay()) {
      case 0:
        this.week = "星期日";
        break;
      case 1:
        this.week = "星期一";
        break;
      case 2:
        this.week = "星期二";
        break;
      case 3:
        this.week = "星期三";
        break;
      case 4:
        this.week = "星期四";
        break;
      case 5:
        this.week = "星期五";
        break;
      case 6:
        this.week = "星期六";
        break;
      default:
        break;
    }
  };

  // 显示歌单名
  handleShowListName = e => {
    let id = e.currentTarget.id;
    this.timer = setTimeout(() => {
      this.setState({
        showListName: +id
      });
    }, 400);
  };
  // 鼠标停留低于400ms离开时 取消显示歌单名
  handleCancelSowListName = () => {
    clearTimeout(this.timer);
    this.timer = null;
    setTimeout(() => {
      this.setState({
        showListName: -1
      });
    }, 400);
  };

  // 处理点击歌单跳转
  handleRedirect = id => {
    if (this.upTime - this.downTime < 200) {
      this.upTime = null;
      this.downTime = null;
      this.isUnmount = true;
      this.props.history.push(`/playlistdetail/playlist/${id}`);
    }
  };

  // 鼠标按下时激活
  handleActivateMove = e => {
    e.stopPropagation();
    this.moving = true;
    this.downTime = +new Date();
  };
  // 鼠标松开时取消激活状态
  handleStopMove = e => {
    e.stopPropagation();
    this.moving = false;
    this.lastX = null;
    this.upTime = +new Date();
  };
  // 激活状态时修改位移
  handleMoving = e => {
    if (this.moving && this.lastX) {
      let dx = e.clientX - this.lastX;
      let translateX = this.state.translateX + dx;
      translateX = translateX > 0 ? 0 : translateX;
      if (!this.offsetListener(translateX)) {
        return;
      }
      this.setState({
        translateX
      });
    }
    this.lastX = e.clientX;
  };

  // 监听偏移量
  offsetListener = translateX => {
    let offset = -1 * (this.state.playListWidth - window.innerWidth + 80);
    if (translateX < offset) {
      this.setState({
        translateX: offset
      });
      return false;
    }
    return true;
  };

  render() {
    const { categoryList } = this.props;

    const showPlayList = (mirror = false) => {
      const { playList, imageUrl } = this.state;
      if (!mirror) {
        return (
          <>
            {playList &&
              playList.map((detil, index) => {
                return (
                  <div
                    onClick={() => {
                      this.handleRedirect(detil.id);
                    }}
                    className="play-list"
                    id={detil.id}
                    onMouseEnter={this.handleShowListName}
                    onMouseLeave={this.handleCancelSowListName}
                    key={index}
                  >
                    <p
                      id={detil.id + 77777}
                      className={`play-list-name ${
                        this.state.showListName === detil.id ? "list-show" : ""
                      }`}
                    >
                      {detil.name}
                    </p>
                    <img
                      src={detil[imageUrl]}
                      alt=""
                      className="play-list-image"
                      draggable="false"
                    />
                    <MyIcon
                      type="icon-bofang3"
                      className={this.state.showListName === detil.id ? "play-all-icon" : "none"}
                      onClick={e => {
                        this.props.getOneListDetail(e, detil.id, true);
                      }}
                    />
                  </div>
                );
              })}
          </>
        );
      } else {
        return (
          <>
            {playList &&
              playList.map((detil, index) => {
                return (
                  <div className="play-list" key={index}>
                    <img
                      src={detil[imageUrl]}
                      id={detil.id + 99999}
                      alt=""
                      className="play-list-image"
                      draggable="false"
                    />
                  </div>
                );
              })}
          </>
        );
      }
    };

    return (
      <div id="main-play">
        <div
          onDragStart={() => {
            return false;
          }}
          className="main-play-list"
          onMouseDown={this.handleActivateMove.bind(this)}
          style={{
            transform: `translateX(${this.state.translateX}px)`,
            width: `${this.state.playListWidth}px`
          }}
        >
          <div className="main-list">
            {this.props.isLogged && this.state.type === "find" && !categoryList.cat && (
              <div
                onClick={() => {
                  this.handleRedirect(0);
                }}
                className="play-list-daily"
                id="1"
                onMouseEnter={e => {
                  this.handleShowListName(e);
                }}
                onMouseLeave={this.handleCancelSowListName}
              >
                <p
                  className={`play-list-name ${
                    this.state.showListName === 1 ||
                    this.state.showListName === 2 ||
                    this.state.showListName === 3
                      ? "list-show"
                      : ""
                  }`}
                >
                  根据你的音乐口味生成 日推&nbsp;&nbsp;( *・ω・)✄╰ひ╯
                </p>
                <p className="week" id="3">
                  {this.week}
                </p>
                <p className="day" id="2">
                  {new Date().getDate()}
                </p>
              </div>
            )}
            {showPlayList()}
          </div>

          <div className="main-list-mirror">
            {this.props.isLogged &&
              this.state.type === "find" &&
              categoryList.playlists === undefined && (
                <div className="play-list-daily">
                  <p className="week">{this.week}</p>
                  <p className="day">{new Date().getDate()}</p>
                </div>
              )}
            {showPlayList(true)}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const playList = state.playList;

  return {
    personalizedList: playList.personalizedList,
    recommendList: playList.recommendList,
    userCollectList: playList.userCollectList,
    categoryList: playList.categoryPlayList,
    isLogged: state.user.isLogged,
    offset: playList.offset
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getOneListDetail: (e, id, playall) => {
      e.stopPropagation();
      dispatch(getOnePlayListDetail(id, playall));
    },
    onSetOffset: translateX => {
      dispatch(setOffset(translateX));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayList);
