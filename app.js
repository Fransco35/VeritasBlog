require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir('./uploads/',(err)=> {
      cb(null, './uploads/');
   });
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req,file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


const upload = multer({ 
  storage: storage,
  limits : {fileSize : 7000000},
  fileFilter: fileFilter
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.static('public'));
app.use('/static', express.static('./static/'));
// app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true,  useUnifiedTopology: true}); 

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const postSchema = new mongoose.Schema ({
  image: { data: Buffer, contentType: String },
  title: String,
  content: String,
  date: String
});



const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "/auth/google/blog",
  proxy: true,
  userProfileURL:'https://www.googleapis.com/oauth2/v3/userinfo'
},
function(accessToken, refreshToken, profile, cb) {
   
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/blog",
  proxy:true
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));



app.get('/', (req, res) => {

  var perPage = 8
  var page = req.params.page || 1 

  Post.find({})
      .sort({_id: -1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec((err, posts) => {
        Post.count().exec((err, count) => {
          if(err){
                console.log(err)
              }
              else {
                res.render("home", {
                  posts: posts,
                  current: page,
                  pages: Math.ceil(count / perPage)
                  });
              }
              
        })
      })
});

app.get('/search', (req, res) => {

  var perPage = 8
  var page = req.params.page || 1 

  try {
    Post.find({$or: [{title:{'$regex': req.query.search}}, {content: {'$regex': req.query.search}}]})
    .sort({_id: -1})
    .skip((perPage * page) - perPage)
    .limit(req.query.limit)
    .exec((err, post) => {
      Post.count().exec((err, count)=> {
        if(err) {
          console.log(err)
        } else {
          res.render("result", {
            posts: post,
            current: page,
             pages: Math.ceil(count / perPage)
          })
        }
       })
      })
} catch (err) {
  console.log(err)
}

});


app.get('/auth/google',
passport.authenticate('google', {scope: ['profile']})
);

app.get('/auth/google/blog',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect blog.
    res.redirect('/compose');
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook',{scope: ['public_profile']})
  );

  app.get('/auth/facebook/blog',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect blog.
    res.redirect('/compose');
  });


app.get('/signup', function(req, res){
  res.render('signup');
});


app.get('/login', function(req, res){
  res.render('login');
});

app.get('/compose', function(req, res){
  if(req.isAuthenticated()){
    res.render('compose');
  } else {
    res.redirect('signup');
  }
  
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post('/signup', (req, res) => {
  User.register({username:req.body.username}, req.body.password, (err, user)=> {
    if(err){
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    }
  })
})

app.get('/:page', (req, res) => {

  var perPage = 8
  var page = req.params.page || 1 

  Post.find({})
      .sort({_id: -1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec((err, posts) => {
        Post.count().exec((err, count) => {
          if(err){
                console.log(err)
              }
              else {
                res.render("home", {
                  posts: posts,
                  current: page,
                  pages: Math.ceil(count / perPage)
                  });
              }
              
        })
      })
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
   
  req.login(user, function(err){
    if(err) {
      console.log(err)
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    }
  });
});

app.post('/compose', upload.single("postImage"), function(req, res, next){

  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; //months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  
   const newdate = `${day}/${month}/${year}`;

  const image = fs.readFileSync(req.file.path);
  const encode_image = image.toString('base64');
  const final_img = {
    data:new Buffer.from(encode_image,'base64'),
    contentType:req.file.mimetype
};
 const post = {
   image: final_img,
   title: req.body.postTitle,
   content: req.body.postBody,
   date: newdate
 }


Post.create(post, (err, item)=> {
  if(err){
    console.log(err);
  }else{
    item.save();
    res.redirect('/');
  }
})

});



app.get('/posts/:postId', (req, res) => {
  var ObjectId = require('mongodb').ObjectId;
  const requestedPostId = req.params.postId;
   Post.findOne({_id: ObjectId(requestedPostId)}, (err, post) => {
     if (err){
       console.log(err);
     } else{
       const postImg = post.image.data.toString('base64')
       const image = {
         data:new Buffer.from(postImg, 'base64'),
         contentType: post.image.contentType
       }
     res.render("post", {
      image: image, 
      title: post.title,
      content: post.content,
      date: post.date
    });
     }

  });

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Sucessfully started server");
});





