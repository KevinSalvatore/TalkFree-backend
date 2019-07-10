const path = require("path");
const SqliteDB = require("./api.js").SqliteDB;

var file = path.join(__dirname, "/data/TalkFree.db");

var TalkFreeDB = new SqliteDB(file);

// var createUserTableSql = `CREATE TABLE if not exists "main"."User" (
//   "username" TEXT NOT NULL,
//   "password" TEXT NOT NULL,
//   "avatar" TEXT,
//   "gender" integer,
//   PRIMARY KEY ("username")
// );`;

// TalkFreeDB.createTable(createUserTableSql);

function insertUser(user) {
  let insertUserSql = `INSERT INTO "main"."User"("username", "password", "avatar", "gender") VALUES (?, ?, ?, ?)`;
  TalkFreeDB.insertData(insertUserSql, [Object.values(user)]);
}

// insertUser({ username: "Kevin", password: "abc", avatar: null, gender: 1 });

function queryUser(username) {
  return new Promise((resolve, reject) => {
    let queryUserSql = `SELECT * FROM "User" WHERE "username" = "${username}"`;
    TalkFreeDB.queryData(queryUserSql, items => {
      if (items.length > 1) {
        reject("More than one users have the same username");
      }
      resolve(items);
    });
  });
}

// queryUser("Kevin").then(items => {
//   if (!items.length) {
//     console.log("Not found!");
//   } else {
//     console.log(items[0]);
//   }
// });

module.exports = {
  insertUser,
  queryUser
};
