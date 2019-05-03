/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Button, Modal, Form, Input, Checkbox, Icon } from "antd";

import $db from "../../data";

import MyIcon from "../../assets/MyIcon";
import "./index.scss";

export default Form.create({ name: "login" })(
  // eslint-disable-next-line
  class extends React.Component {
    state = {
      loginType: "cellphone",
      checked: true
    };

    // 切换登录模式
    handleChangeLoginType = () => {
      if (this.state.loginType === "cellphone") {
        this.setState({
          loginType: "email"
        });
      } else {
        this.setState({
          loginType: "cellphone"
        });
      }
    };

    toggleChecked = e => {
      console.log(e.target.checked);
      this.setState({ checked: e.target.checked });
    };

    render() {
      const { visible, onCancel, form, onLogin, loginFailedMsg } = this.props;
      const { getFieldDecorator } = form;
      const { loginType } = this.state;

      //   登录
      const handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
          if (!err) {
            //   登录
            if (values.email) {
              onLogin(values.email, values.password, this.state.loginType);
            } else {
              onLogin(values.phone, values.password, this.state.loginType);
            }
            this.props.showLoginModal(false);

            // 如果选择了auto login ，将账号信息存入数据库
            if (this.state.checked) {
              let doc = {
                _id: "userAccount",
                loginType: this.state.loginType,
                account: values.phone || values.email,
                password: values.password,
                lastTime: new Date().getDate()
              };
              $db.update({ _id: "userAccount" }, { $set: doc }, { upsert: true }, (err, num) => {
                if (err) {
                  console.log(err);
                  return;
                }
              });
            }
          }
        });
      };

      return (
        <Modal
          visible={visible}
          title={loginType === "cellphone" ? "Mobile Login" : "Email Login"}
          onCancel={onCancel}
          footer={null}
          width={350}
        >
          <Form onSubmit={handleSubmit} className="login-form">
            {loginType === "cellphone" ? (
              <Form.Item>
                {getFieldDecorator("phone", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your mobile number!"
                    },
                    { len: 11, message: "Please enter the 11 digit number!" }
                  ]
                })(
                  <Input
                    autoFocus
                    prefix={<Icon type="mobile" style={{ color: "rgba(0,0,0,.25)" }} />}
                    placeholder="Mobile Number"
                  />
                )}
              </Form.Item>
            ) : (
              <Form.Item>
                {getFieldDecorator("email", {
                  rules: [{ required: true, message: "Please input your email!" }]
                })(
                  <Input
                    autoFocus
                    prefix={
                      <MyIcon type="icon-xinfeng" style={{ color: "#CFCFCF", marginTop: 4 }} />
                    }
                    placeholder="Email"
                  />
                )}
              </Form.Item>
            )}

            <Form.Item>
              {getFieldDecorator("password", {
                rules: [{ required: true, message: "Please input your Password!" }]
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                  type="password"
                  placeholder="Password"
                />
              )}
            </Form.Item>

            <Form.Item>
              {loginFailedMsg ? <p style={{ color: "red" }}>{loginFailedMsg + "!"}</p> : ""}

              <Checkbox checked={this.state.checked} onChange={this.toggleChecked}>
                Auto Login
              </Checkbox>

              <a className="login-form-forgot" onClick={this.handleChangeLoginType}>
                {loginType === "cellphone" ? "Email Login" : "Phone Login"}
              </a>

              <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);
