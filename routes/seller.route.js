const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const config = require('../config/default.json');
const multer = require('multer');
const allowModel = require('../models/allow.model');
const restrict = require('../middlewares/auth.mdw');
const auctionModel = require('../models/aution.model');
const fs = require('fs');
const nodemailer = require('nodemailer');




const router = express.Router();

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "webapponlineauction@gmail.com",
        pass: "OnlineAuction99"
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
})


router.get('/insertProduct', restrict, (req, res) => {
    res.render('vwSeller/insertProduct');
})

router.post('/insertProduct', async (req, res) => {
    let current = moment();
    const storage = multer.diskStorage({
        filename: function (req, file, cb) {
            cb(null, file.originalname + '-' + current.format('YYYYMMDDhhmmss') + '.jpg');
        },
        destination: function (req, file, cb) {
            cb(null, `./public/images/`);
        },
    });
    const upload = multer({ storage });
    upload.array('fuMain', 10)(req, res, err => {
        if (err) { }
        res.redirect('/');
        let hethan = moment(current).add(10, 'days');
        let entity = {
            TenSanPham: req.body.txtTensanpham,
            LoaiSanPham: req.body.idCat,
            ChiTiet: req.body.FullDes,
            GiaKhoiDiem: req.body.numGiakhoidiem,
            NgayDang: current.format('YYYY-MM-DD hh:mm:ss'),
            NgayHetHan: hethan.format('YYYY-MM-DD hh:mm:ss'),
            BuocGia: req.body.numBuocGia,
            TuGiaHan: req.body.giahan,
            TinhTrang: 0,
            GiaHienTai: req.body.numGiakhoidiem,
            IdNguoiBan: req.session.authUser.IdNguoiDung,
            GiaMuaNgay: req.body.numGiamuangay,
            DanhGia: 0,
            SoLuotRaGia: 0,
            SoHinh: req.files.length,
        };
        let listFilename = [];
        for (let i = 0; i < req.files.length; i++) {
            listFilename[i] = req.files[i].filename;
        }
        (async (entity, current, listFilename) => {
            const result = await productModel.add(entity);
            console.log(current.format('YYYY-MM-DD hh:mm:ss'));
            const newProduct = await productModel.singleWithDatetime(current.format('YYYY-MM-DD hh:mm:ss'));
            console.log(newProduct[0]);
            fs.mkdir('./public/images/product/' + newProduct[0].IdSanPham, { recursive: true }, (err) => {
                if (err) throw err;
            });

            for (let i = 1; i <= listFilename.length; i++) {
                fs.rename('./public/images/' + listFilename[i - 1], './public/images/product/' + newProduct[0].IdSanPham + '/' + i + '.jpg', function (err) {
                    if (err) console.log('ERROR: ' + err);
                });
            }

        })(entity, current, listFilename);


    });
})

router.get('/productAvailable', restrict, async (req, res) => {
    for (const c of res.locals.lcCategories[1]) {
        if (c.IdDanhMuc === +req.params.id) {
            c.isActive = true;
        }
    }

    const sellerId = res.locals.authUser.IdNguoiDung;
    const limit = config.paginate.limit;

    let page = req.query.page || 1;
    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;

    let [total, rows] = await Promise.all([
        productModel.countAvailableBySeller(sellerId),
        productModel.pageAvailableBySeller(sellerId, offset)
    ]);

    for (let c of rows) {
        let nguoithang = await userModel.single(c.IdNguoiThang);
        c.NguoiThang = nguoithang[0];
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    }

    let nPages = Math.floor(total / limit);
    if (total % limit > 0) nPages++;
    if (page > nPages) page = nPages;
    let page_numbers = [];
    for (i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        })
    }
    res.render('vwSeller/ownProduct', {
        num_of_page: nPages,
        isPage: +page,
        products: rows,
        empty: rows.length === 0,
        page_numbers,
        prev_value: +page - 1,
        next_value: +page + 1,
    });
})

