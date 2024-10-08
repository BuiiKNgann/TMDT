const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')
const product = require('../models/product')

const register = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname } = req.body
    if (!email || !password || !lastname || !firstname)
        return res.status(400).json({
            success: false,
            mes: 'Missing inputs'
        })

    //check email có tồn tại không
    const user = await User.findOne({ email: email })
    if (user) {
        throw new Error('User has existed!') // chủ động ném lỗi
    } else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser ? 'Register is successfully. Please go login' : 'something went wrong'
        })
    }

})
// refresh token => cấp mới access token
//Access token => xác thực người dùng, phân quyền người dùng 
const login = asyncHandler(async (req, res) => {
    const { email, password, } = req.body
    if (!email || !password)
        return res.status(400).json({
            success: false,
            mes: 'Missing inputs'
        })

    const response = await User.findOne({ email: email })

    if (response && await response.isCorrectPassword(password)) {
        // tách password và role ra khỏi đối tượng response
        // gán các trường còn lại vào userData
        // rest dùng cho object thuần 
        const { password, role, refreshToken, ...userData } = response.toObject()
        // tạo accessToken
        const accessToken = generateAccessToken(response._id, role)
        //tạo refresh token
        const newrefreshToken = generateRefreshToken(response._id)
        //lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, { refreshToken: newrefreshToken }, { new: true })
        // lưu refresh token vào cookie
        res.cookie('refreshToken', newrefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }) // lưu millisecond trong 7 ngày
        // chuyển đối tượng Mongoose response thành một đối tượng JavaScript thuần (plain object).
        return res.status(200).json({
            success: true,
            accessToken,
            userData // gửi dữ liệu người dùng (userData) về phía client.
        })
    } else {
        throw new Error('Invalid credentials')
    }


})



const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user // id lấy từ decode
    //check email có tồn tại không
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // lấy token từ cookies 
    const cookie = req.cookies
    //check xem có token hay không
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies')
    //check token có hợp lệ hay không
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token invalid not matched'
    })
})
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie || cookie.refreshToken) throw new Error('No refresh token in cookies')
    // xoá refresh token ở db
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // xoá refresh token ở cookie trình duyệt
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })
})
// Client gửi email
// Server check email có hợp lệ hay không => Gửi mail + kèm theo link(password change token)
// Client check mail => click link
// CLient gửi api kèm theo token
// Check token có giống với token mà server gửi mail hay không
// Change password

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query
    if (!email) throw new Error('Missing email')
    const user = await User.findOne({ email })
    if (!user) throw new Error('User not found')
    const resetToken = user.createPasswordChangedToken()
    await user.save()

    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.
    Link này sẽ hết hạn sau 15 phút kể từ bây giờ 
    <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`
    const data = {
        email,
        html
    }
    const rs = await sendMail(data)
    return res.status(200).json({
        success: true,
        rs
    })
})
const resetPassword = asyncHandler(async (req, res) => {

    const { password, token } = req.body

    if (!password || !token) throw new Error('Missing input')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })
    if (!user) throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Updated password' : 'Something went wrong'
    })
})

//Role admin 
const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})

const deleteUsers = asyncHandler(async (req, res) => {
    const { _id } = req.query
    if (!_id) throw new Error('Missing inputs')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        deleteUser: response ? `User with email ${response.email} deleted` : 'No user delete'
    })
})

const updateUsers = asyncHandler(async (req, res) => {
    //
    const { _id } = req.user
    if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs') /// check xem body có rỗng k 
    const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -role')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
    //
    const { uid } = req.params  // Truy xuất tham số userId từ URL
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs') /// check xem body có rỗng k 
    const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})

const updateUserAddress = asyncHandler(async (req, res) => {
    //
    const { _id } = req.user  // Truy xuất tham số userId từ URL
    if (!req.body.address) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(_id, { $push: { address: req.body.address } }, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})

const updateCart = asyncHandler(async (req, res) => {
    const { _id } = req.user  // Truy xuất tham số userId từ URL
    const { pid, quantity, color } = req.body
    if (!pid || !quantity || !color) throw new Error('Missing inputs') /// check xem body có rỗng k 
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (alreadyProduct) {
        // cập nhật nếu màu sắc trùng khớp
        if (alreadyProduct.color === color) {
            const response = await User.updateOne({ cart: { $elemMatch: alreadyProduct } }, { $set: { "cart.$.quantity": quantity } }, { new: true })
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Some thing went wrong'
            })

        } else {
            // Thêm sản phẩm mới với màu sắc khác vào giỏ hàng
            const response = await User.findByIdAndUpdate(_id, { $push: { cart: { product: pid, quantity, color } } }, { new: true })
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Some thing went wrong'
            })
        }
    } else {
        // Thêm sản phẩm mới vào giỏ hàng vì chưa tồn tại
        const response = await User.findByIdAndUpdate(_id, { $push: { cart: { product: pid, quantity, color } } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            updatedUser: response ? response : 'Some thing went wrong'
        })
    }

})


module.exports = {
    register, login, getCurrent, refreshAccessToken, logout,
    forgotPassword, resetPassword, getUsers,
    deleteUsers, updateUsers, updateUserByAdmin, updateUserAddress, updateCart
}