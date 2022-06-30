var express = require('express');
const async = require('hbs/lib/async');
const { resolve } = require('promise');
const { response } = require('../app');
var db = require('../config/connection')
var router = express.Router();
var adminHelpers = require('../helpers/admin-helpers')
var productHelpers = require('../helpers/product-helpers')


router.get('/', function (req, res, next) {

  res.render('admin/login',{loginErr:req.session.loginErr});

});

router.post('/', async function (req, res, next) {


  await adminHelpers.loginCheck(req.body).then((response) => {
    if (response.status) {
      //req.session.admin.loggedIn = true
      req.session.admin = response.admin
      res.redirect('admin/view-products')

    } else {
      req.session.loginErr = "Invalid Email or Password"
      res.redirect('/admin')
    }
  })

});

router.get('/view-products', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {

    res.render('admin/view-products', { products, admin: true });
  })
});

router.get('/add-products', function (req, res, next) {

  res.render('admin/add-products', { admin: true });
});

router.post('/add-products', function (req, res, next) {

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/images/productImages/' + id + '.jpg', (err) => {
      if (err) {
        console.log(err)
      }
      else {
        res.render('admin/add-products', { admin: true })
      }
    })

  })
});

router.get('/edit-product/:id', function (req, res, next) {
  prodId = req.params.id
  productHelpers.getProductDetails(prodId).then((product) => {
    res.render('admin/edit-product', { product, admin: true });
  })

});

router.post('/edit-product/:id', (req, res, next) => {
  prodId = req.params.id
  productHelpers.updateProduct(prodId, req.body).then((response) => {
    res.redirect('/admin/view-products')
    if(req.files){
    let image = req.files.image
    image.mv('./public/images/productImages/' + prodId + '.jpg')
  }
    
  })
});

router.get('/delete-product/:id', function (req, res, next) {
  prodId = req.params.id

  productHelpers.deleteProduct(prodId).then((response) => {
    res.redirect('/admin/view-products')
  })

});

router.get('/user-details',(req,res)=>{
   adminHelpers.getAllUsers().then((users)=>{
     res.render('admin/user-details',{users, admin:true})
   })
})

router.get('/order-details',(req,res)=>{
  adminHelpers.getAllOrders().then((orders)=>{
    res.render('admin/order-details',{orders, admin:true})
  })
})

router.get('/ship-order/:id',async(req,res)=>{
  await adminHelpers.shipOrder(req.params.id).then(()=>{
     res.json({status:true})
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
})

module.exports = router;
