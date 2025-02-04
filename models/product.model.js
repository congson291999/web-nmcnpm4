const db = require('../utils/db');
const config = require('../config/default.json');

module.exports = {
  all: () => db.load('select * from sanpham where TinhTrang=0'),
  allInIdArray: (array, offset) => db.load(`select * from sanpham where IdSanPham in (${array.join(',')})  and TinhTrang=0 limit ${config.paginate.limit} OFFSET ${offset}`),
  allByCat: catId => db.load(`  SELECT * FROM sanpham WHERE LoaiSanPham = ${catId}
  UNION
  SELECT * FROM sanpham WHERE LoaiSanPham in (SELECT IdDanhMuc FROM danhmuc WHERE ThuocDanhMuc = ${catId})  and TinhTrang=0`),
  countByCat: async catId => {
    const rows = await db.load(`SELECT count(*) as total FROM (SELECT * FROM sanpham WHERE LoaiSanPham = ${catId}   and TinhTrang=0
                                UNION
                                SELECT * FROM sanpham WHERE LoaiSanPham in (SELECT IdDanhMuc FROM danhmuc WHERE ThuocDanhMuc = ${catId}) and TinhTrang=0) c`)
    return rows[0].total;
  },
  allAvailableBySeller: sellerId => db.load(`  SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} and TinhTrang=0`),
  countAvailableBySeller: async sellerId => {
    const rows = await db.load(`SELECT count(*) as total FROM ( SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} and TinhTrang=0) c`)
    return rows[0].total;
  },
  pageAvailableBySeller: (sellerId, offset) => db.load(`SELECT * FROM (SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} and TinhTrang=0
    ) c limit ${config.paginate.limit} OFFSET ${offset}`),

  allAuctionedBySeller: sellerId => db.load(`  SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} AND (NgayHetHan < SYSDATE() or  TinhTrang=1)`),
  countAuctionedBySeller: async sellerId => {
    const rows = await db.load(`SELECT count(*) as total FROM ( SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} AND (NgayHetHan < SYSDATE() or  TinhTrang=1) ) c`)
    return rows[0].total;
  },
  pageAuctionedByBidder: (bidderId, offset) => db.load(`SELECT * FROM (SELECT * FROM sanpham WHERE IdNguoiThang = ${bidderId} AND (NgayHetHan < SYSDATE() or TinhTrang=1)
      ) c limit ${config.paginate.limit} OFFSET ${offset}`),
  countAuctionedByBidder: async bidderId => {
        const rows = await db.load(`SELECT count(*) as total FROM ( SELECT * FROM sanpham WHERE IdNguoiThang = ${bidderId} AND (NgayHetHan < SYSDATE() or TinhTrang=1)) c`)
        return rows[0].total;
      },
  pageAuctionedBySeller: (sellerId, offset) => db.load(`SELECT * FROM (SELECT * FROM sanpham WHERE IdNguoiBan = ${sellerId} AND (NgayHetHan < SYSDATE() or  TinhTrang=1)
          ) c limit ${config.paginate.limit} OFFSET ${offset}`),
  pageByCat: (catId, offset) => db.load(`SELECT * FROM (SELECT * FROM sanpham WHERE LoaiSanPham = ${catId} and TinhTrang=0
                                        UNION
                                        SELECT * FROM sanpham WHERE LoaiSanPham in (SELECT IdDanhMuc FROM danhmuc WHERE ThuocDanhMuc = ${catId}) and TinhTrang=0
                                        ) c limit ${config.paginate.limit} OFFSET ${offset}`),

  single: id => db.load(`select * from sanpham where IdSanPham = ${id} `),

  singleWithDatetime: datetime => db.load(`select * from sanpham where NgayDang = '${datetime}' and TinhTrang=0`),

  cartinf: (id) => db.load(`select a.IdSanPham,a.TenSanPham,a.NgayHetHan,a.GiaHienTai from sanpham a where a.IdSanPham = ${id}`),

  add: entity => db.add('sanpham', entity),
  del: id => db.del('sanpham', { IdSanPham: id }),
  patch: entity => {
    const condition = { IdSanPham: entity.IdSanPham };
    delete entity.IdSanPham;
    return db.patch('sanpham', entity, condition);
  },

  topNearExpiry: () => db.load(`SELECT * FROM sanpham WHERE TinhTrang=0  ORDER BY  NgayDang DESC limit ${config.gettop.limit}`),
  topMostBids: () => db.load(`SELECT * FROM sanpham WHERE NgayDang > SYSDATE() and TinhTrang=0 ORDER BY  SoLuotRaGia DESC limit ${config.gettop.limit}`),
  topHighBid: () => db.load(`SELECT * FROM sanpham WHERE TinhTrang=0 ORDER BY GiaKhoiDiem DESC limit ${config.gettop.limit}`),

  countProduct: async () => {
    const rows = await db.load(`select count(IdSanPham) as total from sanpham`)
    return rows[0].total;
  },
  countProduct2: async () => {
    const rows = await db.load(`select count(IdSanPham) as total from sanpham where TinhTrang = 1`)
    return rows[0].total;
  },
  // topNearExpiry: () => db.load(`SELECT * FROM sanpham WHERE NgayHetHan > SYSDATE() and TinhTrang=0  ORDER BY  datediff(CURRENT_DATE, NgayHetHan) DESC limit ${config.gettop.limit}`),
  // topMostBids: () => db.load(`SELECT * FROM sanpham WHERE NgayHetHan > SYSDATE() and TinhTrang=0 ORDER BY  SoLuotRaGia DESC limit ${config.gettop.limit}`),
  // topHighBid: () => db.load(`SELECT * FROM sanpham WHERE NgayHetHan > SYSDATE() and TinhTrang=0 ORDER BY GiaHienTai DESC limit ${config.gettop.limit}`),
  //lay comment theo id cuar san pham
  commentbyPro: (id) => db.load(`select * from binhluan b, nguoidung n where b.sanpham_id = ${id} and n.IDNguoiDung = b.nguoidung_id`),
  //them binh luan
  addComment: (entity) => db.add('binhluan',entity),
  delWishlist: (proId, userId) => db.load(`delete from  wishlist where IdSanPham = ${proId} and IdNguoiDung = ${userId}`),
  proByWishlist: async (proId, userId) =>{
    result=await db.load(`select count(*) as total from wishlist where IdSanPham = ${proId} and IdNguoiDung = ${userId}`);
    return result[0].total;
  },
  proBuy: async (proId, userId) =>{
    result=await db.load(`select count(*) as total from daugia where IdSanPham = ${proId} and IdNguoiDung = ${userId}`);
    return result[0].total;
  },
  proBuying: (userId) => db.load(`select * from daugia d, sanpham s where d.IdNguoiDung = ${userId} and d.IdSanPham = s.IdSanPham`),
};
