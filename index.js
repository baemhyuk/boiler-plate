const express = require("express"); //express모듈을 요청한다
const app = express(); //express 함수 생성
const port = 3000; //포트 3000번 생성
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const config = require("./config/key");

//application/x-www.form-urlencoded 의 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 의 데이터를 분석해서 가져옴
app.use(bodyParser.json());

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
  res.send("Hello World! 안녕방구야 ㅋㅋㅋ");
}); // '/'루트 디렉터리에 접근하면 hello world가 나오도록 한다

app.post("/register", (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
