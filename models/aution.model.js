db=require("../utils/db");
const config = require('../config/default.json');

module.exports={
    single:id=> db.load(`select * from daugia where IdSanPham=${id}`),
    add: entity=> db.add("daugia",entity),
    delByBidder: (idBidder, idSanPham) => db.load(`delete from daugia where IdNguoiDung = ${idBidder} and IdSanPham = ${idSanPham}`),
    delProduct: (id,nid) => db.load(`delete from daugia where IdSanPham=${id} and IdNguoiDung=${nid}`),
    maxaution:IdSanPham=>db.load(`SELECT a.IdSanPham, a.IdNguoiDung AS IdNguoiThang, a.Gia AS GiaHienTai, b.SoLuotRaGia FROM daugia a, sanpham b WHERE a.IdSanPham = b.IdSanPham AND a.IdSanPham = ${IdSanPham} AND a.Gia =( SELECT MAX(Gia) FROM daugia where IdSanPham = ${IdSanPham} )`),
    countAutionByBidder: async bidderId => {
        const rows = await db.load(`SELECT count(*) as total FROM (SELECT a.IdSanPham FROM daugia a,sanpham b where a.IdNguoiDung=${bidderId} and a.IdSanPham=b.IdSanPham and b.NgayHetHan>SYSDATE() and b.TinhTrang=0 group by a.IdSanPham )c`)
        return rows[0].total;
      },
    pageAutionByBidder: (bidderId, offset) => db.load(`SELECT * FROM (SELECT a.IdSanPham,b.TenSanPham,b.GiaHienTai,b.NgayHetHan, b.IdNguoiThang FROM daugia a, sanpham b where a.IdNguoiDung=${bidderId} and a.IdSanPham=b.IdSanPham and b.NgayHetHan>SYSDATE() and b.TinhTrang=0 group by a.IdSanPham
      ) c limit ${config.paginate.limit} OFFSET ${offset}`),
}