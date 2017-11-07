const thuocOBJ = require('./thuocOBJ');
const config = require('../config.json');
const express = require('express');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('ThuocDB.js');
Utils.ghiLog();

const sql = require('mssql');

const getDSThuoc = async (timkiem, idnhanvien, page) => {
    
    let pool = await sql.connect(config);
    let result = await pool.request()
    .input('idnhanvien', sql.Int, idnhanvien)
    .input('timkiem', sql.NVarChar(100), timkiem)
    .input('page', sql.Int, page)
    .execute('sp_MyCareDesktop_DanhSachThuoc');

    sql.close();
    return result;
}


sql.on('error', err => {
    // ... error handler
})

module.exports = {
    getDSThuoc
}
