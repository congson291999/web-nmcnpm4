const db = require('../utils/db');


module.exports = {
  all: () => db.load('select * from danhmuc'),
  single: id => db.load(`select * from danhmuc where IdDanhMuc = ${id}`),
  add: entity => db.add('danhmuc', entity),
  del: id => db.del('danhmuc', { IdDanhMuc: id }),
  patch: entity => {
    const condition = { IdDanhMuc: entity.IdDanhMuc };
    delete entity.IdDanhMuc;
    return db.patch('danhmuc', entity, condition);
  },

  allOfId: id => db.load(`select * from danhmuc where ThuocDanhMuc = ${id}`),

  allProductsOfId: id => db.load(`select * from sanpham where LoaiSanPham = ${id}`),
  
    // allWithDetails: _ => {
  //   const sql = `
  //     select c.CatID, c.CatName, count(p.ProID) as num_of_products
  //     from categories c left join products p on c.CatID = p.CatID
  //     group by c.CatID, c.CatName`;
  //   return db.load(sql);
  // },
};
