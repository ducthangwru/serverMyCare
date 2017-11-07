const taiKhoanOBJ = require('./TaiKhoanOBJ');
const config = require('../config.json');
const express = require('express');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('TaiKhoanDB.js');
Utils.ghiLog();
const sql = require('mssql');

//api/taikhoan body {"taikhoan" : "admin", "matkhau" : "202cb962ac59075b964b07152d234b70"}
const loginUser = async (user) => {
    try
    {
        let pool = await sql.connect(config);
        let result = await pool.request()
        .input('taikhoan', sql.NVarChar(50), user.taikhoan)
        .input('matkhau', sql.NVarChar(50), user.matkhau)
        .execute('sp_MyCareDesktop_DangNhap');

        sql.close();
        return result;
    }
    catch(err)
    {
        log.error(err);
        return null;
    }
}

const themLSDangNhap = async (idnhanvien, type) => {
    try
    {
        let pool = await sql.connect(config);
        let result = await pool.request()
        .input('idtaikhoan', sql.Int, idnhanvien)
        .input('type', sql.Int, type)
        .execute('sp_MyCareDesktop_ThemLichSuDangNhap');

        sql.close();
        return result;
    }
    catch(err)
    {
        log.error(err);
        return null;
    }
}

const doiMatKhau = async(user) => {
    try
    {
        let pool = await sql.connect(config);
        let result = await pool.request()
        .input('idtaikhoan', sql.Int, user.idtaikhoan)
        .input('matkhaucu', sql.NVarChar(50), user.matkhaucu)
        .input('matkhaumoi', sql.NVarChar(50), user.matkhaumoi)
        .execute('sp_MyCareDesktop_DoiMatKhau');

        sql.close();
        return result;
    }
    catch(err)
    {
        log.error(err);
        return null;
    }
}

sql.on('error', err => {
    log.error(err);
})

module.exports = {
    loginUser,
    themLSDangNhap,
    doiMatKhau
}
