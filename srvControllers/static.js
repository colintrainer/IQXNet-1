var express = require('express')
var router  = express.Router()
var path    = require('path')

router.use(express.static(__dirname + '/../assets/custom'))
router.use(express.static(__dirname + '/../assets'))
router.use('/views', express.static(__dirname + '/../views'))
router.use('/template', express.static(__dirname + '/../template'))

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname , '../views','app.html'))
 })
 
router.post('/', function (req, res) {
  res.sendStatus(200)  // May be used by login form
  })

module.exports = router
