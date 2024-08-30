const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`) //originalUrl API người dùng gọi lên
    res.status(404)
    next(error);
}

const errHandler = (error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode // 200 là mã thành công, nhưng có lỗi mà trả về 200 thì sẽ sửa thành 500
    return res.status(statusCode).json({
        success: false,
        mes: error?.message
    })
}
module.exports = {
    notFound, errHandler
}