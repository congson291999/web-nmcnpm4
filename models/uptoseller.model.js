db=require("../utils/db");
const config = require('../config/default.json');

module.exports={
    all: () => db.load('select * from nangcap'),
    single:id=> db.load(`select * from nangcap where IdSanPham=${id}`),
    add: entity=> db.add("nangcap",entity),
    del: id => db.del('nangcap', { IdNguoiDung: id }),
}