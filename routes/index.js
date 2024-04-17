var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res) {
  res.render('login', {error: req.flash("error")});
});

router.get('/feed', function(req, res) {
  res.render('feed');
});

router.post('/upload',isLoggedIn, upload.single("file"), async function(req, res) {
  if(!req.file){
   return res.status(404).send("No file were given ")
  }

  // jo file upload hue hai use save kro as a post and uska postid user ko do and post ko userid do.

  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});


router.get('/profile', async function(req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  })
  .populate("posts")
  console.log(user)

  res.render('profile', {user});
});

router.get('/profile', isLoggedIn, function(req, res) {
  res.send("Welcome To Profile Page");
});

router.post("/register", (req, res)=>{
  const {username, email, fullname} = req.body;
  const userData = new userModel({username,email,fullname});

  userModel.register(userData, req.body.password)
  .then(()=>{
    passport.authenticate("local")(req, res, ()=>{
      res.redirect("/profile")
    })
  })

})

router.post("/login",passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    // This function will not be called because the authentication is handled by Passport
  }
);

router.get("/logout", (req, res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}








module.exports = router;
