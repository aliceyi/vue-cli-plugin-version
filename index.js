let fs = require('fs');
function witerFile (path, data) {
  fs.writeFile(path, data,function(err){
      if(err){
        console.error(err);
      } else {
        console.log('witer done');
      }
    })
}
module.exports = (api, projectOptions) => {
  api.registerCommand('version', {
  	description: 'version plugin for vue cli 3',
  	usage: 'vue-cli-service version',
  	options: {}
  }, (args) => {
  	let options = projectOptions.pluginOptions.demoOptions
    const {path, env, versionDirectory, name} = options
    const DIR = `${path}/${versionDirectory}`
    const NAME = name || 'version'
    const VERSION = `${DIR}/${NAME}.json`
    fs.exists(DIR, function (exists) {
     if(exists){
       // 创建 version.js
       console.log('witer version')
       witerFile(VERSION, `{"${NAME}":${env.VERSION}}`)
     }else {
       fs.mkdir(`${path}/static`, function() {
         console.log('create static')
         witerFile(VERSION, `{"${NAME}":${env.VERSION}}`)
       });  
     }
    });
  })
}
module.exports.defaultModes = {
  version: 'production'
}
