const express = require('express')
require('dotenv').config()
const dbConnect = require('./config/dbconnect')

const app = express()
const port = process.env.PORT || 8888
app.use(express.json()) // express có thể đọc hiểu data phía client gửi lên theo dạng json
app.use(express.urlencoded({ extended: true })) // gửi theo url code sẽ đọc được

dbConnect()
app.use('/', (req, res) => {
    res.send('server on')
})

app.listen(port, () => {
    console.log('server running on the ports: ', port);

})