const express = require('express');
const bodyParser = require('body-parser');
const configPort = require('./configPort.json');
const thuocApi = require('./Thuoc/ThuocController');
const taiKhoanApi = require('./TaiKhoan/TaiKhoanController');
const hoaDonApi = require('./HoaDon/HoaDonController');
var app = express();

app.use(bodyParser.json({ extended : true}));
app.use(bodyParser.urlencoded({ extended : true}));

app.use('/api/thuoc', thuocApi);
app.use('/api/taikhoan', taiKhoanApi);
app.use('/api/hoadon', hoaDonApi);

app.listen(configPort.port , () => {
    console.log(`App listen on ${configPort.port}`);
})
