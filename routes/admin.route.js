const express = require('express');
const userModel = require('../models/user.model');
const categoryModel = require('../models/category.model');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const productModel = require('../models/product.model');
const cart=require("../models/cart.model");
const config = require('../config/default.json');
const router = express.Router();
const aution = require('../models/aution.model');
const uptoseller = require('../models/uptoseller.model');
const mask = require('mask-text');

///////////////////HOME
router.get('/home', async(req,res)=>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await uptoseller.all();

    res.render('vwAdmin/home', {
        yeucau: rows,
        empty: rows.length==0,
        layout: 'admin_layout.hbs'
    });
})

router.post('/logout',(req,res)=>{
    req.session.isAuthenticated=false;
    req.session.authUser=null;
     res.redirect('/');

})

router.get('/profile',async(req,res)=>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/profile');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await userModel.single(req.session.authUser.IdNguoiDung);
    res.render('vwAdmin/user/update',  {
        nguoidung: rows[0],
        layout: 'admin_layout.hbs'
    });
})

///////////////////CATEGORY
router.get('/category/list', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/category/list');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await categoryModel.all();
    
    res.render('vwAdmin/category/list',  {
        danhmuc: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/category/detail/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows1 = await categoryModel.allOfId(req.params.id);
    const rows2 = await categoryModel.allProductsOfId(req.params.id);
    res.render('vwAdmin/category/detail',  {
        danhmuc: rows1,
        sanpham: rows2,
        empty1: rows1.length == 0,
        empty2: rows2.length == 0,
        layout: 'admin_layout.hbs'
    });
})

router.get('/category/add', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/category/add');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await categoryModel.all();
    
    res.render('vwAdmin/category/add',  {
        danhmuc: rows,
        layout: 'admin_layout.hbs'
      });
})

router.post('/category/add', async (req, res) => {
    let entity = {
        TenDanhMuc: req.body.txtCatName,
        ThuocDanhMuc: req.body.txtCatType,
    }

    const result = await categoryModel.add(entity);

    const rows = await categoryModel.all();
    res.render('vwAdmin/category/list',  {
        danhmuc: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/category/update/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await categoryModel.single(req.params.id);
    const rows_1 = await categoryModel.all();

    res.render('vwAdmin/category/update',  {
        danhmuc1: rows[0],
        danhmuc: rows_1,
        layout: 'admin_layout.hbs'
    });
})

router.post('/category/update/:id', async (req, res) => {
    const result = await categoryModel.patch(req.body);

    const rows = await categoryModel.all();
    res.render('vwAdmin/category/list',  {
        danhmuc: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
  })
  
router.get('/category/delete/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
        
    const rows1 = await categoryModel.allOfId(req.params.id);
    const rows2 = await categoryModel.allProductsOfId(req.params.id);

    if (rows1.length==0 && rows2.length==0)
    {
        const result = await categoryModel.del(req.params.id);

        const rows = await categoryModel.all();
        res.render('vwAdmin/category/list',  {
            danhmuc: rows,
            empty: rows.length === 0,
            layout: 'admin_layout.hbs'
        });
    }

    else
    {
        res.render('vwAdmin/category/delete',  {layout: 'admin_layout.hbs'});
    }
    
})

///////////////////USER
router.get('/user/list', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/user/list');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await userModel.all();
    
    res.render('vwAdmin/user/list',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/add', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/user/add');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await categoryModel.all();
    
    res.render('vwAdmin/user/add',  {layout: 'admin_layout.hbs'});
})

router.post('/user/add', async (req, res) => {
    const N = 10;
    const hash = bcrypt.hashSync(req.body.MatKhau, N);
    const dob = moment(req.body.NgaySinh, 'MM/DD/YYYY').format('YYYY-MM-DD');

    let entity = {
        TenDangNhap: req.body.TenDangNhap,
        MatKhau: hash,
        HoVaTen: req.body.HoVaTen,
        Email: req.body.Email,
        NgaySinh: dob,
        LoaiNguoiDung: req.body.LoaiNguoiDung,
        DiemCong: 0,
        DiemTru: 0,
    }

    const result = await userModel.add(entity);

    const rows = await userModel.all();
    
    res.render('vwAdmin/user/list',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/detail/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await userModel.single(req.params.id);
    res.render('vwAdmin/user/detail',  {
        nguoidung: rows[0],
        isAdmin: rows[0].LoaiNguoiDung==0,
        isBuyer: rows[0].LoaiNguoiDung==1,
        isSeller: rows[0].LoaiNguoiDung==2,
        layout: 'admin_layout.hbs'
    });
})

router.get('/user/upgrade', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/user/upgrade');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await userModel.buyer();
    
    res.render('vwAdmin/user/upgrade',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/upgrade/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let entity = {
        IdNguoiDung: req.params.id,
        LoaiNguoiDung: 2,
    }

    const result = await userModel.patch(entity);
    
    const rows = await userModel.buyer();
    
    res.render('vwAdmin/user/upgrade',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/degrade', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/user/degrade');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await userModel.seller();
    
    res.render('vwAdmin/user/degrade',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/degrade/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let entity = {
        IdNguoiDung: req.params.id,
        LoaiNguoiDung: 1,
    }

    const result = await userModel.patch(entity);
    
    const rows = await userModel.seller();
    
    res.render('vwAdmin/user/degrade',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/user/update/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const rows = await userModel.single(req.params.id);
    res.render('vwAdmin/user/update',  {
        nguoidung: rows[0],
        layout: 'admin_layout.hbs'
    });
})

router.post('/user/update/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    const N = 10;
    const hash = bcrypt.hashSync(req.body.MatKhau, N);
    const dob = moment(req.body.NgaySinh, 'MM/DD/YYYY').format('YYYY-MM-DD');

    let entity = {
        IdNguoiDung: req.body.IdNguoiDung,
        MatKhau: hash,
        HoVaTen: req.body.HoVaTen,
        Email: req.body.Email,
        NgaySinh: dob,
        LoaiNguoiDung: req.body.LoaiNguoiDung,
        DiemCong: req.body.DiemCong,
        DiemTru: req.body.DiemTru,
    }
    
    const result = await userModel.patch(entity);

    
    const rows = await userModel.single(req.params.id);
    res.render('vwAdmin/user/detail',  {
        nguoidung: rows[0],
        isAdmin: rows[0].LoaiNguoiDung==0,
        isBuyer: rows[0].LoaiNguoiDung==1,
        isSeller: rows[0].LoaiNguoiDung==2,
        layout: 'admin_layout.hbs'
    });
})

router.get('/user/delete/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
        
    const result = await userModel.del(req.params.id);

    const rows = await userModel.all();
    
    res.render('vwAdmin/user/list',  {
        nguoidung: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
    });
})

router.get('/user/accept/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let entity = {
        IdNguoiDung: req.params.id,
        LoaiNguoiDung: 2,
    }

    const result = await userModel.patch(entity);
    
    const result_del = await uptoseller.del(req.params.id);

    const rows = await uptoseller.all();
    
    res.render('vwAdmin/home',  {
        yeucau: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
    });
})

router.get('/user/refuse/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
        
    const result = await uptoseller.del(req.params.id);

    const rows = await uptoseller.all();
    
    res.render('vwAdmin/home',  {
        yeucau: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
    });
})

