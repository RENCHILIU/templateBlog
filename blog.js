// library
var bodyparse = require('body-parser'),
methodOverride = require('method-override'),
expressSanitizer = require('express-sanitizer'),
mongoose      = require('mongoose'),
express       = require('express'),
app           = express();




// configure
mongoose.connect("mongodb://localhost/blog");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('views'));
app.use(bodyparse.urlencoded({external:true}));
app.use(expressSanitizer()); // this line follows bodyParser() instantiations
app.use(methodOverride("_method"));





// mongoose

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body : String,
    created:{type : Date, default : Date.now()}
});

var Blog = mongoose.model('Blog',blogSchema);


// var newblog = {title:"sea",image:"https://images.unsplash.com/photo-1500417148159-68083bd7333a?auto=format&fit=crop&w=1650&q=80",
//                 body:"this is body"};
//
// Blog.create(newblog,function (error) {
//     if(error){
//         console.log(error);
//     }
// });


//------------------
// index route
//------------------
app.get('/blogs',function (req, res) {
    //look in the database
    Blog.find({},function (err,blogs) {
        if(err){
            console.log(err);
        }else{
            res.render("index",{blogs:blogs});
        }
    })
});

//------------------
// new route
//------------------

app.get('/blogs/newBlog',function (req, res) {
    res.render("newBlog");
});

app.post('/blogs',function (req, res) {

    // expressSanitizer
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function (err, newBlog) {
        if(err){
            console.log(err);
            res.render("newBlog");
        }else{
            res.redirect("/blogs");
            console.log(newBlog);
        }
    })
});

//------------------
// show route
//------------------

app.get("/blogs/:id",function (req, res) {
    Blog.findById(req.params.id,function (err, thisBlog) {
        if(err){
            console.log(err);
            res.redirect("blogs");
        }else{
            res.render("showBlog",{thisBlog:thisBlog});
        }
    })
});

//------------------
// edit route
//------------------
app.get("/blogs/:id/edit",function (req, res) {
    //req.params.id from the '/blogs/:id/edit'


    Blog.findById(req.params.id,function (err, foundedBlog) {
        if(err){
            console.log(err);
            res.redirect("blogs")
        }else{
            res.render("editBlog",{thisBlog:foundedBlog});
        }
    })

});

//------------------
// update route
//------------------
app.put("/blogs/:id",function (req, res) {
    //req.params.id from the '/blogs/:id/edit'
    // req.body.blog from 'req body'
    //sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function (err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            console.log(req);
            res.redirect("/blogs/"+req.params.id);
        }
    })
});




//------------------
// delete route
//------------------
app.delete("/blogs/:id",function (req,res){
    Blog.findByIdAndRemove(req.params.id,function (err) {
        if(err){
            console.log(err);

        }
        res.redirect("/blogs");
    })
});




app.listen(3000,function () {
    console.log('Server is running on port 3000')
});