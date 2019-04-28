import React, { Component } from "react";
import { Menu, Spin, Icon, Empty } from "antd";

import { debounce } from "../../util/util";
import { getSearch } from "../../util/api";
import SongList from "../SongList";
import "./index.scss";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      picName: "picUrl", // 图片属性名
      allShow: false, // 是否显示完所有内容(相当于翻页翻到最后一页)
      loading: false,
      data: []
    };

    this.scrollRef = React.createRef();
    this.contentRef = React.createRef();

    this.typeMap = new Map([["songs", 1], ["albums", 10], ["artists", 100], ["playlists", 1000]]);

    this.handleScrolling = debounce(this.handleScrolling, 300);
  }

  componentDidMount() {
    const { keywords, type } = this.props.match.params;
    this.handleSearch(keywords, type, 0, type === "songs" ? 100 : 20);
  }

  componentDidUpdate(preProps) {
    if (this.props.match.params.type !== preProps.match.params.type) {
      this.handleSearch(this.props.match.params.keywords, this.props.match.params.type, 0, 20);
      this.setState({ allShow: false });
    }
    if (this.props.match.params.keywords !== preProps.match.params.keywords) {
      this.handleSearch(this.props.match.params.keywords);
      this.scrollRef.current.scrollTop = 0;
      this.setState({ allShow: false });
    }
  }

  handleSearch = async (
    keywords,
    type = this.props.match.params.type,
    offset = 0,
    limit = 100,
    isAdd = false
  ) => {
    this.setState({ loading: true });
    let res = await getSearch(keywords, this.typeMap.get(type), offset, limit);
    let picName = "picUrl";
    if (type === "artists") picName = "img1v1Url";
    if (type === "playlists") picName = "coverImgUrl";

    if (res.data.code === 200) {
      if (!res.data.result[type]) {
        this.setState({ allShow: true, loading: false });
        return;
      }
      if (isAdd) {
        this.setState({
          data: [...this.state.data, ...res.data.result[type]],
          loading: false
        });
      } else {
        this.setState({ picName, data: res.data.result[type], loading: false });
      }
    }
  };

  handleClick = id => {
    let { type } = this.props.match.params;
    type = type.substring(0, type.length - 1);
    this.props.history.push(`/playlistdetail/${type}/${id}`);
  };

  handleNavSelect = e => {
    this.setState({
      data: []
    });
    this.props.history.replace(`/search/${e.key}/${this.props.match.params.keywords}`);
  };

  handleScrolling = () => {
    let curScrollTop = this.scrollRef.current.scrollTop;
    let maxScrollTop =
      this.contentRef.current.offsetHeight - this.scrollRef.current.clientHeight + 105;

    if (maxScrollTop - curScrollTop < 200) {
      const { data, allShow } = this.state;
      const { type, keywords } = this.props.match.params;
      !allShow && this.handleSearch(keywords, type, data.length, type === "songs" ? 100 : 20, true);
    }
  };

  render() {
    const { data, picName, loading } = this.state;
    const { type } = this.props.match.params;
    return (
      <div id="search" ref={this.scrollRef} onScroll={this.handleScrolling}>
        <div className="content" ref={this.contentRef}>
          <Menu
            onClick={this.handleNavSelect}
            selectedKeys={[type]}
            style={{
              backgroundColor: "rgba(0,0,0,0)",
              marginLeft: 5,
              marginBottom: 30,
              color: "black",
              fontSize: 25
            }}
            mode="horizontal"
          >
            <Menu.Item key="songs" onClick={this.handleNavSelect}>
              单曲
            </Menu.Item>
            <Menu.Item key="albums" onClick={this.handleNavSelect}>
              专辑
            </Menu.Item>
            <Menu.Item key="artists" onClick={this.handleNavSelect}>
              歌手
            </Menu.Item>
            <Menu.Item key="playlists" onClick={this.handleNavSelect}>
              歌单
            </Menu.Item>
          </Menu>

          {!loading && data.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={"暂无结果!"}
              style={{ marginTop: 100, marginRight: 60 }}
            />
          )}

          {type === "songs" && data.length > 0 && (
            <SongList playlist={{ tracks: data }} artistsName="artists" albumName="album" />
          )}

          {type !== "songs" && (
            <table className="artists-albums-playlists">
              <thead>
                <tr>
                  <td className="pic-name" />
                  {(type === "albums" || type === "playlists") && <td className="name-count" />}
                  {type === "playlists" && <td className="creater" />}
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.length > 0 &&
                  data.map((oneData, index) => {
                    return (
                      <tr key={index} onClick={this.handleClick.bind(this, oneData.id)}>
                        <td className="left">
                          <img src={oneData[picName]} alt="" className="cover" />
                          <p className="name">{oneData.name}</p>
                          {type === "artists" && (
                            <p className="alia">
                              {oneData.alias.length > 0 && "(" + oneData.alias.join("/") + ")"}
                            </p>
                          )}
                        </td>
                        <td className="center">
                          {type === "albums" && oneData.artist && (
                            <p>
                              {oneData.artist.name}
                              {oneData.artist.trans && "(" + oneData.artist.trans + ")"}
                            </p>
                          )}
                          {type === "playlists" && <p>{oneData.trackCount}首</p>}
                        </td>
                        {type === "playlists" && (
                          <td>
                            <p>by {oneData.creator.nickname}</p>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {loading && (
            <Spin
              className="loadingIcon"
              tip="加载中..."
              indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
            />
          )}
        </div>
      </div>
    );
  }
}
