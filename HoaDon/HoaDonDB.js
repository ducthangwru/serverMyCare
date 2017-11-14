const config = require('../config.json');
const express = require('express');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('HoaDonDB.js');
Utils.ghiLog();
const sql = require('mssql');

const getDSHoaDon = async (timkiem, idtaikhoan, page) => {
    sql.close();
    let pool = await sql.connect(config);
    let result = await pool.request()
    .input('idnhanvien', sql.Int, idtaikhoan)
    .input('timkiem', sql.NVarChar(100), timkiem)
    .input('page', sql.Int, page)
    .execute('sp_MyCareDesktop_DanhSachHoatDongGanDay');

    sql.close();
    return result;
}

const getDSChiTietHoaDon = async (idhoadon) => {
    sql.close();
    let pool = await sql.connect(config)
    let result = await pool.request()
    .input('idhoadon', sql.Int, idhoadon)
    .execute('sp_AppMyCare_DanhSachChiTietHoaDon');

    sql.close();
    return result;
}


sql.on('error', err => {
    // ... error handler
})

module.exports = {
    getDSHoaDon,
    getDSChiTietHoaDon
}
