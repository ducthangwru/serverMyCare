const express = require('express');
const Router = express.Router();
const TaiKhoanDB = require('./TaiKhoanDB');
const Msg = require('../Msg.json');
const moment = require('moment');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('TaiKhoanController.js');
Utils.ghiLog();

///api/taikhoan
class AppThongTinTaiKhoanOBJ
{
    constructor(status, msg, token, TaikhoanOBJ)
    {
        this.status = status;
        this.msg = msg;
        this.token = token;
        this.thongtin = TaikhoanOBJ;
    }
}

//api/taikhoan/login  body {"taikhoan" : "admin", "matkhau" : "202cb962ac59075b964b07152d234b70"}
Router.post('/login', async (req, res) => {
    let user = {};
   
    try
    {
        user.taikhoan = (req.body.taikhoan = req.body.taikhoan || "");
        user.matkhau = (req.body.matkhau = req.body.matkhau || "");
        user.idpush = (req.body.idpush = req.body.idpush || "");

        let result = await TaiKhoanDB.loginUser(user);
        if (result === null) {
            res.send(new AppThongTinTaiKhoanOBJ(false, Msg.KHONG_THANH_CONG, "", null));
        } else {
            let obj = null;
            for (i = 0; i < result.recordsets[0].length; i++) {
                obj = {}
                obj.idtaikhoan = result.recordsets[0][i].ID[0];
                obj.tentaikhoan = result.recordsets[0][i].TenTaiKhoan;
                obj.tendangnhap = result.recordsets[0][i].TenDangNhap;
                obj.tennhomtk = result.recordsets[0][i].TenNhomTK;
                obj.ngaytao = moment(result.recordsets[0][i].NgayTao[0]).format("DD/MM/YYYY HH:mm:ss");
                obj.trangthai = (result.recordsets[0][i].TrangThaiXoa[0] === true) ? "Vô hiệu hóa" : "Kích hoạt";
            }
            
            let token = "";

            if(obj != null)
            {
                token = Utils.getToken(obj.idtaikhoan);
                let themLSDangNhap = TaiKhoanDB.themLSDangNhap(obj.idtaikhoan, 1);
                //Utils.pushNotification(0, user.idpush, 'TrangChu', 'Đăng nhập thành công!');
                res.send(new AppThongTinTaiKhoanOBJ(true, Msg.THANH_CONG, token, obj));
            }
            else
            {
                log.error(Msg.TENTK_MK_KHONG_DUNG + JSON.stringify(req.body));
                res.send(new AppThongTinTaiKhoanOBJ(false, Msg.TENTK_MK_KHONG_DUNG, "", null));
            }
        }
    }
    catch(err){
        log.error(err);
        res.send(new AppThongTinTaiKhoanOBJ(false, Msg.KHONG_THANH_CONG, "", null));
    }
});


//api/taikhoan/logout?idnhanvien=2 token header
Router.get('/logout', async (req, res) => {
    try
    {
        req.query.idnhanvien = req.query.idnhanvien || 0;

        if(!Utils.verifyLogin(req.query.idnhanvien, req.headers['token']) || req.query.idnhanvien === 0)
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.query.idnhanvien + " - " + req.headers['token']);
            res.send({ status : false, msg : Msg.MA_TOKEN_KHONG_DUNG});
        }
        else
        {
            let result = await TaiKhoanDB.themLSDangNhap(req.query.idnhanvien, 2);
            console.log(result);
            if(result.rowsAffected[0] > 0)
                res.send({ status : true, msg : Msg.THANH_CONG});
            else
                res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
        }
    }   
    catch(err){
        log.error(err);
        res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
    }
});

//api/taikhoan/doimatkhau token header   body { "idtaikhoan" : 2, "matkhaucu" : "202cb962ac59075b964b07152d234b70", "matkhaumoi" : "25d55ad283aa400af464c76d713c07ad"}
Router.post('/doimatkhau', async(req, res) => {
    try
    {
        if(!Utils.verifyLogin(req.body.idtaikhoan, req.headers['token']))
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.body.idtaikhoan + " - " + req.headers['token']);
            res.send({ status : false, msg : Msg.MA_TOKEN_KHONG_DUNG});
        }
        else
        {
            let user = {}
            user.idtaikhoan = req.body.idtaikhoan;
            user.matkhaucu = req.body.matkhaucu;
            user.matkhaumoi = req.body.matkhaumoi;
    
            let result = await TaiKhoanDB.doiMatKhau(user);

            if(parseInt(result.recordset[0].Status) === 1)
                res.send({ status : true, msg : Msg.THANH_CONG});
            else
                res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
        }
    }
    catch(err)
    {
        log.error(err);
        res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
    }
});

//api/taikhoan/resetmatkhau?idtaikhoan=2
Router.get('/resetmatkhau', async(req, res) => {
    try
    {
        if(!Utils.verifyLogin(req.body.idtaikhoan, req.headers['token']))
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.body.idtaikhoan + " - " + req.headers['token']);
            res.send({ status : false, msg : Msg.MA_TOKEN_KHONG_DUNG});
        }
        else
        {
            let user = {}
            user.idtaikhoan = req.body.idtaikhoan;
            user.matkhau = Utils.MD5('12345678');
    
            let result = await TaiKhoanDB.resetMatKhau(user);

            if(parseInt(result.rowsAffected[0])  > 0)
                res.send({ status : true, msg : Msg.THANH_CONG});
            else
                res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
        }
    }
    catch(err)
    {
        log.error(err);
        res.send({ status : false, msg : Msg.KHONG_THANH_CONG});
    }
});


module.exports = Router;