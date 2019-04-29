import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Avatar, Icon, AutoComplete } from "antd";

import $db from "../../data";

import MyIcon from "../../assets/MyIcon";
import { debounce } from "../../util/util";
import { getSuggest, getSongDetail } from "../../util/api";
import { login, logout, isLoading, insertSongToPlay } from "../../redux/actionCreator";
import Login from "../Login";
import "./index.scss";

const { remote } = window.require("electron");
const currentWindow = remote.getCurrentWindow();
const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMaximized: false, // 是否最大化
      searchValue: "", //搜索内容
      showBar: false, //显示搜索输入条
      loginVisible: false, //显示登录窗口
      suggestData: []
    };

    this.handleAutoSearch = debounce(this.handleAutoSearch, 300);
    this.typeMap = new Map([
      ["songs", "歌曲"],
      ["artists", "歌手"],
      ["albums", "专辑"],
      ["mvs", "视频"],
      ["playlists", "歌单"]
    ]);
  }

  componentDidMount() {
    // 关闭搜索
    document.body.onclick = e => {
      if (
        e.target.tagName !== "svg" &&
        e.target.tagName !== "path" &&
        e.target.id !== "header-search-text"
      ) {
        this.setState({ showBar: false });
      }
    };

    // 监听是否双击放大or恢复
    currentWindow.on("maximize", () => {
      this.setState({
        isMaximized: true
      });
    });
    currentWindow.on("unmaximize", () => {
      this.setState({
        isMaximized: false
      });
    });

    // 自动登录
    $db.findOne({ _id: "userAccount" }, (err, doc) => {
      if (err) {
        return;
      }
      if (doc) {
        this.props.onLogin(doc.account, doc.password, doc.loginType, true, doc.lastTime);
      }
    });
  }

  // 最小化
  onHandleMinimize = () => {
    currentWindow.minimize();
  };
  // 最大化or恢复正常
  onHandleMaximize = () => {
    if (currentWindow.isMaximized()) {
      this.setState({ isMaximized: false });
      currentWindow.unmaximize();
    } else {
      this.setState({ isMaximized: true });
      currentWindow.maximize();
    }
  };
  // 关闭窗口
  onHandleClose = () => {
    currentWindow.close();
  };

  // 显示登录模块
  showLoginModal = isShow => {
    this.setState({ loginVisible: isShow });
  };
  // 取消登录
  handleLoginCancel = () => {
    this.setState({ loginVisible: false });
    this.props.onLoadingFalse();
  };
  // 登录界面Ref
  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  // 退出并删除数据库保存的用户账号信息，即取消自动登录。
  onLogout = () => {
    this.props.onLogout();
    $db.remove({ _id: "userAccount" }, {}, function(err, numRemoved) {
      if (err) {
        console.log(err);
        return;
      }
    });
  };

  // 搜索
  search = () => {
    this.setState({ showBar: false });
    if (this.state.searchValue) {
      this.props.history.push(`/search/songs/${this.state.searchValue}`);
    }
  };

  // 点击查询图标时搜索
  handleSearch = () => {
    if (!this.state.showBar) {
      this.setState({ showBar: true });
    } else {
      this.search();
    }
  };

  // 键入回车时搜索
  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.search();
      e.target.blur();
    }
  };

  // 自动查询搜索建议
  handleAutoSearch = async value => {
    this.setState({ searchValue: value });
    if (!value) {
      this.setState({ suggestData: [] });
      return;
    }
    let res = await getSuggest(value);
    if (res.data.code === 200) {
      if (res.data.result.order) {
        let suggestData = [];
        const { result } = res.data;
        const types = result.order.filter(type => type !== "mvs");

        for (const type of types) {
          // 类型遍历
          if (result[type]) {
            // 该类型内容遍历
            let children = result[type].map(oneData => {
              let artists = "";
              if (type === "songs") {
                oneData.artists.map(ar => (artists += ar.name + " "));
              }
              if (type === "albums") {
                artists = oneData.artist.name;
              }
              return { id: oneData.id, name: oneData.name, artists };
            });

            suggestData.push({
              type,
              children
            });
          }
        }
        this.setState({ suggestData });
      } else {
        this.setState({ suggestData: [] });
      }
    }
  };

  // 选择建议
  handleSelect = (id, option) => {
    const type = option.props.title.substring(0, option.props.title.length - 1);
    switch (option.props.title) {
      case "songs":
        this.props.handlePlaySong(id);
        break;
      case "albums":
      case "artists":
      case "playlists":
        this.props.history.push(`/playlistdetail/${type}/${id}`);
        break;

      default:
        break;
    }
  };

  // 渲染搜索建议
  renderOptions = () => {
    return this.state.suggestData.map(group => (
      <OptGroup key={group.type} label={this.typeMap.get(group.type)}>
        {group.children.map(opt => (
          <Option key={opt.id} title={group.type}>
            {opt.artists ? `${opt.name} - ${opt.artists}` : opt.name}
          </Option>
        ))}
      </OptGroup>
    ));
  };

  render() {
    const { onLogin, userInfo, isLogged, loginFailedMsg, loading, location } = this.props;

    return (
      <div id="header" style={{ paddingLeft: location.pathname !== "/musicdetail" ? 80 : 0 }}>
        <header id="header-header">
          <div id="header-left">
            {isLogged ? (
              <span>
                <Avatar
                  size={40}
                  icon="user"
                  id="header-user-icon"
                  src={userInfo.profile.avatarUrl}
                />
                <div id="header-logged">
                  <p id="header-username">{userInfo.profile.nickname}</p>
                  <p id="header-logout" onClick={this.onLogout}>
                    <MyIcon type="icon-tuichu" />
                    &nbsp;&nbsp;Logout
                  </p>
                </div>
              </span>
            ) : (
              <span onClick={this.showLoginModal.bind(this, true)}>
                <Avatar size={40} icon="user" id="header-user-icon" />
                <p id="unlogin">未登录</p>
              </span>
            )}
          </div>

          <div id="header-right">
            <AutoComplete
              defaultActiveFirstOption={false}
              style={{ backgroundColor: "rgba($color: #fff, $alpha: 0)" }}
              dataSource={this.renderOptions()}
              onSelect={this.handleSelect}
              onSearch={this.handleAutoSearch}
            >
              <input
                id="header-search-text"
                className={this.state.showBar ? "show-text" : "unshow-text"}
                onKeyDown={this.handleKeyDown.bind(this)}
              />
            </AutoComplete>

            <Icon
              type="search"
              className="header-icon"
              id="header-search-icon"
              onClick={this.handleSearch}
            />

            <MyIcon
              type="icon-winfo-icon-zuixiaohua"
              className="header-icon"
              onClick={this.onHandleMinimize}
            />
            <MyIcon
              type={
                this.state.isMaximized ? "icon-zuidahua1" : "icon-winfo-icon-fuxuanweixuanzhong"
              }
              className="header-icon"
              onClick={this.onHandleMaximize}
            />
            <MyIcon
              type="icon-winfo-icon-guanbi"
              className="header-icon"
              onClick={this.onHandleClose}
            />
          </div>
        </header>

        <Login
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.loginVisible || loading} // 登陆中or登录失败不会关闭窗口
          onCancel={this.handleLoginCancel}
          onLogin={onLogin} // 登录api调用
          showLoginModal={this.showLoginModal.bind(this)} // 登录窗口 开关
          loginFailedMsg={loginFailedMsg} // 登录失败信息
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    isLogged: state.user.isLogged,
    loginFailedMsg: state.user.loginFailedMsg,
    loading: state.user.loading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogin: (account, password, type, isAuto, lastTime) => {
      dispatch(login(account, password, type, isAuto, lastTime));
    },
    handlePlaySong: async id => {
      let res = await getSongDetail(id);
      if (res.data.code === 200 && res.data.songs.length > 0) {
        const track = res.data.songs[0];
        dispatch(insertSongToPlay(0, track));
      }
    },
    onLogout: () => dispatch(logout()),
    onLoadingFalse: () => dispatch(isLoading(false))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
