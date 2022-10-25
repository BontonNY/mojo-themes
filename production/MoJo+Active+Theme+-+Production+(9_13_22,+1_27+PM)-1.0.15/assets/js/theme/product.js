/* eslint-disable func-names */
/*
 Import all product specific js
 */
import axios from "axios";
import collapsibleFactory from "./common/collapsible";
import { classifyForm } from "./common/form-utils";
import ProductDetails from "./common/product-details";
import PageManager from "./page-manager";
import Review from "./product/reviews";
import videoGallery from "./product/video-gallery";
import CustomWishlist from './custom-wishlist';

export default class Product extends PageManager {
  constructor(context) {
    super(context);
    this.url = window.location.href;
    this.$reviewLink = $('[data-target="#modal-review-form"]');
    this.$bulkPricingLink = $('[data-target="#modal-bulk-pricing"]');
  }

  onReady() { 
    CustomWishlist()

    // Listen for foundation modal close events to sanitize URL after review.
    $(document).on("close.fndtn.reveal", () => {
      if (this.url.indexOf("#write_review") !== -1 && typeof window.history.replaceState === "function") {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    });

    let validator;

    // Init collapsible
    collapsibleFactory();

    this.productDetails = new ProductDetails($(".productView"), this.context, window.BCData.product_attributes);
    this.productDetails.setProductVariant();

    try {
      // safely load the dosage charts from webdav, some charts may not exist...
      const sku = $("[data-sku]").data("sku");
      if (sku) {
        axios({ url: `/content/charts/${sku}.html`, headers: { Accept: "text/html" } }).then((res) => {
          if (res.status === 200 && res.data && (res.data.indexOf('404 Error') === -1 || res.data.indexOf('Page not found') === -1)) {
            $(".tabCharts").removeClass("d-none");
            $(".tabChartsPane").html(res.data).removeClass("d-none");
          }
        }).catch(() => {})
      }
    } catch (ex) {}

    videoGallery();

    const $reviewForm = classifyForm(".writeReview-form");
    const review = new Review($reviewForm);

    $("body").on("click", '[data-target="#modal-review-form"]', () => {
      validator = review.registerValidation(this.context);
    });

    $reviewForm.on("submit", () => {
      if (validator) {
        validator.performCheck();
        return validator.areAll("valid");
      }

      return false;
    });

    this.productReviewHandler();
    this.bulkPricingHandler();
    this.pdpTableRowShowHide();
    this.pdpReviewRowShowHide();
    this.pdpReviewWidgetInit();
    this.renderRecentlyViewed();

    $(document).on("click", ".see-more-item", function(){
      $(this).parent().find("li").removeClass('hide').addClass("show");
      $(this).removeClass('see-more-item');
    });

    $(document).on("click", ".inline-gallery .see-more-item", function(){
      console.log('INLINE');
      $("ul.productView-thumbnails").removeClass('inline-gallery');
    });

    $(document).on("click",".product-description-accordian li.acc-item", function(){
      $($(this).find("a").attr("href")).slideToggle();
      $(this).toggleClass('is-active');
      if($(this).hasClass('is-active')){
        $(this).find('i.fa-plus').removeClass('fa-plus').addClass('fa-minus')
      }else{
        $(this).find('i.fa-minus').removeClass('fa-minus').addClass('fa-plus')
      }      
    });
    
    $(document).on("click","#modal-review-form-link", function(){ 
      $("a.write-review").trigger('click');
    });
    

 


  }

  productReviewHandler() {
    if (this.url.indexOf("#write_review") !== -1) {
      this.$reviewLink.trigger("click");
    }
  }

  bulkPricingHandler() {
    if (this.url.indexOf("#bulk_pricing") !== -1) {
      this.$bulkPricingLink.trigger("click");
    }
  }
  // handle too many rows of data below
  // needs accessibility attributes if they still care
  pdpTableRowShowHide() {
    const expander = $("#table-expansion");
    $("table.table tr").each((i, elm) => {
      if (i > 7) {
        $(elm).addClass("t-table-row").hide();
        expander.removeClass("d-none");
      }
    });
    expander.on("click", () => {
      if ($(".t-table-row:hidden").length > 0) {
        $(".t-table-row").show();
        expander.find("span").text("COLLAPSE");
        expander.find("svg").removeClass("fa-plus-circle").addClass("fa-minus-circle");
      } else {
        $(".t-table-row").hide();
        expander.find("span").text("EXPAND");
        expander.find("svg").removeClass("fa-minus-circle").addClass("fa-plus-circle");
      }
    });
  }
  pdpReviewRowShowHide() {
    const expander = $("#review-expansion");
    $(".review-article").each((i, elm) => {
      if (i > 1) {
        $(elm).addClass("b-target-row").hide();
        expander.removeClass("d-none");
        $(".pagination-list").addClass("d-none");
      }
    });
    expander.on("click", () => {
      if ($(".review-article:hidden").length > 0) {
        $(".b-target-row").show();
        $(".pagination-list").removeClass("d-none");
        expander.find("span").text("LESS REVIEWS");
        expander.find("svg").removeClass("fa-plus-circle").addClass("fa-minus-circle");
      } else {
        $(".b-target-row").hide();
        $(".pagination-list").addClass("d-none");
        expander.find("span").text("MORE REVIEWS");
        expander.find("svg").removeClass("fa-minus-circle").addClass("fa-plus-circle");
      }
    });
  }
  pdpReviewWidgetInit() {
    const reviews = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let totalValues = 0;
    let totalReviews = 0;
    $(".productReview-ratingNumber").each((i, elm) => {
      const rating = $(elm).html();
      // eslint-disable-next-line radix
      totalValues += parseInt(rating);
      // console.log('index: ', i, '.. rating: ', rating, '.. elm: ', elm, '.. Reviews: ');
      $.map(reviews, (value, key) => {
        // console.log(value, key, rating);
        if (key === rating) {
          return reviews[rating]++;
        }
      });
      totalReviews = i + 1;
    });
    // Calc the average review and update the text (including the based on number)
    if (totalReviews > 0) {
      let averageReview = totalValues / totalReviews;
      averageReview = Math.round(averageReview * 10) / 10;
      $("#NumberInRating span").text(totalReviews);
      $("#averageRating").text(averageReview);
      // Make each graph represent the amount of reviews contributing to the total review and update counts (runs backwards over count logic)
      let rCount = 5;
      $("#Review-Graph>span").each(function (i) {
        let thisPercent = reviews[i + rCount] / totalReviews;
        thisPercent *= 100;
        $(this).find(".line.front").css("width", `${thisPercent}%`);
        $(this)
          .find(".line.back")
          .css("width", `${100 - thisPercent}%`);
        $(this)
          .find(".graph.count")
          .text(`(${reviews[i + rCount]})`);
        rCount -= 2;
      });
    } else {
      $("#Review-Graph>span").each(function () {
        $(this).find(".graph.count").text("(0)");
      });
      $("#NumberInRating span").text(totalReviews);
      $("#averageRating").text(totalReviews);
      $("#product-reviews").find(".toggle-content .col").html('<p class="mt-4 mb-2 text-muted"> No Reviews Yet for This Product </p>');
    }
    $("#Review-Graph").toggleClass("d-none");
    const checkExist = setInterval(() => {
      if ($("#product-reviews").find(".lazyloaded, .lazyload").length) {
        $("#product-reviews").find(".lazyloaded, .lazyload").addClass("d-none");
        clearInterval(checkExist);
      }
    }, 100);
  }


  renderRecentlyViewed(){

    /*if($("#recently-viewed-section").length){
      axios({ url: `/account.php?action=recent_items`, headers: { Accept: "text/html", 'stencil-options': '{"render_with":"account/recent-items-carousel"}', } }).then((res) => {
        if (res.status === 200 && res.data && (res.data.indexOf('404 Error') === -1 || res.data.indexOf('Page not found') === -1)) {
          $("#recently-viewed-section").html(res.data);
          setTimeout(() => { 
            $('#recently-viewed-section').owlCarousel({
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
                  items: 5,
                  nav: true,
              }
              },
            }); 
          }, 100);

          console.log("$currentWishlistId product", $currentWishlistId);
          if(typeof $currentWishlistId  != 'undefined'){
            
            $("#recently-viewed-section").find('.btn-wishlist').each(function(){
              console.log("*******"); 
              console.log($(this).attr('data-product-id'));
            }) 
          }
          this.loadProductFromWishlistProductPage()

        }

      }).catch(() => {})
    }*/
  }

  loadProductFromWishlistProductPage(){
    if(typeof $currentWishlistId  != 'undefined'){
  
      let $id = $currentWishlistId;
      wm.getWishlist($id).then(({ name, items, is_public, share_url }) => {
        items.forEach(element => {
          $('.btn-wishlist[data-product-id='+element.product_id+'] i ').removeClass('fal fa-heart').addClass('fas fa-heart');
          $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-action','delete');
          $('.btn-wishlist[data-product-id='+element.product_id+'] ').attr('data-wishlist-itemid',element.id);
        });
      });
    }

  }
}
