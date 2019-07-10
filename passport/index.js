const { queryUser } = require("../database/index");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

const secretOrPrivateKey = require("../config/index").secretOrPrivateKey;

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrPrivateKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async function(jwt_payload, done) {
      await queryUser(jwt_payload.username).then(
        items => {
          if (items.length) {
            done(null, items[0]);
          } else {
            done(null, false);
          }
        },
        err => {
          done(err, false);
        }
      );
    })
  );
};
