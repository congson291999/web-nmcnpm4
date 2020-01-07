const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from nguoidung'),
  buyer: () => db.load('select * from nguoidung where LoaiNguoiDung=1'),
  seller: () => db.load('select * from nguoidung where LoaiNguoiDung=2'),
  single: id => db.load(`select * from nguoidung where IdNguoiDung = ${id}`),
  add: entity => db.add('nguoidung', entity),
  del: id => db.del('nguoidung', { IdNguoiDung: id }),
  singleByUsername: async username=>{
    const rows= await db.load(`select * from nguoidung where TenDangNhap= '${username}'`);
    if(rows.length===0)return null;
    return rows[0];
  },
  allByEmail: Email => db.load(`select * from nguoidung where Email= '${Email}'`),
  allByUsername: username => db.load(`select * from nguoidung where TenDangNhap= '${username}'`),
  singleByEmail: async Email=>{
    const rows= await db.load(`select * from nguoidung where Email= '${Email}'`);
    if(rows.length===0)return null;
    return rows[0];
  },
  patch: entity => {
    const condition = { IdNguoiDung: entity.IdNguoiDung };
    delete entity.IdNguoiDung;
    return db.patch('nguoidung', entity, condition);
  },

  allOfId: id => db.load(`select * from nguoidung where ThuocDanhMuc = ${id}`) 
  
};