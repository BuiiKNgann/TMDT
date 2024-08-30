const userRouter = require('./user')
const { notFound, errHandler } = require('../middlewares/errHandler')


const initRoutes = (app) => {
    app.use('/api/user', userRouter)

    app.use(notFound)
    app.use(errHandler) // lỗi được hứng từ asyncHandler
}
module.exports = initRoutes