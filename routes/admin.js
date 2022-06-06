var express = require('express');

var router = express.Router();
var productHelpers= require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{

    res.render('admin/view-products',{products, admin:true});

  })

});

router.get('/add-products', function(req, res, next) {

  res.render('admin/add-products',{ admin:true});
});

router.post('/add-products',function(req, res, next){
  
    productHelpers.addProduct(req.body,(id)=>{
      let image=req.files.image
      image.mv('./public/images/productImages/'+id+'.jpg',(err)=>{
        if(err){
          console.log(err)
        }
        else{
          res.render('admin/add-products',{admin:true})
        }
      })
      
    })
});

router.get('/edit-product/:id', function(req, res, next) {
  prodId=req.params.id
  productHelpers.getProductDetails(prodId).then((product)=>{
    res.render('admin/edit-product',{ product,admin:true});
  })
  
});

router.post('/edit-product/:id',(req,res, next)=>{
  prodId=req.params.id
  productHelpers.updateProduct(prodId,req.body).then((response)=>{
    res.redirect('/admin/')
    let image=req.files.image
      image.mv('./public/images/productImages/'+prodId+'.jpg')
  })
});

router.get('/delete-product/:id', function(req, res, next) {
  prodId=req.params.id
  
  productHelpers.deleteProduct(prodId).then((response)=>{
    res.redirect('/admin/')
  })
  
});

module.exports = router;
