module.exports = (api, projectOptions) => {
  api.registerCommand('version', {
  	description: 'version plugin for vue cli 3',
  	usage: 'vue-cli-service version',
  	options: {}
  }, (args) => {
  	let options = projectOptions.pluginOptions.demoOptions
  	console.log('options', options)
  })
}