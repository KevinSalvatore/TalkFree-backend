const { insertUser, queryUser } = require("../../../database/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");
const Router = require("koa-router");
const router = new Router();

const secretOrPrivateKey = require("../../../config/index").secretOrPrivateKey;

router.post("/login", async ctx => {
  let { username, password } = ctx.request.body;
  await queryUser(username).then(
    items => {
      if (!items.length) {
        ctx.status = 200;
        ctx.body = {
          success: false,
          msg: "No such a person!"
        };
      } else {
        //验证密码
        console.log("Checking password!");

        if (bcrypt.compareSync(password, items[0].password)) {
          console.log("Yes!");

          //OK
          //返回Token
          let token = jwt.sign(
            {
              username
            },
            secretOrPrivateKey,
            { expiresIn: "1d" }
          );

          //返回用户基本信息
          let userInfo = {
            username: items[0].username,
            avatar: items[0].avatar,
            gender: items[0].gender,
            region: items[0].region,
            slogan: items[0].slogan
          };

          ctx.status = 200;
          ctx.body = {
            success: true,
            token: "Bearer " + token,
            userInfo
          };
        } else {
          ctx.status = 200;
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
        success: false,
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
        let token = jwt.sign(
          {
            username: user.username
          },
          secretOrPrivateKey,
          { expiresIn: "1d" }
        );
        ctx.status = 200;
        ctx.body = {
          success: true,
          token: "Bearer " + token,
          userInfo: {
            username: user.username
          }
        };
      } else {
        ctx.status = 200;
        ctx.body = {
          success: false,
          msg: "The username has been used already!"
        };
      }
    },
    err => {
      console.log(err);
      ctx.status = 500;
      ctx.body = {
        success: false,
        msg: "Server wrong!"
      };
    }
  );
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

router.post(
  "/checkoutpwd",
  passport.authenticate("jwt", { session: false }),
  async ctx => {
    let { password } = ctx.request.body;
    if (bcrypt.compareSync(password, ctx.state.user.password)) {
      ctx.status = 200;
      ctx.body = {
        success: true
      };
    } else {
      ctx.status = 200;
      ctx.body = {
        success: false,
        msg: "Password wrong!"
      };
    }
  }
);

module.exports = router.routes();
