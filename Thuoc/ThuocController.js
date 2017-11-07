const express = require('express');
const Router = express.Router();
const ThuocDB = require('./ThuocDB');
const Msg = require('../Msg.json');
const ThuocOBJ = require('./ThuocOBJ');
const moment = require('moment');
const Utils = require('../Utils/Utils');
const log = Utils.log4js.getLogger('ThuocController.js');
Utils.ghiLog();

///api/thuoc?timkiem=abc
class AppDSThuocOBJ
{
    constructor(status, msg, nextpage, prepage, dsthuoc)
    {
        this.status = status;
        this.msg = msg;
        this.nextpage = nextpage;
        this.prepage = prepage;
        this.dsthuoc = dsthuoc;
    }
}

Router.get('/', async (req, res) => {
    req.query.timkiem =   req.query.timkiem || "";
    req.query.idnhanvien = parseInt(req.query.idnhanvien) || 0;
    req.query.page = parseInt(req.query.page) || 1;
    try
    {
        if(!Utils.verifyLogin(req.query.idnhanvien, req.headers['token']))
        {
            log.error(Msg.MA_TOKEN_KHONG_DUNG + ": " + req.query.idnhanvien + " - " + req.headers['token']);
            res.send(new AppDSThuocOBJ(false, Msg.MA_TOKEN_KHONG_DUNG, 0, 0, []));
        }
        else
        {
            let result = await ThuocDB.getDSThuoc(req.query.timkiem, req.query.idnhanvien, req.query.page);
            if (result === null) {
                log.error("result null");
                res.send(new AppDSThuocOBJ(false, Msg.KHONG_THANH_CONG, 0, 0, []));
            } else {
                let listThuoc = [];
                let nextpage = 0;
                let prepage = 0;
                
                for (i = 0; i < result.recordsets[0].length; i++) {
                    let obj = new ThuocOBJ();
                    obj.idthuoc = result.recordsets[0][i].IDThuoc;
                    obj.tenthuoc = result.recordsets[0][i].TenThuoc;
                    obj.ngaytao = moment(result.recordsets[0][i].NgayTao[0]).format("DD/MM/YYYY HH:mm:ss");
                    obj.tendonvi = result.recordsets[0][i].TenDonVi;
                    obj.iddonvi = result.recordsets[0][i].ID_DonVi[0];
                    obj.soluongcon = result.recordsets[0][i].SoLuongCon;
                    obj.gianhap = result.recordsets[0][i].GiaNhap;
                    obj.gianhaphienthi = Utils.dinhDangTienTe(obj.gianhap);
                    obj.giaban = result.recordsets[0][i].Gia;
                    obj.giabanhienthi = Utils.dinhDangTienTe(obj.giaban);
                    obj.tendanhmuc = result.recordsets[0][i].TenDanhMuc;
                    obj.noidung = result.recordsets[0][i].NoiDung;
                    obj.trangthai = (result.recordsets[0][i].TrangThaiXoa[0] === true) ? "Hết hiệu lực" : "Còn hiệu lực";
                    listThuoc.push(obj);
                }
                
                //Xem page tiếp theo có dữ liệu không
                console.log(typeof req.query.page,req.query.page);
                //ThuocDB.promiseGetDSThuoc(req.query.timkiem, req.query.idnhanvien, parseInt(req.query.page) + 1);

                if(req.query.page > 1)
                prepage = req.query.page - 1;

                if(listThuoc.length > 0)
                {
                    res.send(new AppDSThuocOBJ(true, Msg.THANH_CONG, nextpage, prepage, listThuoc));
                }
                else
                {
                    res.send(new AppDSThuocOBJ(true, Msg.DA_LOAD_HET_DU_LIEU, nextpage, prepage, []));
                }
            }
        }
    }
    catch(err)
    {
        log.error(err);
        res.send(new AppDSThuocOBJ(true, Msg.KHONG_THANH_CONG, 0, 0, []));
    }
});

module.exports = Router;