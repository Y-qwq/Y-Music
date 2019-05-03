import React, { Component } from "react";
import { connect } from "react-redux";

import MyIcon from "../../../assets/MyIcon";
import { debounce } from "../../../util/util";
import { getOnePlayListDetail, setOffset, getCategoryPlayList } from "../../../redux/actionCreator";
import "./index.scss";

class PlayList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: "picUrl",
      playList: [],
      playListWidth: "",
      showNameId: 0, // 显示该id歌单名字
      scrollLeft: 0, // 位移量
      showName: false
    };
    // 歌单的Ref
    this.listRef = React.createRef();

    // 利用时间差区分拖动与点击事件
    this.downTime = null;
    this.upTime = null;

    //存储星期x
    this.week = null;

    // 拖动flag
    this.lastX = null;
    this.moving = false;

    this.getNextCategoryPlayList = debounce(this.props.getNextCategoryPlayList, 500, true);
  }

  componentDidMount() {
    // 歌单拖动相关
    // 直接监听window，然后事件处理时取消冒泡，以达到鼠标即使移出歌单的div也能继续移动的效果
    window.onmouseup = e => this.handleUp(e);
    window.onmousemove = e => this.handleMoving(e);
    this.handleShowDaliy();
    this.initialPlayList(this.props, this.props.match.params.type);
    this.listRef.current.onwheel = this.handleWheel;
    this.listRef.current.onscroll = this.scrollLister;

    // 快捷键
    document.addEventListener("keydown", this.handleShowShortcut);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleShowShortcut);
    this.props.onSetOffset(this.listRef.current.scrollLeft);
    window.onmouseup = null;
    window.onmousemove = null;
  }

  componentDidUpdate(preProps, preState) {
    // 监听路由参数是否变化动态更新歌单
    if (
      this.props.match.params.type &&
      preProps.match.params.type !== this.props.match.params.type
    ) {
      this.setState({
        type: this.props.match.params.type
      });
    }

    // 其他页面返回时，恢复scrollLeft
    if (this.state.playList.length > 0 && preState.playList.length === 0) {
      this.listRef.current.scrollLeft = this.props.offset;
    }

    // 更改显示歌单时重新初始化歌单属性信息
    if (
      this.props.categoryList.cat !== preProps.categoryList.cat ||
      this.props.categoryList.playlists.length !== preProps.categoryList.playlists.length ||
      this.props.personalizedList.length !== preProps.personalizedList.length ||
      this.props.recommendList.length !== preProps.recommendList.length ||
      this.props.match.params.type !== preProps.match.params.type
    ) {
      this.initialPlayList(this.props, this.props.match.params.type);
    }

    // 歌单位置归零
    if (
      this.props.categoryList.cat !== preProps.categoryList.cat ||
      (this.props.isLogged === true &&
        preProps.isLogged === false &&
        this.props.categoryList.cat === "")
    ) {
      this.listRef.current.scrollLeft = 0;
    }
  }

  // 按s显示所有歌单歌名
  handleShowShortcut = e => {
    if (e.key === "s" && e.target.tagName !== "INPUT") {
      e.preventDefault();
      this.handleShowTitle();
      this.handleUnshowName();
    }
  };
  handleUnshowName = debounce(() => this.setState({ showName: false }), 300);
  handleShowTitle = debounce(() => this.setState({ showName: true }), 50, true);

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
  handleToggleShowName = (e, cancel = false) => {
    let showNameId = -1;
    if (!cancel) showNameId = Number(e.currentTarget.id);
    this.setState({
      showNameId
    });
  };

  // 处理点击歌单跳转
  handleRedirect = id => {
    if (this.upTime - this.downTime < 200) {
      this.upTime = null;
      this.downTime = null;
      this.props.history.push(`/playlistdetail/playlist/${id}`);
    }
  };

  // 鼠标滑轮滚动
  handleWheel = e => {
    this.listRef.current.scrollLeft += e.deltaY / 2;
  };

  // 歌单scroll监听
  scrollLister = () => {
    if (
      this.props.categoryList.playlists.length > 0 &&
      this.listRef.current.scrollWidth -
        this.listRef.current.offsetWidth -
        this.listRef.current.scrollLeft <
        150
    ) {
      this.getNextCategoryPlayList(this.props.categoryList.cat);
    }
  };

  // 鼠标按下时激活
  handleDown = e => {
    e.stopPropagation();
    this.moving = true;
    this.downTime = +new Date();
  };
  // 激活状态时修改位移
  handleMoving = e => {
    if (this.moving) {
      if (this.lastX) {
        let dx = this.lastX - e.clientX;
        this.listRef.current.scrollLeft += dx;
      }
      this.lastX = e.clientX;
    }
  };
  // 鼠标松开时取消激活状态
  handleUp = e => {
    e.stopPropagation();
    this.moving = false;
    this.lastX = null;
    this.upTime = +new Date();
  };

  render() {
    const { categoryList, getOneListDetail, isLogged, match } = this.props;
    const { playList, imageUrl, showNameId, playListWidth, showName } = this.state;

    const showPlayList = (mirror = false) => {
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
                    onMouseEnter={this.handleToggleShowName}
                    onMouseLeave={this.handleToggleShowName.bind(this, true)}
                    key={index}
                  >
                    <p
                      id={detil.id + 77777}
                      className={`play-list-name ${
                        showNameId === detil.id || showName === true ? "list-show" : ""
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
                      className={showNameId === detil.id ? "play-all-icon" : "none"}
                      onClick={e => {
                        getOneListDetail(e, detil.id, true);
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
      <div id="main-play" ref={this.listRef}>
        <div
          onDragStart={() => {
            return false;
          }}
          className="main-play-list"
          onMouseDown={this.handleDown}
          style={{
            width: `${playListWidth}px`
          }}
        >
          <div className="main-list">
            {isLogged && match.params.type === "find" && !categoryList.cat && (
              <div
                onClick={() => {
                  this.handleRedirect(0);
                }}
                className="play-list-daily"
                id="1"
                onMouseEnter={this.handleToggleShowName}
                onMouseLeave={this.handleToggleShowName.bind(this, true)}
              >
                <p
                  className={`play-list-name ${
                    showNameId === 1 || showNameId === 2 || showNameId === 3 || showName === true
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
            {isLogged && match.params.type === "find" && !categoryList.cat && (
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
    onSetOffset: scrollLeft => {
      dispatch(setOffset(scrollLeft));
    },
    getNextCategoryPlayList: cat => {
      dispatch(getCategoryPlayList(cat, 50, true));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayList);
