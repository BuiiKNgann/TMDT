const router = require('express').Router()
const ctrls = require('../controllers/product')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], ctrls.createProduct)
router.get('/', ctrls.getProducts)
router.put('/ratings', verifyAccessToken, ctrls.ratings)
router.put('/:pid', [verifyAccessToken, isAdmin], ctrls.updateProduct)
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteProduct)
router.get('/:pid', ctrls.getProduct)

module.exports = router


// CRUD | Create - Read - Update - Delete | POST - GET - PUT -DELETE
//CREATE (POST) + PUT - body
//UPDATE - params
//GET + DELETE - query // sẽ lộ id 