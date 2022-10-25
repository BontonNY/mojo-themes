import "owl.carousel"; 
import axios from "axios";

import wm from 'brandlabs-bigcommerce-wishlist';
import { defaultModal, ModalEvents } from './modal';
import { api } from '@bigcommerce/stencil-utils';


export default function () {

  $(function(){
      $(".better-brands").find(".tab-content:not(.active)").hide();


      var $t = setInterval(() => { 
          if($('.css-16ob9w1').length){
              clearInterval($t) 
              $('.css-16ob9w1').wrap('<div class="drop-shadow container"></div>');
          }
      }, 100);

      $(".better-brands-header").find("ul.nav  li a").on('click', function(event){
          event.preventDefault();
          
          
          if($('ul.nav').hasClass('mobile')){
              $('.mobile-dropdown a').html($(this).html())
              $('.nav.nav-pills.mobile').slideToggle();
              $('.mobile-dropdown').find('i').toggleClass('fa-angle-up').toggleClass('fa-angle-down');
          }
          $(".better-brands").find(".tab-content").hide();
          $('.nav .nav-link').removeClass('active');
          $(this).addClass('active')
          $($(this).attr('href')).addClass('active')
          $($(this).attr('href')).show();
      });

      // $('.css-f9eyjn').parent().addClass('deal-item');

      $('.mobile-dropdown').on('click', function(event){
          event.preventDefault();
          $(this).parent().find('.nav.nav-pills').slideToggle();  
          $(this).find('i').toggleClass('fa-angle-up').toggleClass('fa-angle-down')
      });

      
      $(".deals_of_the_day-carousel:not(.owl-loaded)").owlCarousel({
          dots: false,
          slideBy: 1,
          margin: 15,
          nav: true,
          navText : ["<i class='fal fa-long-arrow-left'></i>","<i class='fal fa-long-arrow-right'></i>"],
          responsive: {
              0: {
                  items:1,
                nav: false, 
              },
              500:{
                items:2,
                nav: true,
              },
              992: {
                items: 3,
                nav: true,
              },
              1200:{
                items: 4,
                margin: 30,
                nav: true,                  
              }
            }
      });
      
      $(".shop-our-category-carousel:not(.owl-loaded)").owlCarousel({
          dots: false,
          slideBy: 1,
          margin: 15,
          nav: false,
          items: 1,
          slideTransition: 'linear',
          responsive: {
              0: {

                nav: false,
                center: true,
              },
              500:{
                items:2,
              },
              992: {
                items: 3,
              },
              1200:{
                items: 5,
                margin: 30,
                
              }
            }
      });



      var y=window.matchMedia("screen and (min-width: 992px)");
      y.addListener(onLgUp);
      onLgUp(y);

      var y=window.matchMedia("screen and (max-width: 991px)");
      y.addListener(onLgDown);
      onLgDown(y);
      
      var y=window.matchMedia("screen and (min-width: 1200px)");
      y.addListener(onXlUp);
      onXlUp(y);

      var y=window.matchMedia("screen and (max-width: 1199px)");
      y.addListener(onXlDown);
      onXlDown(y);


      if($("#recently-viewed-section").length){
        
        axios({ url: `/account.php?action=recent_items`, headers: { Accept: "text/html", 'stencil-options': '{"render_with":"account/recent-items-carousel"}', } }).then((res) => {
          if (res.status === 200 && res.data && (res.data.indexOf('404 Error') === -1 || res.data.indexOf('Page not found') === -1)) {
            $("#recently-viewed-section").html(res.data);

            // console.log("$currentWishlistId home", $currentWishlistId)
            /*if(typeof $currentWishlistId  != 'undefined'){
              
              $("#recently-viewed-section").find('.btn-wishlist').attr('data-wishlist-id',$currentWishlistId )
            }*/

            loadAllWishlistItems()

            
            setTimeout(() => { 
              let $owl = $('#recently-viewed-section').owlCarousel({
                dots: false,
                slideBy: 1,
                margin: 30,
                stagePadding: 0,
                navText : ["<i class='fal fa-long-arrow-left'></i>","<i class='fal fa-long-arrow-right'></i>"],
                responsive: {
                0: {
                    items: 1,
                    nav: false,
                },
                500:{
                    items:2,
                    nav: false,
                },
                992: {
                    items: 3,
                    nav: true,
                },
                1200:{
                    items: 4,
                    nav: true,
                },
                1600:{
                    items: 5,
                    nav: true,
                }
                },
              }); 
            }, 100);

            
            $owl.trigger('refresh.owl.carousel');
            
  
          }
  
        }).catch(() => {})
      }


  });


  function onLgDown(media){
    if (media.matches) {       
      $('.better-brands-header').find('.nav.nav-pills').addClass('mobile').removeClass('desktop');
    }
  }

  function onLgUp(media){
    if (media.matches) { 
      $('.better-brands-header').find('.nav.nav-pills').removeClass('mobile').addClass('desktop')
      $('.better-brands-header').find('.nav.nav-pills').show();    
    }
  }

  function onXlDown(media){
    if (media.matches) {
      $("#search-bar-desktop > div").appendTo($("#search-bar-mobile"));
       
    }
  }

  function onXlUp(media){
    if (media.matches) {
      $("#search-bar-mobile > div").appendTo($("#search-bar-desktop"));
    }
  }

  if($('#tab-description').length != 0){
    $('#tab-description').html($('#tab-description').html().replaceAll('[TABS]','<br />').replaceAll('[/TABS]',"</br />")); 
  }

  $(document).on('click', '.faq-item h2, .faq-item i ', function(e){

    e.preventDefault();

    if($(this).closest('.faq-accordian').hasClass('is-open')){
      $('.faq-content').hide();
      $('.faq-accordian').removeClass('is-open');

    }else{
      $('.faq-content').hide();
      $('.faq-accordian').removeClass('is-open');
  
      
      $(this).closest('.faq-accordian').addClass('is-open');    
      $(this).closest('.faq-accordian').find('.faq-content').show();
  
    }
  });
  
  $(document).on('click', 'a[href^="#"]', function (event) {
    event.preventDefault();
  
    $('html, body').animate({
      scrollTop: $($.attr(this, 'href')).offset().top
    }, 500);
  });

  $(document).on("change", "select.faqs-lists", function(event){
    let val = $(this).val();
    event.preventDefault();
    $('html, body').animate({
      scrollTop: $(val).offset().top
    }, 500);
  });


  loadAllWishlistItems();
  const modal = defaultModal();
  let productId = null

  $(document).on('change', '.ws_radio', function(e){
    e.preventDefault();
    
    let  wishlist = $(this).val();

    if(wishlist == 'null'){
      return true;
    }

    productId = $(this).attr('data-product-id');  

    
    console.log(wishlist, productId);

    if(wishlist == 'create-new'){

      
      modal.open();
      modal.updateContent('<i class="fas fa-circle-notch fa-spin"></i> Please Wait', { wrap: true });

      api.getPage('/wishlist.php?action=addwishlist', 
        {
            template: 'account/create-wishlist',
        },
        (err, content) => {
        if (err) {
            return modal.updateContent(err);
        }
        modal.updateContent(content, { wrap: true });

    });

    }
    else{
      addToWishlist(wishlist, productId);
    }

  });

  $(document).on('click', '#tablet_nav_account_link', function(e){
    e.preventDefault();
    $(this).closest('.inner-nav').find('.dropdown-menu').toggleClass('acc-open');
  });

  /*
    Custom Wishlist On PLP Pages
  */

  $(document).on('click', '.btn-add-to', function(){
    createNewWishlist('My Wish List' , productId);
  });

  $(document).on('click', '.btn-create-wishlist', function(){
    let val = $('#wishlistname').val();
    let ws_name = val.trim(); 
    if(val.length == 0){
      $('#ws-error').remove();
      $('#wishlistname').parent().append('<span id="ws-error">Wish List name is required</span>')
    }else{
      createNewWishlist(ws_name , productId);
    }
  });

  $(document).on('click', '.btn-wishlist', function(){
    let  wishlist = $(this).attr('data-wishlist-id');
    let  productId = $(this).attr('data-product-id');

    if($(this).attr('data-wishlist-action')=='add'){
      loadAllWishlist(productId);

      /*let content = $(this).closest('.card').find('.wishlist-popup').html();
      modal.open();
      modal.updateContent(content, { wrap:true, header:'Add To Wish List'});*/
      
    }

    if($(this).attr('data-wishlist-action')=='delete'){

      let  itemId = $(this).attr('data-wishlist-itemid'); 
      $(this).find('i').removeClass('fas fa-heart').addClass('fas fa-circle-notch fa-spin');  

      wm.deleteWishlistItem(wishlist, itemId).then(() => {
        $(this).find('i').removeClass('fas fa-circle-notch fa-spin').addClass('fal fa-heart');
        $(this).attr('data-wishlist-action','add');
      }).catch(error => {
        console.log(`Something went wrong when trying to remove item from Wish List.`);
      });

    }
      

  }); 
  
  // Get All Wishlists 
  function loadAllWishlist(pid){

    modal.open();
    modal.updateContent('<i class="fas fa-circle-notch fa-spin"></i> Please Wait', { wrap: true  });

    wm.getAllWishlists().then(wishlists => { 
      let ws_html = `<select class="ws_radio select-wishlist" data-product-id="${pid}"> <option value="null" >Please Select</option>`;
      if(wishlists.length != 0){
        wishlists.forEach(wishlist => {
          ws_html += `<option value='${wishlist.id}'>${wishlist.name}</option>`;
        });
      }else {
        ws_html += '<option class="btn-add-to" value="add-new" >Add to My Wish List</option>'
      }

      ws_html += '<option name="wishlist_id"   value="create-new" >Create New Wish List</option>';
      ws_html += `</select>`;

      modal.updateContent(ws_html, { wrap:true, header:'Add To Wish List'});
    });
  }
  
  // Get All Wishlists Items
  function loadAllWishlistItems(){
    wm.getAllWishlists().then(wishlists => { 
      console.log(wishlists);
      if(wishlists != null){
        wishlists.forEach(wishlist => {
          wm.getWishlist(wishlist.id).then(({ name, items, is_public, share_url }) => {
            items.forEach(element => { 

              $('.btn-wishlist[data-product-id='+element.product_id+'] i ').removeClass('fal fa-heart').addClass('fas fa-heart');
              $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-action','delete');
              $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-itemid',element.id);
              $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-id', wishlist.id)
              
            });
          });
        });
      }
    });
  }

  // Add to Wishlists 
  function addToWishlist(wishlist, productId){
    modal.updateContent('<i class="fas fa-circle-notch fa-spin"></i> Please Wait', { wrap: true  });
    wm.addWishlistItem(wishlist, productId).then(item => {
      $(this).attr('data-wishlist-itemid',item.id);
      $(this).find('i').removeClass('fas fa-circle-notch fa-spin').addClass('fas fa-heart');
      $(this).attr('data-wishlist-action','delete');
      loadAllWishlistItems();
      modal.updateContent('Added to Wish List', { wrap: true });  
      setTimeout(() => {       
        modal.close();
      }, 2000);      
      
    }).catch(error => {
      modal.updateContent('Something went wrong when trying to add item from Wish List.', { wrap: true });  
      modal.close();
    });

  }

  // Create New Wishlist
  function createNewWishlist(name, p_id){ 
    let isPublic = $('#publicwishlist').val();
    modal.updateContent('<i class="fas fa-circle-notch fa-spin"></i> Please Wait', { wrap: true  });
    wm.createWishlist({ name: name, is_public: isPublic, product_id: p_id }).then(({id, items}) => {
       
      // $('button[data-product-id="'+p_id+'"]').attr('data-wishlist-itemid',item.id);
      // $('button[data-product-id="'+p_id+'"]').attr('data-wishlist-action','delete');

      items.forEach(element => { 

        $('.btn-wishlist[data-product-id='+element.product_id+'] i ').removeClass('fal fa-heart').addClass('fas fa-heart');
        $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-action','delete');
        $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-itemid',element.id);
        $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-id', id)
        
      });      
      modal.updateContent('Wish List Created', { wrap: true });  
      setTimeout(() => {        
        modal.close();
      }, 2000);
    }).catch(error => {
      modal.updateContent('Something went wrong when trying to add item from Wish List.', { wrap: true });  
      modal.close();
    });
  }

  let limitParams = new URLSearchParams(window.location.search) 
  if(limitParams.has('limit')){
    if(jQuery("#limit").length){
      jQuery("#limit").val(limitParams.get('limit'))
    }
  }
  
  $(document).on('mouseover', '.nav-item.has-submenu',function(){

    $('.nav-item.has-submenu').not(this).removeClass('is-open');
    if($(this).hasClass('is-open')){
      // Needed for Click Event
      // $(this).removeClass('is-open');
    }
    else{
      $(this).addClass('is-open');
    }
    
  });

  // Closes desktop mega menu when hover outside of it.
  $(document).on('mouseover', '#topNavDesktop, main, footer', function () {
    // For .main
    if (!$(this).hasClass('nav-submenu')) {
        $('.nav-item.has-submenu').removeClass('is-open');
        $(this).toggleClass('is-open');
    }
  });

  $(document).on('keydown', function(event) {
    if (event.key == "Escape") {
      $('.nav-item.has-submenu').removeClass('is-open');
      $(this).toggleClass('is-open');
    }
  });

  $(document).on('mouseup', function(e){
    var container = $(".nav-primary");
    if (!container.is(e.target) && container.has(e.target).length === 0){
      $('.nav-item.has-submenu').removeClass('is-open');
    }
  });

} 

$(document).on('change','.form-minMaxRow .form-control', function(){
  
  if($(this).hasClass('min-field')){
    $(this).closest("#facet-range-form").find("input[name='min_price']").val($(this).val());  
  }

  if($(this).hasClass('max-field')){
    $(this).closest("#facet-range-form").find("input[name='max_price']").val($(this).val());  
  }

});


$(document).on('click','.price-checkbox', function(){
  let price_range = []

  $('form#facet-range-form input[type="checkbox"]:checked').each(function(){

    if(this.checked){
      price_range[price_range.length]=$(this).attr('data-min-price')
      price_range[price_range.length]=$(this).attr('data-max-price')
    }

  });
 
  
  $(this).closest("#facet-range-form").find("input[name='min_price']").val(price_range[0]);
  $(this).closest("#facet-range-form").find("input[name='max_price']").val(price_range[(price_range.length) - 1 ]);
  $(this).closest("#facet-range-form").find('button[type="submit"]').trigger('click');
});

$(document).on('click','#cookie-policy', function(e){
  e.preventDefault();
  document.cookie = 'OptanonAlertBoxClosed=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;' 
  location.reload();    
})

