import "owl.carousel";

export default function () {

  
  $("header .category-block-list:not(.owl-loaded)").owlCarousel({
    items: 10,
    dots: false,
    slideBy: 1,
    nav: true,
    stagePadding: 35,
    responsive: {
      0: {
        items: 2,
        slideBy: 1,
        nav: false,
        stagePadding: 0,
      },
      500: {
        items: 3,
        slideBy: 1,
        nav: false,
        stagePadding: 0,
      },
      769: {
        items: 4,
        slideBy: 1,
      },
      992: {
        items: 6,
        slideBy: 1,
      },
      1200: {
        items: 8,
        slideBy: 1,
      },
      1600: {
        items: 9,
        slideBy: 1,
      },
    },
  });
  
  $(".heroCarousel:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 1,
    margin: 0,
    nav: true,
    items: 1,
  });

  let count = $(".productCarousel").data("count") || 4;
  count = parseInt(count);
  $(".productCarousel:not(.owl-loaded)").owlCarousel({
    
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
        nav: true,
        
      },
      992: {
        items: 3,
        nav: true,
      },
      1200:{
        items: count,
        nav: true,
      }
    },
  });

 

  $(".testimonialsCarousel:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 1,
    margin: 15,
    nav: true,
    items: 1,
  });


  $(".logoCarousel:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 1,
    margin: 15,
    nav: true,
    responsive: {
      0: {
        items: 1,
      },
      992: {
        items: 3,
      },
    },
  });

  var productMainImageSlider = $(".product-main-image:not(.owl-loaded)");
  productMainImageSlider.owlCarousel({
    dots: false,
    margin: 15,
    nav: true,
    items: 1,
    navText : ["<i class='fal fa-2x fa-chevron-left'></i>","<i class='fal fa-chevron-right fa-2x'></i>"]
  });

  $(document).on('click','[data-product-attribute="swatch"] .form-radio', function(){
    productMainImageSlider.data('owl.carousel').to(0, 300, true);  
  });

  $(document).on('click','.productView-thumbnail-link', function(e){
    e.preventDefault(); 
    productMainImageSlider.data('owl.carousel').to($(this).attr('data-slide-to'), 300, true);
  })


  $(".productViewMobile-thumbnails.mobile-carosel:not(.owl-loaded)").owlCarousel({
    dots: true,
    margin: 15,
    nav: false,
    items: 1
  });

 
  var y=window.matchMedia("screen and (min-width: 768px)");
  y.addListener(onMdUp);
  onMdUp(y);

  var y=window.matchMedia("screen and (max-width: 767px)");
  y.addListener(onMdDown);
  onMdDown(y);


  function onMdDown(media){
    if (media.matches) {       
      $("#productView-description-desktop article").appendTo($("#productView-description-mobile "));
    }
  }

  function onMdUp(media){
    if (media.matches) { 
      $("#productView-description-mobile article").appendTo($("#productView-description-desktop"));
    }
  }


  $(".sub_category_list.cat-slider .cardGrid .row").addClass('owl-carousel')
  $(".sub_category_list.cat-slider .cardGrid").removeClass('cardGrid');

  
  $(" .sub_category_list.cat-slider .row:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 1,
    nav: true,
    margin:30,
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
        nav: true,                  
      },
      1600:{
        items: 6,
        nav: true,                  
      }
    }
  });

    
  $(".sub_category_list .cardGrid .row").addClass('owl-carousel')
  $(".sub_category_list .cardGrid").removeClass('cardGrid');

  
  $(" .sub_category_list .row:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 1,
    nav: true,
    margin:10,
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
          margin: 0,
          nav: true,                  
        },
        1600:{
          items: 6,
          margin: 0,
          nav: true,                  
        }

      }
  });
 

  $(".cardGrid-Slider .cardGrid .row").addClass('owl-carousel')
  $(".cardGrid-Slider .cardGrid").removeClass('cardGrid');

  
  $(" .cardGrid-Slider .row:not(.owl-loaded)").owlCarousel({
    dots: false,
    slideBy: 0,
    nav: true,
    margin:10,
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
          nav: true,                  
        },
        1600:{
          items: 5,
          nav: true,                  
        }

      }
  });
 
  
} 
