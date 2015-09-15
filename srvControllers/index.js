var router = require('express').Router()

//router.use(require('./auth'))  // set req.auth to decoded contents of req.headers['x-auth'] // Not currently required

router.use('/api/maint', require('./apiMaint'))
router.use('/api/document', require('./apiDocument'))
router.use('/api', require('./api'))
router.use('/', require('./static'))

module.exports = router
