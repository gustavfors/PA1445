const express = require("express");
const cors = require("cors");

const app = express();
const port = 8000;

app.use(cors());

app.get("/token", (_, res) => {
  res.status(201).json({token: "token"});
});

app.get("/test", (req, res) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.split(" ")[1] === "token") {
    return res.status(200).json({message: "success"});
  }
  return res.status(500).json({message: "something went wrong"});
});

app.listen(port, () => console.log(`app is running on port ${port}`));