///////////////PRODUCT
router.get('/product/list', async (req, res) =>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/product/list');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    const rows = await productModel.all();
    
    res.render('vwAdmin/product/list',  {
        sanpham: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
      });
})

router.get('/product/detail/:id', async(req,res)=>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
    
    let rows = await productModel.single(req.params.id);
    
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
        
        c.NguoiThang = nguoithang[0];
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.NgayHetHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY")
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    }
    if(nguoithang[0]!=null)
    nguoithang[0].HoVaTen=mask(nguoithang[0].HoVaTen,0,nguoithang[0].HoVaTen.length-5,'*');

    rows[0].NgayDang = moment(rows[0].NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].NgayHetHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].ThoiHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();

    danhmuc = await categoryModel.single(rows[0].LoaiSanPham);
    res.render('vwAdmin/product/detail', {
        product: rows[0],
        LoaiSanPham: danhmuc[0],
        NguoiBan: nguoiban[0],
        NguoiThang: nguoithang[0],
        listImages: listImages,
        layout: 'admin_layout.hbs'
    });
})

router.get('/product/bidder/:id', async(req,res)=>{
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let bidders = await aution.single(req.params.id);

    res.render('vwAdmin/product/bidder', {
        bidder: bidders,
        layout: 'admin_layout.hbs'
    });
})

router.get('/product/update/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let rows = await productModel.single(req.params.id);

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
        
        c.NguoiThang = nguoithang[0];
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.NgayHetHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    }
    if(nguoithang[0]!=null)
    nguoithang[0].HoVaTen=mask(nguoithang[0].HoVaTen,0,nguoithang[0].HoVaTen.length-5,'*');

    rows[0].NgayDang = moment(rows[0].NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].NgayHetHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].ThoiHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();

    danhmuc = await categoryModel.all();
    res.render('vwAdmin/product/update', {
        product: rows[0],
        LoaiSanPham: danhmuc,
        NguoiBan: nguoiban[0],
        NguoiThang: nguoithang[0],
        listImages: listImages,
        layout: 'admin_layout.hbs'
    });
})

router.post('/product/update/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');

    let entity = {
        IdSanPham: req.body.IdSanPham,
        TenSanPham: req.body.TenSanPham,
        LoaiSanPham: req.body.LoaiSanPham,
        ChiTiet: req.body.ChiTiet,
        GiaKhoiDiem: req.body.GiaKhoiDiem,
        GiaBanToiThieu: req.body.GiaBanToiThieu,
        GiaHienTai: req.body.GiaHienTai,
        GiaMuaNgay: req.body.GiaMuaNgay,
        SoLuotRaGia: req.body.SoLuotRaGia,
        BuocGia: req.body.BuocGia,
        TinhTrang: req.body.TinhTrang,
        DanhGia: req.body.DanhGia,
    }
    
    const result = await productModel.patch(entity);

    let rows = await productModel.single(req.params.id);
    
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
        
        c.NguoiThang = nguoithang[0];
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    }
    if(nguoithang[0]!=null)
    nguoithang[0].HoVaTen=mask(nguoithang[0].HoVaTen,0,nguoithang[0].HoVaTen.length-5,'*');

    rows[0].NgayDang = moment(rows[0].NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].NgayHetHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
    rows[0].ThoiHan = moment(rows[0].NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();

    danhmuc = await categoryModel.single(rows[0].LoaiSanPham);
    res.render('vwAdmin/product/detail', {
        product: rows[0],
        LoaiSanPham: danhmuc[0],
        NguoiBan: nguoiban[0],
        NguoiThang: nguoithang[0],
        listImages: listImages,
        layout: 'admin_layout.hbs'
    });
})

router.get('/product/delete/:id', async (req, res) => {
    if(req.session.isAuthenticated==false){
        return res.redirect('/account/login?retUrl=/admin/home');
    }
    
    if (req.session.authUser.LoaiNguoiDung!=0)
        return res.render('vwError/permission');
        
    const result = await productModel.del(req.params.id);

    const rows = await productModel.all();
    
    res.render('vwAdmin/product/list',  {
        sanpham: rows,
        empty: rows.length === 0,
        layout: 'admin_layout.hbs'
    });
})
module.exports = router;