### Vue cli3 自定义插件,解决 JS 版本更新问题

Webpack 根据模块的依赖关系进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。
异步加载原理是，事先将编译好的静态文件，通过js对象映射，硬编码进打包后的 app.xxxx.js文件中，然后通过JSONP原理按需加载每个Chunk，会引出一个问题，
当前端脚本重新编译后，项目发布采用的是删除重置发布，由于静态文件只加载一次缘故，会导致按需加载会报错。
原因是浏览器已经缓存了app.XXX.js 这个加载器，然后访问新的导航栏的时候，服务端已经不存在旧静态资源，导致系统异常。

#### 终极解决方案如下：

1. Main.js 中在router 注册之前加入 router 钩子

```
import Vue from 'vue'
import axios from 'axios'

Const valiVersion = function () {
    const self = this
    return new Promise(function (resolve, reject) {
      if (process.env.NODE_ENV === 'development’) {
        resolve()
        console.log('no validate version')
      } else {
        console.log('validate version')
        axios.get('/static/version.json').then(res => {
          const { version } = res.data
          const localVersion = self.get('version')
          if (localVersion !== 'err') {
            if (localVersion !== version) {
              Vue.prototype.$dialog.modal({
                title: '系统提示',
                okText: '确认',
                content: `当前不是最新版本，请确认更新。`,
                onOk () {
                  self.set('version', version)
                  window.location.reload()
                }
              })
            } else {
              resolve()
            }
          } else {
            self.set('version', version)
            resolve()
          }
        })
      }
    })
  }

router.beforeEach((to, from, next) => {
	valiVersion().
	then(()=>{
		// router login role ect. 
		next()
	})
})
```
2. 自定义 vue cli3 plugin 已在npm 中开源，可以直接安装使用
```
npm install vue-cli-plugin-version -D
```


3. 添加版本变量 vue.config.js
- 根据环境变量，动态生成version
```
if (process.env.NODE_ENV === ‘production’) {
  const VERSION = new Date().getTime()
  process.env.VERSION = VERSION
  console.log('set version')
}
```

- vue cli3 配置 pluginOptions
```
pluginOptions: {
    versionOptions: {
      path: resolve('dist'),
      env: process.env,
      versionDirectory: 'static'
    }
  }
```

4. package.json  scripts 添加 version 执行命令
```
"version": "vue-cli-service version"
```
5. 至此结束，执行编译
```
 npm run version 
```
￼
7. 访问项目，再次编译版本，打开之前的项目，点击其他导航菜单



