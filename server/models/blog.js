const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true,

    },
    category: {
        type: String,
        required: true,

    },
    numberViews: {
        type: Number,
        default: 0
    },

    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    dislikes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    image: {
        type: String,
        default: 'https://wallpaperaccess.com/full/2433830.jpg'
    },
    author: {
        type: String,
        default: 'Admin'
    }
}, {
    timestamps: true,
    toJSON: { virtual: true },
    // chỉ chạy thì dùng hàm json
    // virtual là thuộc tính, giá trị không được định nghĩa trong model nhưng vẫn tạo ra được 
    toObject: { virtual: true }
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);