var Service = require('node-windows').Service
var path = require('path')

var svc = new Service({
  name:'IQXWeb',
  description: 'The Node.js web server for IQX',
  script: path.resolve(__dirname,'server.js'),
  env: {
    name: 'NODE_ENV',
    value: 'production'
    }
  })

svc.on('install',function(){
  svc.start()
  console.log('Service installed successfully')
})
svc.on('uninstall',function(){
  console.log('Service uninstalled successfully')
})
svc.on('alreadyinstalled',function(){
  console.log('Service already installed')
})
svc.on('invalidinstallation',function(){
  console.log('Invalid installation')
})
svc.on('error',function(){
  console.log('Error installing service')
})

if (process.argv.length>2 && process.argv[2].match(/uninstall/i)) {
  svc.uninstall()
} else {
  svc.install()
}