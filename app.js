const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");
const { serverPort } = require("./config/index");

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());

require("./passport/index")(passport);

const user = require("./routes/API/user/index");
router.use("/API/user", user);

app.use(router.routes()).use(router.allowedMethods());

app.listen(serverPort, () => {
  console.log(`Server is running at ${serverPort} port!`);
});
