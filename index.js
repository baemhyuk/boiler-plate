const express = require("express"); //express모듈을 요청한다
const app = express(); //express 함수 생성
const port = 3000; //포트 3000번 생성
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://baemhyuk:bmh2551742@baemhyuk.m08il.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
}); // '/'루트 디렉터리에 접근하면 hello world가 나오도록 한다

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
