const express = require('express');
const moment = require('moment');
const mask=require('mask-text');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const config = require('../config/default.json');
const multer = require('multer');
const restrict = require('../middlewares/auth.mdw');
const fs = require('fs');

const aution=require('../models/aution.model');


const router = express.Router();

router.get('/:id', async (req, res) => {
    
    
    let rows = await productModel.single(req.params.id);
    let bidders=await aution.single(req.params.id);
    let [rows1, nguoiban, nguoithang] = await Promise.all([
        productModel.allByCat(rows[0].LoaiSanPham),
        userModel.single(rows[0].IdNguoiBan),
        userModel.single(rows[0].IdNguoiThang)
    ]);
    let listImages = [];
    for (let i = 0; i< rows[0].SoHinh; i++) listImages[i] = i+1; 

    for (let i = rows1.length - 1; i >= 0; i--) {
        if (rows1[i].IdSanPham === rows[0].IdSanPham) rows1.splice(i, 1);
    }
    for (let c of rows1) {
        let nguoithang = await userModel.single(c.IdNguoiThang);
        if(nguoithang[0]!=null) {
            
        c.NguoiThang = nguoithang[0];
        c.NguoiThang.HoVaTen = mask(nguoithang[0].HoVaTen,0,nguoithang[0].HoVaTen.length-5,'*');
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
        }
    }
    if(nguoithang[0]!=null)
    nguoithang[0].HoVaTen=mask(nguoithang[0].HoVaTen,0,nguoithang[0].HoVaTen.length-5,'*');
    nguoiban[0].HoVaTen=mask(nguoiban[0].HoVaTen,0,nguoiban[0].HoVaTen.length-5,'*');
    for(let c of bidders){
        c.NgayDauGia=moment(c.NgayDauGia, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY hh:mm");
        c.TenNguoiMua=mask(c.TenNguoiMua,0,c.TenNguoiMua.length-4,'*');
    }


    rows[0].NgayDang = moment(rows[0].NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].ThoiHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    let muangay=false;
    if(rows[0].GiaMuaNgay!=0)
    {
        muangay=true;
    }

    res.render('vwProducts/singleProduct', {
        SanPhamLienQuan: rows1,
        product: rows[0],
        NguoiBan: nguoiban[0],
        NguoiThang: nguoithang[0],
        listImages: listImages,
        danhsachdaugia:bidders,
        cogiamuangay:muangay
    });
})




module.exports = router;