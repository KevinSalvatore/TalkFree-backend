const path = require("path");
const SqliteDB = require("./api.js").SqliteDB;

var userInfo = path.join(__dirname, "/data/TalkFree.db");

var TalkFreeDB = new SqliteDB(userInfo);

var createUserTableSql = `CREATE TABLE if not exists "main"."User" (
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "avatar" TEXT,
  "gender" integer,
  "region" TEXT,
  "slogan" TEXT,
  PRIMARY KEY ("username")
);`;

TalkFreeDB.createTable(createUserTableSql);

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

var createRelationshipTableSql = `CREATE TABLE if not exists "main"."Relationship" (
  "userA" TEXT NOT NULL,
  "userB" TEXT NOT NULL,
  "nickname" TEXT,
  "tag" TEXT,
  PRIMARY KEY ("userA", "userB")
);`;

TalkFreeDB.createTable(createRelationshipTableSql);

function becomeFriend(userA, userB) {
  let sql = `INSERT INTO "main"."Relationship"("userA", "userB") VALUES (?, ?)`;
  TalkFreeDB.insertData(sql, [[userA, userB], [userB, userA]]);
}

// becomeFriend("Kevin", "AJie");

//单向删除好友userA 删除 userB
function removeRelationship(userA, userB) {
  let sql = `DELETE FROM "main"."Relationship" WHERE "userA" = ? AND "userB" = ?`;
  TalkFreeDB.executeSql(sql, [[userA, userB]]);
}

// removeRelationship("Kevin", "AJie");

module.exports = {
  insertUser,
  queryUser,
  becomeFriend,
  removeRelationship
};
