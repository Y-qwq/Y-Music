import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from '@/utils/reportWebVitals';
import Main from '@/components/main';
import '@/styles/index.less'; // 放在组件下面，方便覆盖antd的样式

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
