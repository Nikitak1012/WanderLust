if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();


const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError  = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");

const session = require("express-session");
const{ MongoStore} = require("connect-mongo");


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");





app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connection to DB");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

  
}

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24 *3600, //this is in seconds
});
store.on("error",(err)=>{
    console.log("ERROR in Mongo Session Store!", err)
})

//adding session
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    }
};



// root route - redirect to listings (home page)
app.get("/",(req,res)=>{
    res.redirect("/listings");
});

// flash a message 
app.use(session(sessionOptions));
app.use(flash());

// adding security for user  using passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middlewares to show flash message
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
});






//using express router to get  listing routes

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/", userRouter);


//if koi bhi route nhi h upar wale defined routes me se toh hum error show krwayenge 
app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

//Error handling 
app.use((err,req, res, next)=>{

    let {statusCode = 505, message ="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080 , ()=>{
    console.log("Server is listening on port 8080");
});
