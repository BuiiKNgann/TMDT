const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

//Tạo giỏ hàng
const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { coupon } = req.body
    const userCart = await User.findById(_id).select('cart').populate('cart.product', 'title price')

    const products = userCart?.cart?.map(el => ({
        product: el.product._id,
        count: el.quantity,
        color: el.color
    }))
    let total = userCart?.cart?.reduce((sum, el) => el.product.price * el.quantity + sum, 0)

    const createData = { products, total, orderBy: _id }
    //Xử lý mã giảm giá (nếu có)
    if (coupon) {
        const selectedCoupon = await Coupon.findById(coupon)
        total = Math.round(total * (1 - +selectedCoupon?.discount / 100) / 1000) * 1000 || total  //   làm tròn 3 số cuối
        createData.total = total
        createData.coupon = coupon
    }
    console.log(total);
    //Tạo đơn hàng và trả về phản hồi
    const rs = await Order.create(createData)
    return res.json({
        success: rs ? true : false,
        rs: rs ? rs : 'Something went wrong',

    })
})

const updateStatus = asyncHandler(async (req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if (!status) throw new Error('Missing status')
    const response = await Order.findByIdAndUpdate(oid, { status }, { new: true })
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Something went wrong',

    })
})


const getUserOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const response = await Order.find({ orderBy: _id })
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Something went wrong',

    })
})


const getOrders = asyncHandler(async (req, res) => {
    const response = await Order.find()
    return res.json({
        success: response ? true : false,
        response: response ? response : 'Something went wrong',

    })
})

module.exports = {
    createOrder, updateStatus, getUserOrder, getOrders
}