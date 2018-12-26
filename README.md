### Vue cli3 自定义插件,解决 JS 版本更新问题

Webpack 根据模块的依赖关系进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。
异步加载原理是，事先将编译好的静态文件，通过js对象映射，硬编码进打包后的 app.xxxx.js文件中，然后通过JSONP原理按需加载每个Chunk

![1](https://thumbnail10.baidupcs.com/thumbnail/433982cbe18911a8df95f9a30b820bf0?fid=4211519823-250528-290873173178815&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-AHdaXlVNXENTubCzdjXfWeB%2bMgw%3d&expires=8h&chkbd=0&chkv=0&dp-logid=8046404631081384759&dp-callid=0&time=1544709600&size=c1680_u1050&quality=90&vuk=4211519823&ft=image&autopolicy=1)
￼![2](https://thumbnail10.baidupcs.com/thumbnail/8f01e4901d123d1e98e26c1d583ed67b?fid=4211519823-250528-53930007303104&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-fFET41eWOITq%2fOydYHHAfFknpeA%3d&expires=8h&chkbd=0&chkv=0&dp-logid=8046404631081384759&dp-callid=0&time=1544709600&size=c1680_u1050&quality=90&vuk=4211519823&ft=image&autopolicy=1)
￼
是不是很熟悉，这段代码。就是用来实现按需加载js资源的加载器。
上述代码会引出一个问题，
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
![3](https://thumbnail10.baidupcs.com/thumbnail/8a7f34f03d74569789aba65cafc24b8b?fid=4211519823-250528-22738948181364&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-QSygCZ8V%2bELohAsL70SYSouho5s%3d&expires=8h&chkbd=0&chkv=0&dp-logid=8046404631081384759&dp-callid=0&time=1544709600&size=c1680_u1050&quality=90&vuk=4211519823&ft=image&autopolicy=1)
￼
7. 访问项目，再次编译版本，打开之前的项目，点击其他导航菜单，效果如下：

![4](https://thumbnail10.baidupcs.com/thumbnail/9401e932184a8f19dc19a62ad9f59d70?fid=4211519823-250528-366460011063220&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-U5cJIE5DRpcJq4XaoBV2Vo3TqYQ%3d&expires=8h&chkbd=0&chkv=0&dp-logid=8046969967216209037&dp-callid=0&time=1544713200&size=c1680_u1050&quality=90&vuk=4211519823&ft=image&autopolicy=1)