router.get('/productAuctioned', restrict, async (req, res) => {
    for (const c of res.locals.lcCategories[1]) {
        if (c.IdDanhMuc === +req.params.id) {
            c.isActive = true;
        }
    }

    const sellerId = res.locals.authUser.IdNguoiDung;
    const limit = config.paginate.limit;
    console.log(res.locals.authUser.IdNguoiDung);

    let page = req.query.page || 1;
    if (page < 1) page = 1;
    const offset = (page - 1) * config.paginate.limit;

    let [total, rows] = await Promise.all([
        productModel.countAuctionedBySeller(sellerId),
        productModel.pageAuctionedBySeller(sellerId, offset)
    ]);

    for (let c of rows) {
        let nguoithang = await userModel.single(c.IdNguoiThang);
        c.NguoiThang = nguoithang[0];
        c.NgayDang = moment(c.NgayDang, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY");
        c.ThoiHan = moment(c.NgayHetHan, "YYYY-MM-DD hh:mm:ss").fromNow();
    }

    let nPages = Math.floor(total / limit);
    if (total % limit > 0) nPages++;
    if (page > nPages) page = nPages;
    let page_numbers = [];
    for (i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        })
    }

    res.render('vwSeller/ownProduct', {
        isAuctioned: true,
        num_of_page: nPages,
        isPage: +page,
        products: rows,
        empty: rows.length === 0,
        page_numbers,
        prev_value: +page - 1,
        next_value: +page + 1,
    });
})

router.post('/addDescription/:id', restrict, async (req, res) => {
    const id = req.params.id;
    let rows = await productModel.single(id);
    let current = moment().format('DD-MM-YYYY');
    rows[0].ChiTiet = rows[0].ChiTiet + '<br>- <span class = "fa fa-pencil"></span> ' + current + ':<br>' + req.body.FullDes;
    const result = await productModel.patch(rows[0]);
    res.redirect('/products/' + id);
})

router.post('/voteLike/bidder=:id1/product=:id2', async (req, res) => {
    const idBidder = req.params.id1;
    const idProduct = req.params.id2;

    console.log(idBidder, idProduct);
    let rows1 = await userModel.single(idBidder);
    let rows2 = await productModel.single(idProduct);
    rows1[0].DiemCong = rows1[0].DiemCong + 1;
    rows2[0].DanhGia = 1;
    const result1 = await userModel.patch(rows1[0]);
    const result2 = await productModel.patch(rows2[0]);
    let check = await transporter.sendMail({
        from: "webapponlineauction@gmail.com",
        to: rows1[0].Email,
        subject: "Thông báo Đánh giá✔", // Subject line
        text: "Like", // plain text body
        html: "Bạn được <b>Like</b> tại giao dịch sản phẩm " + rows2[0].TenSanPham // html body
    });
    res.redirect('/seller/productAuctioned');
})
router.post('/voteDislike/bidder=:id1/product=:id2', async (req, res) => {
    const idBidder = req.params.id1;
    const idProduct = req.params.id2;
    let rows1 = await userModel.single(idBidder);
    let rows2 = await productModel.single(idProduct);
    rows1[0].DiemTru = rows1[0].DiemTru + 1;
    rows2[0].DanhGia = 1;
    const result1 = await userModel.patch(rows1[0]);
    const result2 = await productModel.patch(rows2[0]);

    let check = await transporter.sendMail({
        from: "webapponlineauction@gmail.com",
        to: rows1[0].Email,
        subject: "Thông báo Đánh giá✔", // Subject line
        text: "Dislike", // plain text body
        html: "Bạn bị <b>Dislike</b> tại giao dịch sản phẩm " + rows2[0].TenSanPham // html body
    });
    res.redirect('/seller/productAuctioned');
})

