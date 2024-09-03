const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,

    },
    lastname: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    cart: [{
        product: { type: mongoose.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        color: String

    }],
    address: { type: Array, default: [] },

    wishlist: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
    isBlocked: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    passwordChangedAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    //isModified password nếu thay đổi sẽ trả về true để hash, không thay đổi là false
    if (!this.isModified('password')) {
        next() // return 
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password) // so sánh password
    },
    createPasswordChangedToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex') // lưu
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000 // minisecond
        return resetToken // Gửi link 
    }
}



//Export the model
module.exports = mongoose.model('User', userSchema);