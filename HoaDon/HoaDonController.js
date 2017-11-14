const express = require('express');
const Router = express.Router();
const HoaDonDB = require('./HoaDonDB');
const Msg = require('../Msg.json');
const moment = require('moment');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('HoaDonController.js');
Utils.ghiLog();

///api/thuoc?timkiem=abc
class AppDSHoaDonOBJ
{
    constructor(status, msg, nextpage, prepage, tongsoitem, dshoadon)
    {
        this.status = status;
        this.msg = msg;
        this.nextpage = nextpage;
        this.prepage = prepage;
        this.tongsoitem = tongsoitem;
        this.dshoadon = dshoadon;
    }
}

Router.get('/', async (req, res) => {
    req.query.idtaikhoan = parseInt(req.query.idtaikhoan) || 0;
    req.query.idhoadon = parseInt(req.query.idhoadon) || 0;
    try
    {
        if(!Utils.verifyLogin(req.query.idtaikhoan, req.headers['token']))
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.query.idtaikhoan + " - " + req.headers['token']);
            res.send({status : false, msg : Msg.MA_TOKEN_KHONG_DUNG, dschitiethd : []});
        }
        else
        {
            let result = await HoaDonDB.getDSChiTietHoaDon(req.query.idhoadon);
            if (result === null) {
                log.error("result null");
                res.send({status : false, msg : Msg.KHONG_THANH_CONG, dschitiethd : []});
            } else {
                let ds = [];
                
                for (i = 0; i < result.recordsets[0].length; i++) {
                    let obj = {}
                    console.log(result.recordsets[0][i]);
                    obj.idchitiethoadon = result.recordsets[0][i].ID_ChiTietHoaDon;
                    obj.idhoadon = result.recordsets[0][i].ID_HoaDon;
                    obj.idthuoc = result.recordsets[0][i].ID_Thuoc;
                    obj.soluong = result.recordsets[0][i].SoLuong;
                    obj.tendonvi = result.recordsets[0][i].TenDonVi;
                    obj.tenthuoc = result.recordsets[0][i].TenThuoc;
                    obj.tongtien = result.recordsets[0][i].TongTien;
                    obj.tongtienhienthi = Utils.dinhDangTienTe(obj.tongtien);
                    obj.tienlai = result.recordsets[0][i].TienLai;
                    obj.tienlaihienthi = Utils.dinhDangTienTe(obj.tienlai);
                    obj.ngaytao = moment(result.recordsets[0][i].NgayTao).format("DD/MM/YYYY HH:mm:ss");
                    ds.push(obj);
                }
                
                if(ds.length > 0)
                {
                    res.send({status : true, msg : Msg.THANH_CONG, dschitiethd : ds});
                }
                else
                {
                    res.send({status : false, msg : Msg.KHONG_THANH_CONG, dschitiethd : []});
                }
            }
        }
    }
    catch(err)
    {
        log.error(err);
        res.send({status : false, msg : Msg.KHONG_THANH_CONG, dschitiethd : []});
    }
});

Router.get('/', async (req, res) => {
    req.query.timkiem =   req.query.timkiem || "";
    req.query.idtaikhoan = parseInt(req.query.idtaikhoan) || 0;
    req.query.page = parseInt(req.query.page) || 1;
    try
    {
        if(!Utils.verifyLogin(req.query.idtaikhoan, req.headers['token']))
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.query.idtaikhoan + " - " + req.headers['token']);
            res.send(new AppDSHoaDonOBJ(false, Msg.MA_TOKEN_KHONG_DUNG, 0, 0, 0, []));
        }
        else
        {
            let result = await HoaDonDB.getDSHoaDon(req.query.timkiem, req.query.idtaikhoan, req.query.page);
            if (result === null) {
                log.error("result null");
                res.send(new AppDSHoaDonOBJ(false, Msg.KHONG_THANH_CONG, 0, 0, 0, []));
            } else {
                let listHoaDon = [];
                let nextpage = 0;
                let prepage = 0;
                let tongsoitem = 0;
                
                for (i = 0; i < result.recordsets[0].length; i++) {
                    let obj = {};
                    obj.idhoadon = result.recordsets[0][i].ID_HoaDon;
                    obj.idtaikhoan = result.recordsets[0][i].ID_NhanVien;
                    obj.idkhachhang = result.recordsets[0][i].ID_KhachHang[0];
                    obj.ghichu = result.recordsets[0][i].GhiChu;
                    obj.tenkhachhang = (result.recordsets[0][i].TenKhachHang === null) ? "Không có dữ liệu khách hàng" : result.recordsets[0][i].TenKhachHang;
                    obj.tentaikhoan = result.recordsets[0][i].TenTaiKhoan;
                    obj.tongtien = result.recordsets[0][i].TongTien;
                    obj.tongtienhienthi = Utils.dinhDangTienTe(obj.tongtien);
                    obj.tienlai = result.recordsets[0][i].TienLai;
                    obj.tienlaihienthi = Utils.dinhDangTienTe(obj.tienlai);
                    obj.tenthaotac = result.recordsets[0][i].TenThaoTac;
                    obj.ngaytao = moment(result.recordsets[0][i].NgayTaoHD).format("DD/MM/YYYY HH:mm:ss");
                    listHoaDon.push(obj);
                }
                
                let resultTongSoItem = await HoaDonDB.getDSHoaDon(req.query.timkiem, req.query.idtaikhoan, 0);
                tongsoitem = resultTongSoItem.recordsets[0][0].SoLuong;

                let resultNextPage = await HoaDonDB.getDSHoaDon(req.query.timkiem, req.query.idtaikhoan, req.query.page + 1);
                if(resultNextPage.recordsets[0].length > 0)
                    nextpage = req.query.page + 1;

                if(req.query.page > 1)
                    prepage = req.query.page - 1;

                if(listHoaDon.length > 0)
                {
                    res.send(new AppDSHoaDonOBJ(true, Msg.THANH_CONG, nextpage, prepage, tongsoitem, listHoaDon));
                }
                else
                {
                    res.send(new AppDSHoaDonOBJ(true, Msg.DA_LOAD_HET_DU_LIEU, nextpage, prepage, tongsoitem, []));
                }
            }
        }
    }
    catch(err)
    {
        log.error(err);
        res.send(new AppDSHoaDonOBJ(false, Msg.KHONG_THANH_CONG, 0, 0, 0, []));
    }
});

module.exports = Router;