router.get('/request', async (req, res) => {
    const seller = res.locals.authUser;
    let rows = await allowModel.allBySeller(seller.IdNguoiDung);
    for (let c of rows) {
        let temp1 = await userModel.single(c.IdNguoiMua);
        let temp2 = await productModel.single(c.IdSanPham);
        c.Bidder = temp1[0];
        c.SanPham = temp2[0];
    }
    console.log(rows);
    res.render('vwSeller/request', {
        empty: rows.length === 0,
        listReq: rows
    });
})

router.post('/disagree/bidder=:id1/product=:id2', async (req, res) => {
    const idBidder = req.params.id1;
    const idProduct = req.params.id2;
    const idSeller = res.locals.authUser.IdNguoiDung;

    const bidder = await userModel.single(idBidder);
    const sanPham = await productModel.single(idProduct);
    let rows = await allowModel.single(idSeller, idProduct, idBidder);
    rows[0].Quyen = 0;
    let result = await allowModel.patch(rows[0]);


    let check = await transporter.sendMail({
        from: "webapponlineauction@gmail.com",
        to: bidder[0].Email,
        subject: "Thông báo", // Subject line
        text: "Bị cấm", // plain text body
        html: "Bạn bị <b>cấm</b> ra giá tại giao dịch sản phẩm <b>" + sanPham[0].TenSanPham + "</b>."// html body
    });
    res.redirect('/seller/request');
})

router.post('/agree/bidder=:id1/product=:id2', async (req, res) => {
    const idBidder = req.params.id1;
    const idProduct = req.params.id2;
    const idSeller = res.locals.authUser.IdNguoiDung;

    const bidder = await userModel.single(idBidder);
    const sanPham = await productModel.single(idProduct);
    let rows = await allowModel.single(idSeller, idProduct, idBidder);
    rows[0].Quyen = 1;
    let result = await allowModel.patch(rows[0]);


    let check = await transporter.sendMail({
        from: "webapponlineauction@gmail.com",
        to: bidder[0].Email,
        subject: "Thông báo", // Subject line
        text: "Cấp phép", // plain text body
        html: "Bạn được <b>cho phép</b> ra giá tại giao dịch sản phẩm <b>" + sanPham[0].TenSanPham + "</b>."// html body
    });
    res.redirect('/seller/request');
})

router.post('/block/bidder=:id1/product=:id2', async (req, res) => {
    const idBidder = req.params.id1;
    const idProduct = req.params.id2;
    const idSeller = res.locals.authUser.IdNguoiDung;

    const del = await auctionModel.delByBidder(idBidder, idProduct);
    const bidder = await userModel.single(idBidder);
    const sanPham = await productModel.single(idProduct);
    let rows = await allowModel.single(idSeller, idProduct, idBidder);
    if (rows.length === 0) {
        let entity = {
            IdNguoiMua: idBidder,
            IdSanPham: idProduct,
            Quyen: 0,
            IdNguoiBan: idSeller,
        };
        let result = await allowModel.add(entity);
    }
    else {
        rows[0].Quyen = 0;
        let result = await allowModel.patch(rows[0]);
    }

    const maxaution = await auctionModel.maxaution(idProduct);
    if (maxaution[0] != null) {
        const l = await productModel.patch(maxaution[0]);
    }
    else {
        let thisProduct = await productModel.single(idProduct);
        thisProduct[0].GiaHienTai = thisProduct[0].GiaKhoiDiem;
        thisProduct[0].IdNguoiThang = 0;
        await productModel.patch(thisProduct[0]);
    }

    let check = await transporter.sendMail({
        from: "webapponlineauction@gmail.com",
        to: bidder[0].Email,
        subject: "Thông báo", // Subject line
        text: "Bị cấm", // plain text body
        html: "Bạn bị <b>cấm</b> ra giá tại giao dịch sản phẩm <b>" + sanPham[0].TenSanPham + "</b>."// html body
    });
    res.redirect('/products/' + idProduct);
})
module.exports = router;