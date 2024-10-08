const express = require('express')
require('dotenv').config()
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'GET', 'DELETE']
}))
app.use(cookieParser())
const port = process.env.PORT || 8888
app.use(express.json()) // express có thể đọc hiểu data phía client gửi lên theo dạng json
app.use(express.urlencoded({ extended: true })) // gửi theo url code sẽ đọc được

dbConnect()
initRoutes(app)
app.use('/', (req, res) => {
    res.send('server on')
})

app.listen(port, () => {
    console.log('server running on the ports: ', port);

})