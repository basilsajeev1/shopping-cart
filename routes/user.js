var express = require('express');
const { response } = require('../app');
var db=require('../config/connection')
var router = express.Router();
var productHelpers= require('../helpers/product-helpers');
const { loginCheck } = require('../helpers/user-helpers');
var userHelpers= require('../helpers/user-helpers')

/* GET home page. */
router.get('/', async function(req, res, next) {
  user=req.session.user
  let cartCount=null
  if(user){
    cartCount= await userHelpers.getCartCount(user._id)
    
  }
  productHelpers.getAllProducts().then((products)=>{

    res.render('user/index', { products,user, cartCount, admin:false });
  })
  
});

router.get('/login', function(req, res, next) {
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{loginErr:req.session.loginErr});
  req.session.loginErr=false
  }
    
});

router.post('/login',(req,res)=>{
  userHelpers.loginCheck(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
      
    }else{
      req.session.loginErr="Invalid Email or Password"
      res.redirect('/login')
    }
  })
})

router.get('/signup', function(req, res, next) {

  res.render('user/signup');
    
});

router.post('/signup',(req,res)=>{
  userHelpers.addUser(req.body).then(async(response)=>{
    
    user= await db.get().collection('users').findOne({_id:response.insertedId})
    req.session.loggedIn=true
    req.session.user=user
    res.redirect('/')
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/add-to-cart/:id',(req,res)=>{
  
    if(req.session.loggedIn){
      userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
        res.redirect('/')
      })

    }else{
      res.redirect('/login')
    }
  
  
})

router.get('/cart',async(req,res)=>{
  user=req.session.user
  
  cartItems= await userHelpers.getCartItems(req.session.user._id)
  
  res.render('user/cart',{user,cartItems})
  
  
})

module.exports = router;
