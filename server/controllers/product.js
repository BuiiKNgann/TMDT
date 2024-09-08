const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot create new product'
    })
})


const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})

// Tìm tất cả: filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query }// copy req.query , liên quan đến kiểu dữ liệu tham chiếu


    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])

    //Format lại các operators cho đúng cú pháp mongoose
    //query nhận từ client không có dấu $
    let queryString = JSON.stringify(queries) // chuyển query thành chuỗi json
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, macthedEl => `$${macthedEl}`)
    const formatedQueries = JSON.parse(queryString) // chuyển lại object
    console.log(formatedQueries);


    //Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' }
    let queryCommand = Product.find(formatedQueries) // đang pending
    // Sorting
    if (req.query.sort) {

        // Khi muốn sort nhiều trường client gửi lên bằng dấu , ta convert thành dấu cách
        const sortBy = req.query.sort.split(',').join('') //  [-price,-brand] thành -price-brand
        queryCommand = queryCommand.sort(sortBy) //phân biệt âm dương
        console.log(sortBy);

    }

    //Fields limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }
    //Pagination
    //limit: số object: lấy về 1 lần gọi api
    // skip: 2 -> bỏ qua 2 cái đầu

    // '2' => +2 => 2
    // lúc nào cần giá trị mới dùng if
    const page = +req.query.page || 1 //convert string sang số -> +
    const limit = req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)



    //Execute query
    // Số lượng sản phẩm thoả mãn điều kiện !== số lượng sp trả về 1 lần gọi API
    queryCommand.exec(async (err, response) => {
        if (err) throw new Error(err.message)
        const counts = await Product.find(formatedQueries).countDocuments()// tìm số lượng sp thoã điều kiện
        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : 'Cannot get products',

        })
    })

})



const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update products'
    })
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        updatedProduct: deletedProduct ? deletedProduct : 'Cannot delete products'
    })
})

const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid } = req.body
    if (!star || !pid) throw new Error('Missing inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    console.log({ alreadyRating });

    if (alreadyRating) {
        // Đánh giá rồi sẽ sửa
        //update start & comment
        await Product.updateOne({
            ratings: { $elemMatch: alreadyRating } // $elemMatch tương đương hàm find
        }, {
            // sửa pt có sẵn trong mảng
            $set: { "ratings.$.star": star, "ratings.$.comment": comment } // $ là tượng trưng cho cái object ratings/models thoả mãn điều kiện $elemMatch
        }, { new: true })
    } else {
        //chưa đánh giá sẽ thêm 
        // add start & comment
        const response = await Product.findByIdAndUpdate(pid, {
            $push: { ratings: { star, comment, postedBy: _id } }
        }, { new: true })
        // console.log(response);

    }
    // Sum ratings: Tống sum / số người vote
    const updatedProduct = await Product.findById(pid)
    const ratingCount = updatedProduct.ratings.length
    const sumRatings = updatedProduct.ratings.reduce((sum, el) => sum + +el.star, 0)
    updatedProduct.totalRatings = Math.round(sumRatings * 10 / ratingCount) / 10
    await updatedProduct.save()

    return res.status(200).json({
        status: true,
        updatedProduct
    })

})
const uploadImagesProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (!req.files) throw new Error('Missing inputs')
    const response = await Product.findByIdAndUpdate(pid, { $push: { images: { $each: req.files.map(el => el.path) } } }, { new: true })
    return res.status(200).json({
        status: response ? true : false,
        updatedProduct: response ? response : 'Cannot upload images product'
    })
})



module.exports = {
    createProduct, getProduct, getProducts,
    updateProduct, deleteProduct,
    ratings, uploadImagesProduct,
}