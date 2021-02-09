import './index.less';

import zhCN from 'antd/lib/locale/zh_CN';
import { FC } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@redux/index';
import { RootRoutes } from '@routers/index';

const Main: FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <ConfigProvider locale={zhCN}>
          <RootRoutes />
        </ConfigProvider>
      </Router>
    </Provider>
  );
};

export default Main;
