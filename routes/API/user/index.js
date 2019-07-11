const { insertUser, queryUser } = require("../../../database/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");
const Router = require("koa-router");
const router = new Router();

const secretOrPrivateKey = require("../../../config/index").secretOrPrivateKey;

router.post("/login", async ctx => {
  console.log("Someone here!")
  let { username, password } = ctx.request.body;
  await queryUser(username).then(
    items => {
      if (!items.length) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          msg: "No such a person!"
        };
      } else {
        //验证密码
        console.log("Checking password!")

        if (bcrypt.compareSync(password, items[0].password)) {
          console.log("Yes!")

          //OK
          //返回Token
          let token = jwt.sign(
            {
              username
            },
            secretOrPrivateKey,
            { expiresIn: "1d" }
          );
          ctx.status = 200;
          ctx.body = {
            success: true,
            token: "Bearer " + token
          };
        } else {
          ctx.status = 400;
          ctx.body = {
            success: false,
            msg: "Password wrong!"
          };
        }
      }
    },
    err => {
      console.log(err);
      ctx.status = 500;
      ctx.body = {
        msg: "Server wrong!"
      };
    }
  );
});

router.post("/regist", async ctx => {
  let user = ctx.request.body;
  await queryUser(user.username).then(
    items => {
      if (!items.length) {
        //加密密码
        let salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
        insertUser(user);
      } else {
        console.log("Already has!");
      }
    },
    err => {
      console.log(err);
    }
  );
  ctx.status = 200;
  ctx.body = "Ok";
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async ctx => {
    ctx.status = 200;
    ctx.body = ctx.state.user;
  }
);

router.get(
  "/token",
  passport.authenticate("jwt", { session: false }),
  async ctx => {
    if (ctx.state.user) {
      ctx.status = 200;
      ctx.body = { success: true };
    } else {
      (ctx.status = 400),
        (ctx.body = {
          success: false
        });
    }
  }
);

module.exports = router.routes();
