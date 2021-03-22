const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 중간에 빈공간을 없애주는 역할
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    //유효성 관리
    type: String,
  },
  tokenExp: {
    //토큰 유효기간
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  let user = this;

  if (user.isModified("password")) {
    //비밀번호를 변경할때만 암호화한다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      //genSalt : Salt를 생성, saltRounds : 몇자리 암호화인지를 나타내는것.
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        //hash : 얌호화된 비밀번호
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
  //비밀번호를 암호화 시킨다.
  //save라는 메소드를 실행하기 전에 실행하는 함수.
  //pre()는 몽고디비에 있는 메소드이다.
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 1234567    암호회된 비밀번호 $2b$10$l492vQ0M4s9YUBfwYkkaZOgWHExahjWC
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  //jsonwebtoken 이용해서 token을 생성하기
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  //데이터베이스의 _id 컬럼명이다.
  //user._id + secretToken = token의 의미이다.
  //secretToken을 넣으면 user_.id가 나오는 구조. token을 가지고 어떤 유저인지 확인.
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  // user._id + ''  = token
  //토큰을 decode 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
