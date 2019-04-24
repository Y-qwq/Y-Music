import React, { Component } from "react";
import MyIcon from "../../../assets/MyIcon";
import { connect } from "react-redux";
import {
  getPersonalizedList,
  getCategoryPlayList,
  categoryPlayList,
  getoneLyric,
  getFM
} from "../../../redux/actionCreator";
import { Link, withRouter } from "react-router-dom";
import { Popover } from "antd";
import titlePng from "../../../assets/image/title.png";
import "./index.scss";
import { getPlayListCategory } from "../../../util/api";

import { easeExpInOut } from "d3-ease";
import { Animate } from "react-move";

class LeftNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navSelect: 1,
      sub: [], // 标签
      curSub: "", // 当前标签
      subVisible: false
    };
  }
  onHandleNavSelect = num => {
    if (num === 1 && this.state.navSelect === 1) {
      this.props.delCategoryPlayList();
      this.setState({
        curSub: ""
      });
    } else {
      this.setState({
        navSelect: num
      });
    }

    if (num === 2 && !this.props.isFM) {
      this.props.onGetFM();
    }
  };

  handleVisibleChange = subVisible => {
    this.setState({ subVisible });
  };
  handleSelectSub = curSub => {
    if (curSub) {
      this.props.getOneCategoryPlayList(curSub);
    } else {
      this.props.delCategoryPlayList();
    }
    this.setState({
      subVisible: false,
      curSub
    });
  };

  componentDidMount = async () => {
    this.props.getPersonalizedPlayList();

    // 获取分类标签
    try {
      let res = await getPlayListCategory();
      if (res.data.code === 200) {
        this.setState({
          sub: res.data.sub,
          categories: res.data.categories
        });
      }
    } catch (err) {
      console.log(err && err.response && err.response.data && err.response.data.msg);
    }
  };

  componentDidUpdate(preProps) {
    if (this.props.location.pathname !== preProps.location.pathname) {
      let navSelect = 1;
      switch (this.props.location.pathname) {
        case "/FM":
          navSelect = 2;
          break;
        case "/collect":
          navSelect = 3;
          break;
        default:
          navSelect = 1;
          break;
      }
      this.setState({ navSelect });
    }
  }

  renderSub = () => {
    const cat = ["语种", "风格", "场景", "情感", "主题"];
    const { sub, curSub } = this.state;
    return (
      <div className="nav-cat">
        <Link to="/find">
          <div
            className={`sub-top ${!curSub && "one-sub-focus"}`}
            onClick={this.handleSelectSub.bind(this, "")}
          >
            <p>日推歌单</p>
          </div>
        </Link>
        <Link to="/find">
          <div
            className={`sub-top ${curSub === "全部" && "one-sub-focus"}`}
            onClick={this.handleSelectSub.bind(this, "全部")}
          >
            <p>全部歌单</p>
          </div>
        </Link>
        {cat.map((subClass, index) => {
          return (
            <div className="nav-sub-class" key={index + 49}>
              <div className="sub-class">
                <MyIcon type={`icon-${index}`} className="sub-class-icon" />
                <p>{subClass}</p>
              </div>
              <div className="nav-sub">
                {sub
                  .filter(s => s.category === index)
                  .map((one, idx) => {
                    return (
                      <Link to="/find" key={idx + 99}>
                        <div
                          className={`one-sub ${curSub === one.name && "one-sub-focus"}`}
                          onClick={this.handleSelectSub.bind(this, one.name)}
                        >
                          <p>{one.name}</p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  render() {
    const {
      location: { pathname }
    } = this.props;
    return (
      <Animate
        show={pathname !== "/musicdetail"}
        start={{
          x: [-80]
        }}
        enter={{
          x: [0],
          timing: { duration: 500, ease: easeExpInOut }
        }}
        leave={{
          x: [-80],
          timing: { duration: 500, ease: easeExpInOut }
        }}
      >
        {({ x }) => {
          return (
            <nav
              id="main-nav"
              style={{
                transform: `translateX(${x}px)`
              }}
            >
              <Link to="/find" id="nav-title-link" draggable="false">
                <img
                  src={titlePng}
                  alt=""
                  id="nav-title"
                  onClick={this.onHandleNavSelect.bind(this, 1)}
                  draggable="false"
                />
              </Link>
              <div id="nav-menu">
                <Popover
                  placement="right"
                  title={<h3 className="sub-title">添加标签</h3>}
                  content={this.renderSub()}
                  trigger="contextMenu"
                  visible={this.state.subVisible}
                  onVisibleChange={this.handleVisibleChange}
                >
                  <Link to="/find" className="nav-link" draggable="false">
                    <MyIcon
                      type="icon-faxian"
                      className={["nav-icon", pathname === "/find" && "nav-select"]}
                      onClick={this.onHandleNavSelect.bind(this, 1)}
                    />
                  </Link>
                </Popover>
                <Link
                  to={"/FM"}
                  className="nav-link"
                  draggable="false"
                  onClick={this.onHandleNavSelect.bind(this, 2)}
                >
                  <MyIcon
                    type="icon-diantai"
                    className={["nav-icon", pathname === "/FM" && "nav-select"]}
                  />
                </Link>

                <Link to="/collect" className="nav-link" draggable="false">
                  <MyIcon
                    type="icon-shoucang"
                    className={["nav-icon", pathname === "/collect" && "nav-select"]}
                    onClick={this.onHandleNavSelect.bind(this, 3)}
                  />
                </Link>
              </div>
              <div className="nav-img-box">
                <div
                  className="nav-cover"
                  style={{
                    display: pathname !== "/FM" && this.props.curUrl ? "block" : "none"
                  }}
                >
                  <img
                    src={pathname !== "/FM" ? this.props.curUrl : ""}
                    alt=""
                    id="nav-song-cover"
                    draggable="false"
                  />
                  <Link
                    to={this.props.isFM ? "/FM" : "/musicdetail"}
                    draggable="false"
                    onClick={this.props.onGetLyric.bind(this)}
                  >
                    <MyIcon type="icon-fangda" className="nav-cover-icon" />
                  </Link>
                </div>
              </div>
            </nav>
          );
        }}
      </Animate>
    );
  }
}

const mapStateToProps = state => {
  const tracks = state.playInfo.tracks;
  const curIndex = state.playInfo.currentIndex;
  const curTrack = tracks.length > 0 && tracks[curIndex];

  let curUrl = null;
  if (curTrack && curTrack.al && curTrack.al.picUrl) {
    curUrl = curTrack.al.picUrl;
  } else if (curTrack && curTrack.album && curTrack.album.picUrl) {
    curUrl = curTrack.album.picUrl;
  }

  return {
    curTrack,
    curUrl,
    isFM: state.playInfo.isFM
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getPersonalizedPlayList: () => {
      dispatch(getPersonalizedList());
    },
    getOneCategoryPlayList: cat => {
      dispatch(getCategoryPlayList(cat));
    },
    delCategoryPlayList: () => {
      dispatch(categoryPlayList({ cat: "", playlists: [] }));
    },
    onGetLyric: () => {
      dispatch(getoneLyric());
    },
    onGetFM: () => {
      dispatch(getFM());
    }
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeftNav)
);
