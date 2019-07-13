var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();

var DB = DB || {};

DB.SqliteDB = function(file) {
  DB.db = new sqlite3.Database(file);

  DB.exist = fs.existsSync(file);
  if (!DB.exist) {
    console.log("Creating db file!");
    fs.openSync(file, "w");
  }
};

DB.printErrorInfo = function(err) {
  console.log("Error Message:", err);
};

DB.SqliteDB.prototype.createTable = function(sql) {
  DB.db.serialize(function() {
    DB.db.run(sql, function(err) {
      if (null != err) {
        DB.printErrorInfo(err);
        return;
      }
    });
  });
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function(sql, objects) {
  DB.db.serialize(function() {
    var stmt = DB.db.prepare(sql);
    for (var i = 0; i < objects.length; ++i) {
      stmt.run(objects[i]);
    }

    stmt.finalize();
  });
};

DB.SqliteDB.prototype.queryData = function(sql, callback) {
  DB.db.all(sql, function(err, rows) {
    if (null != err) {
      DB.printErrorInfo(err);
      return;
    }

    /// deal query data.
    if (callback) {
      callback(rows);
    }
  });
};

DB.SqliteDB.prototype.executeSql = function(sql, objects) {
  DB.db.serialize(function() {
    var stmt = DB.db.prepare(sql);
    objects.forEach(object => {
      stmt.run(object, err => {
        if (err) console.log(err);
      });
    });
    stmt.finalize();
  });
};

DB.SqliteDB.prototype.close = function() {
  DB.db.close();
};

exports.SqliteDB = DB.SqliteDB;
