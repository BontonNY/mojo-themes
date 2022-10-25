 
// import wm from 'brandlabs-bigcommerce-wishlist';  

export default class CustomWishlist { 
    
    init(){
        alert('WSH');
        /*$(document).on('click', '.btn-wishlist', function(){
      
            let  wishlist = $(this).attr('data-wishlist-id');
            let  productId = $(this).attr('data-product-id'); 
      
            //this.addProductToWishlist(wishlist, productId);
      
            if($(this).attr('data-wishlist-action')=='add'){
              $(this).find('i').removeClass('fal fa-heart').addClass('fas fa-circle-notch fa-spin');  
              wm.addWishlistItem(wishlist, productId).then(item => {
                $(this).attr('data-wishlist-itemid',item.id);
                $(this).find('i').removeClass('fas fa-circle-notch fa-spin').addClass('fas fa-heart');
                $(this).attr('data-wishlist-action','delete');
              }).catch(error => {
                console.log(`Something went wrong when trying to add item from wishlist.`);
              });
      
            }
      
            if($(this).attr('data-wishlist-action')=='delete'){
              let  itemId = $(this).attr('data-wishlist-itemid'); 
              $(this).find('i').removeClass('fas fa-heart').addClass('fas fa-circle-notch fa-spin');  
      
              wm.deleteWishlistItem(wishlist, itemId).then(() => {
                $(this).find('i').removeClass('fas fa-circle-notch fa-spin').addClass('fal fa-heart');
                $(this).attr('data-wishlist-action','add');
              }).catch(error => {
                console.log(`Something went wrong when trying to remove item from wishlist.`);
              });
      
            }
        });*/
    }

    loadProductFromWishlist(){
        // console.log(loadProductFromWishlist);
        // wm.getWishlist(this.context.currentWishlistId).then(({ name, items, is_public, share_url }) => {
        //   items.forEach(element => {
        //     $('.btn-wishlist[data-product-id='+element.product_id+'] i ').removeClass('fal fa-heart').addClass('fas fa-heart');
        //     $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-action','delete');
        //     $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-itemid',element.id);
        //   });
        // });
      }
}
