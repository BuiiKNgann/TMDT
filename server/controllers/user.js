const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')

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
        const { password, role, ...userData } = response.toObject()
        // tạo accessToken
        const accessToken = generateAccessToken(response._id, role)
        //tạo refresh token
        const refreshToken = generateRefreshToken(response._id)
        //lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true })
        // lưu refresh token vào cookie
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }) // lưu millisecond trong 7 ngày
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
        success: true,
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

    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`
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
module.exports = {
    register, login, getCurrent, refreshAccessToken, logout, forgotPassword, resetPassword
}