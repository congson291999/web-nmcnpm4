const db = require('../utils/db');


module.exports = {
  all: () => db.load('select * from quyendaugia'),
  singleById: id => db.load(`select * from quyendaugia where Id = ${id}`),
  single: (idSeller, isProduct, idBidder) => db.load(`select * from quyendaugia where IdNguoiBan = ${idSeller} AND IdSanPham = ${isProduct} AND IdNguoiMua = ${idBidder}`),
  add: entity => db.add('quyendaugia', entity),
  allBySeller: id => db.load(`select * from quyendaugia where IdNguoiBan = ${id} and Quyen = 2`),
  del: id => db.del('quyendaugia', { Id: id }),
  patch: entity => {
    const condition = { Id: entity.Id };
    delete entity.Id;
    return db.patch('quyendaugia', entity, condition);
  },

};
