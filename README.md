# Y-Music

>一个数据源自网易云的桌面音乐客户端。

## 介绍
Y-Music是基于 React、Redux、Nedb、Electron 开发的网易云第三方桌面音乐客户端，数据API源自 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)。

UI看人吧，我自己觉得挺好看的( 毕竟自己画的嘛哈哈哈[]\~(￣▽￣)\~* ),不过也有一些不合理的地方(底部播放条没有进度条，音乐和歌单详情界面没有返回按钮(通过鼠标右键后者esc/Backspace返回))，鼠标侧键返回太过习惯了，画图时完全没考虑过这个问题= =，这些懒得改了，直接塞按钮感觉没地方塞，又懒得重新画图(￣y▽,￣)╭ 。

操作习惯同网易云(如双击歌单的某首歌曲，歌单会替换播放列表、双击搜索的歌曲仅播放该歌曲不改变播放列表等)

>[百度云盘链接](https://pan.baidu.com/s/1cql6t2KPRbaSRkpwICzVGQ)

## 预览
![主界面](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/%E4%B8%BB%E7%95%8C%E9%9D%A2.png "主界面")

---

![音乐标签](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/%E6%AD%8C%E5%8D%95%E6%A0%87%E7%AD%BE.png "音乐标签")

---

![FM](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/FM.png "FM")

---

![音乐详情](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/%E9%9F%B3%E4%B9%90%E8%AF%A6%E6%83%85.png "音乐详情")

---

![歌单&歌手&专辑详情界面](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/%E6%AD%8C%E5%8D%95%26%E6%AD%8C%E6%89%8B%26%E4%B8%93%E8%BE%91%E8%AF%A6%E6%83%85%E7%95%8C%E9%9D%A2.png "歌单&歌手&专辑详情界面")

---

![搜索](https://github.com/Y-qwq/Y-Music/blob/dev/docs/image/%E6%90%9C%E7%B4%A2%E7%BB%93%E6%9E%9C.png "搜索")

## 快捷键

### 内置快捷键

Description            | Keys
-----------------------| -----------------------
暂停 / 播放              | <kbd>Ctrl</kbd> + <kbd>Space</kbd>
音量加                 | <kbd>Ctrl</kbd> + <kbd>Up</kbd>
音量减                 | <kbd>Ctrl</kbd> + <kbd>Down</kbd>
上一曲                 | <kbd>Ctrl</kbd> + <kbd>Left</kbd>
下一曲                 | <kbd>Ctrl</kbd> + <kbd>Right</kbd>
喜欢歌曲                 | <kbd>Ctrl</kbd> + <kbd>L</kbd>
显示所有歌单名                 | <kbd>S</kbd>

### 全局快捷键

Description            | Keys
-----------------------| -----------------------
暂停 / 播放              | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> +  <kbd>Space</kbd>
音量加                 | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Up</kbd>
音量减                 | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> +  <kbd>Down</kbd>
上一曲                 | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Left</kbd>
下一曲                 | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Right</kbd>
喜欢歌曲                 | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>

>目前最新版本的electron(v5.0.0)全局快捷键Alt有BUG,无法使用，暂时用Shift替代。

## 支持功能

- [x] 用户登录
- [x] 推荐歌单
- [x] 分类歌单
- [x] 播放列表
- [x] 音乐详情
- [x] 歌手&歌单&专辑详情
- [x] 用户自建&收藏歌单
- [x] FM播放
- [x] 版权提示
- [x] 播放模式切换
- [x] 收藏、删除歌单
- [x] 歌曲导入、导出歌单
- [x] 内置滚动歌词
- [x] 下一首播放
- [x] 全局快捷键
- [x] 快捷键
- [x] 进度条
- [x] 进度跳转
- [x] 播放时间
- [x] 下载歌曲
- [x] 下载封面
- [x] 音量控制
- [x] 喜欢歌曲
- [x] 评论数量
- [ ] 在线更新
- [ ] 评论详情
- [ ] 外置歌词

## 安装

### 下载

```shell
 $ git clone https://github.com/Y-qwq/Y-Music
 $ cd Y-Music
 $ yarn

 // 下载子模块
$ git submodule update --init --recursive
$ cd NeteaseCloudMusicApi
$ yarn
$ cd ..
```

### 运行

```shell
 // NeteaseCloudMusicApi下
 $ yarn start

 // Y-Music下
 $ yarn start
 $ yarn ele-start
```

### 打包

```shell
 // React打包
 $ yarn build

 // ...漫长的等待
 
 // Electron打包
 $ yarn dist
```

## License

Y-Music is licensed under MIT.
