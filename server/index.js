const express = require("express"); //express모듈을 요청한다
const app = express(); //express 함수 생성
const port = 5000; //포트 5000번 생성
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");
const config = require("./config/key");
const cookieParser = require("cookie-parser");

//application/x-www.form-urlencoded 의 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 의 데이터를 분석해서 가져옴
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  //GET 방식
  res.send("Hello World! 안녕방구야 ㅋㅋㅋ");
}); // '/'루트 디렉터리에 접근하면 hello world가 나오도록 한다

app.get("/api/hello", (req, res) => {
  res.send("테스트 입니다.");
});

app.post("/api/users/register", (req, res) => {
  //POST 방식
  //회원 가입 할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body); //req.body 안에 id나 패스워드가 있다.

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    }); //status는 성공했다는 의미
  });
});

app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        massage: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      //비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에 ?  쿠키 or 로컬스토리지
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// role 1 어드민    role 2 특정 부서 어드민
// role 0 -> 일반유저   role 0이 아니면  관리자
app.get("/api/users/auth", auth, (req, res) => {
  //여기 까지 미들웨어를 통과해 왔다는 얘기는  Authentication 이 True 라는 말.
  res.status(200).json({
    //유저 정보들을 제공
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
