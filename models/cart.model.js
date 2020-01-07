db=require("../utils/db");
const config = require('../config/default.json');

module.exports={
    single:id=> db.load(`select * from wishlist where IdNguoiDung=${id} and NgayHetHan > SYSDATE() `),
    add: entity=> db.add("wishlist",entity),
    del:id=>db.load("wishlist",{IdSanPham:id}),
    cartinf: (id, id2) => db.load(`select a.IdSanPham,a.TenSanPham,a.NgayHetHan,b.IdNguoiDung,a.GiaHienTai from sanpham a,nguoidung b where a.IdSanPham = ${id} and b.IdNguoiDung=${id2}`),
    patch:entity=>{const condition = { IdSanPham: entity.IdSanPham };
    delete entity.IdSanPham;
    return db.patch('wishlist', entity, condition);},
    countWatchedByBidder: async bidderId => {
        const rows = await db.load(`SELECT count(*) as total FROM ( SELECT distinct a.IdSanPham,a.TenSanPham,a.NgayHetHan,a.GiaHienTai FROM wishlist a, sanpham b WHERE a.IdNguoiDung = ${bidderId} and a.NgayHetHan > SYSDATE() and a.IdSanPham=b.IdSanPham and b.TinhTrang=0 )c`)
        return rows[0].total;
      },
    pageWatchedByBidder: (bidderId, offset) => db.load(`SELECT * FROM (SELECT  distinct a.IdSanPham,a.TenSanPham,a.NgayHetHan,a.GiaHienTai FROM wishlist a,sanpham b WHERE a.IdNguoiDung = ${bidderId} and a.NgayHetHan > SYSDATE() and a.IdSanPham=b.IdSanPham and b.TinhTrang=0) c limit ${config.paginate.limit} OFFSET ${offset}`),
}