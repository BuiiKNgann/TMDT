const userRouter = require('./user')
const productRouter = require('./product')
const productCategoryRouter = require('./productCategory')
const blogCategoryRouter = require('./blogCategory')
const { notFound, errHandler } = require('../middlewares/errHandler')


const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/prodcategory', productCategoryRouter)
    app.use('/api/blogCategory', blogCategoryRouter)
    app.use(notFound)
    app.use(errHandler) // lỗi được hứng từ asyncHandler
}
module.exports = initRoutes