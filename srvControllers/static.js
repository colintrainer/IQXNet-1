var express = require('express')
var router  = express.Router()
var path    = require('path')

router.use(express.static(__dirname + '/../assets/custom'))   // Any files in custom will take precedence
router.use(express.static(__dirname + '/../assets'))          // js, css, images, maps
router.use('/views', express.static(__dirname + '/../views')) // html

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname , '../views','app.html'))  // The application page
 })
 
router.post('/', function (req, res) {
  res.sendStatus(200)  // May be used by login form (In Chrome, AJAX posting alone does not trigger password remembering)
  })

module.exports = router
