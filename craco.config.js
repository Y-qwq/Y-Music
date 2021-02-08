const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#F4606C',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          webpackConfig.resolve.plugins.push(new TsconfigPathsPlugin({}));
          return webpackConfig;
        },
      },
    },
    {
      plugin: new AntdDayjsWebpackPlugin(),
    },
  ],
  babel: {
    plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  },
};
