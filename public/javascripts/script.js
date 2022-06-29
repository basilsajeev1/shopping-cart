


function addItemToCart(prodId){
    
    $.ajax({
        url: '/add-to-cart/'+ prodId ,
        method: 'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cartCount').html()
                count=parseInt(count)+1
                $('#cartCount').html(count)
            }
        }
    })
}

function changeQuantity(cartId,productId,userId,count){
        
    $.ajax({
              
        url: '/change-product-quantity/',
        data:{
            cart: cartId,
            product: productId,
            user: userId,
            count: count
        },
        method: 'post',
        success:(response)=>{
            if(response.status){
                minusButtonId=productId+"1"
                count=parseInt(count)
                quantity=document.getElementById(productId).innerHTML
                quantity=parseInt(quantity)
                quantity=quantity+count
                document.getElementById(productId).innerHTML=quantity
                
                if(quantity<=1){
                    document.getElementById(minusButtonId).setAttribute("hidden", "hidden")
                    
                }else{
                    document.getElementById(minusButtonId).removeAttribute("hidden")
                }
                console.log(response.totalAmount)
                document.getElementById('totalAmountCart').innerHTML=response.totalAmount
            }
        }

        
    }) 

}

function deleteProduct(cartId,productId){
    $.ajax({
              
        url: '/delete-product/',
        data:{
            cart: cartId,
            product: productId,
            
        },
        method: 'post',
        success:(response)=>{
            if(response.status){
                alert("Deleted the Item")
                location.reload()
            }
        }
    })
}
