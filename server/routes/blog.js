const router = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const ctrls = require('../controllers/blog')

router.get('/', ctrls.getBlogs)
router.get('/one/:bid', ctrls.getBlog)
router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewBlog)
router.put('/likes/:bid', [verifyAccessToken], ctrls.likeBlog)
router.put('/dislike/:bid', [verifyAccessToken], ctrls.dislikeBlog)
router.put('/update/:bid', [verifyAccessToken, isAdmin], ctrls.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], ctrls.deleteBlog)

module.exports = router