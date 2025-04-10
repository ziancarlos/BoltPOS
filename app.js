require("dotenv").config();

const express = require("express");
const AuthRouter = require("./routers/AuthRouter");
const session = require("express-session");
const AppRouter = require("./routers/AppRouter");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.get("/", (req, res) => {
  res.render("index");
});
app.use(AuthRouter);
app.use(AppRouter);

app.get("/500", (req, res) => {
  const { username, role, userId } = req.user;
  const currentPath = req.path;

  res.render("500", {
    user: {
      userId,
      username,
      role,
    },
    currentPath,
  });
});
app.get("/404", (req, res) => {
  const { username, role, userId } = req.user;
  const currentPath = req.path;

  res.render("404", {
    user: {
      userId,
      username,
      role,
    },
    currentPath,
  });
});

app.use((req, res) => {
  res.status(404).redirect("/404");
});

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
