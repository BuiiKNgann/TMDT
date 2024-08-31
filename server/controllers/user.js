const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')

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

module.exports = {
    register, login, getCurrent
}