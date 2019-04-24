import React from "react";
import { Button, Icon } from "antd";
import MyIcon from "../../assets/MyIcon";
import "./index.scss";
const ButtonGroup = Button.Group;

/**
 *
 * @param {String} fontSize
 */
export function PlayAll(props) {
  return (
    <span className="button-component">
      <ButtonGroup className="list-button play-all-button">
        <Button onClick={props.onClickPlayAll}>
          <MyIcon type="icon-bofang3" style={{ fontSize: props.fontSize || "16px" }} />
          播放全部
        </Button>
        <Button icon="plus" onClick={props.onClickAddPlayAll} />
      </ButtonGroup>
    </span>
  );
}

/**
 *
 * @param {Number} num
 * @param {String} fontSize
 */
export function Collect(props) {
  return (
    <span className="button-component">
      <Button className="list-button" onClick={props.onClickToggle} disabled={props.disabled}>
        <MyIcon type="icon-tianjiawenjianjia" style={{ fontSize: props.fontSize || "16px" }} />
        收藏{"(" + props.num === undefined ? 0 : props.num + ")"}
      </Button>
    </span>
  );
}

/**
 *
 * @param {Number} num
 * @param {String} fontSize
 */
export function Collected(props) {
  return (
    <span className="button-component list-collected-button">
      <Button className="list-button" onClick={props.onClickToggle} disabled={props.disabled}>
        <MyIcon type="icon-icon-" style={{ fontSize: props.fontSize || "16px" }} />
        已收藏{"(" + props.num === undefined ? 0 : props.num + ")"}
      </Button>
    </span>
  );
}

/**
 *
 * @param {String} fontSize
 */
export function DownloadAll(props) {
  return (
    <span className="button-component">
      <Button className="list-button">
        <Icon type="download" style={{ fontSize: props.fontSize || "16px" }} />
        下载全部
      </Button>
    </span>
  );
}
