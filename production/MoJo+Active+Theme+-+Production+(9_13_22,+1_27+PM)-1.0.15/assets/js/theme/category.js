import { hooks } from "@bigcommerce/stencil-utils";
import CatalogPage from "./catalog";
import compareProducts from "./global/compare-products";
import FacetedSearch from "./common/faceted-search";
import cookie from "js-cookie";
import { createTranslationDictionary } from "./common/translations-utils";  

export default class Category extends CatalogPage {
  constructor(context) {
    super(context);
    this.validationDictionary = createTranslationDictionary(context);
  }

  onReady() { 
    compareProducts(this.context.urls);
    // this.initCustomFacets();
    this.initFacetedSearch();

    this.onSortBySubmit = this.onSortBySubmit.bind(this);
    hooks.on("sortBy-submitted", this.onSortBySubmit);

    this.initBind();

    const searchParam = window.location.search;
    if (searchParam.indexOf("?sort") > -1) {
      if (searchParam.indexOf("?sort=featured") > -1) {
        $('#sort option[value="featured"]').attr("selected", true);
      }
    } else {
      $('#sort option[value="default"]').attr("selected", true);
    } 

    $(document).on('click', '.brand-filter-item', function(){

      if($(this).hasClass('active')){
        $('.brand-filter-item').removeClass('active');  
        $('[data-cat-group]').show();
      }else{
        $('.brand-filter-item').removeClass('active');
        $(this).addClass('active')

        let dataHref = $(this).attr('data-cat');
        $('[data-cat-group]').hide();
        $('[data-cat-group="'+dataHref+'"]').show();
      }
    });
    
  }
 

  // initCustomFacets() {
  //   $("[data-custom-facet]").each((i, el) => {
  //     // console.log('facet');
  //     const $el = $(el);
  //     const facet = $el.data("custom-facet");
  //     const $facet = $(`[data-facet="${facet}"] [data-faceted-search-facet]`);
  //     const link = $facet.attr("href");
  //     if ($facet.is(".is-selected")) {
  //       $el.addClass("font-weight-bold");
  //     }
  //     if (link) {
  //       $el.attr("href", link);
  //     } else {
  //       $el.fadeOut();
  //     }
  //   });
  // }

  initFacetedSearch() {
    const {
      price_min_evaluation: onMinPriceError,
      price_max_evaluation: onMaxPriceError,
      price_min_not_entered: minPriceNotEntered,
      price_max_not_entered: maxPriceNotEntered,
      price_invalid_value: onInvalidPrice,
    } = this.validationDictionary;
    const $productListingContainer = $("#product-listing-container");
    const $facetedSearchContainer = $("#faceted-search-container");
    const productsPerPage = this.context.categoryProductsPerPage;
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true,
          products: {
            limit: productsPerPage,
          },
        },
      },
      template: {
        productListing: "category/product-listing",
        sidebar: "category/sidebar",
      },
      showMore: "category/show-more",
    };

    this.facetedSearch = new FacetedSearch(
      requestOptions,
      (content) => {
        $productListingContainer.html(content.productListing);
        $facetedSearchContainer.html(content.sidebar);
        var topPos = $productListingContainer.offset().top - 100;
        $("html, body").animate({scrollTop: topPos}, 500);
        $("body").triggerHandler("compareReset");
        $('.total-product-count').remove();

        if(localStorage.getItem("col-per-row")){
          $('#c_rows').val(localStorage.getItem("col-per-row"))
          if( 'more' == localStorage.getItem("col-per-row")){
            $('.productGrid').addClass('more').removeClass('less');
          }else{
            $('.productGrid').addClass('less').removeClass('more');
          }
        }

      },
      {
        validationErrorMessages: {
          onMinPriceError,
          onMaxPriceError,
          minPriceNotEntered,
          maxPriceNotEntered,
          onInvalidPrice,
        },
      }
    );

    

  }

  initBind() {
    $("#sort-link").on("click", () => {
      $("#sort-link").toggleClass("is-open");
      $("form.actionBar").toggleClass("d-none");
    });

    // client request: remember the filter open/close state between pages
    const cookieFilterName = "bc_sd_filter";
    const cookieFilterValue = cookie.get(cookieFilterName);

    // $("#filter-link").click(() => {
    //   $("#sort-controls").removeClass("show");
    //   cookie.set(cookieFilterName, cookieFilterValue === "open" ? "closed" : "open");
    // });

    // function toggleFilterBox(show) {
    //   $("#filter-link").attr("aria-expanded", show);
    //   $("#filter-controls")[show ? "addClass" : "removeClass"]("show");
    //   // They didn't want this anymore.
    //   // setTimeout(() => {
    //   //     $('html,body').animate({
    //   //         scrollTop: $('#filter-controls').offset().top - 350,
    //   //     }, 250, 'swing');
    //   // }, 250);
    // }

    // toggleFilterBox(cookieFilterValue === "open");

    // hide the filter box when a click happens outside the element
    // document.addEventListener("click", (e) => {
    //   if (document.getElementById("filter-controls").className.indexOf("show") > -1) {
    //     if (!document.getElementById("filter-controls").contains(e.target)) {
    //       cookie.set(cookieFilterName, "closed");
    //       toggleFilterBox(false);
    //     }
    //   }
    // });

    // hide the filter control box when sort is opened
    $('[data-target="#sort-controls"]').click(() => toggleFilterBox(false));

    // handles the trigger change on the hidden select box
    function sortSelectOption(elm) {
      const val = elm.data("value");
      $("select#sort").val(val).trigger("change");
    }
    // handles setting the active state for the dropdown
    function sortSetActive(index) {
      $("#sort-controls a").removeClass("active");
      $("#sort-controls a").eq(index).addClass("active");
    }
    $("#sort-controls a").click((e) => sortSelectOption($(e.target)));

    // set the selected state on page load (if any)
    const selectedSort = $("#sort-controls a[data-selected]");
    if (selectedSort.length > 0) $('[data-target="#sort-controls"]').find("span").text(selectedSort.text());

    // accessibility keyboard navigation for the sort select
    $('#sort-controls, [data-target="#sort-controls"]').on("keydown", (e) => {
      const len = $("#sort-controls a").length;
      const current = $("#sort-controls a.active").index();
      switch (e.which) {
        case 27: // ESC
        case 9: // TAB
          $("#sort-controls").removeClass("show");
          break;
        case 32: // SPACE
        case 13: // ENTER
          e.preventDefault();
          if ($("#sort-controls").hasClass("show")) {
            sortSelectOption($("#sort-controls a.active"));
          } else {
            $("#sort-controls").addClass("show");
          }
          break;
        case 38: // UP
          e.preventDefault();
          $("#sort-controls").addClass("show");
          sortSetActive(current > 0 ? current - 1 : len - 1);
          break;
        case 40: // DOWN
          e.preventDefault();
          $("#sort-controls").addClass("show");
          sortSetActive(current + 1 < len ? current + 1 : 0);
          break;
        default:
          break;
      }
    });

    // if (/sort=/.test(window.location.search)) {
    //     if (/sort=(featured|default)/.test(window.location.search)) {
    //         $('[data-target="#sort-controls"] > span').text('Featured Items');
    //     }
    // } else {
    //     $('[data-target="#sort-controls"] > span').text('SORT');
    // }

    // add space bar functionality to the clear all filters and compare products button
    $("#btnClearAllFilters, .navUser-item--compare").keydown((e) => {
      e.preventDefault();
      if (e.which === 32) window.location.href = $(e.target).attr("href");
    });
    // add enter functionality for the compare checkboxes
    $('.checkbox-parent input[type="checkbox"]').keydown((e) => {
      if (e.which === 13) $(e.target).click();
    });

    $(".layout-toggle .toggle-link.grid").on("click", (e) => {
      $(".page-content").removeClass("list-layout").addClass("grid-layout");
      $(".layout-toggle .toggle-link.grid").addClass("active");
      $(".layout-toggle .toggle-link.list").removeClass("active");
      e.preventDefault();
    });
    $(".layout-toggle .toggle-link.list").on("click", (e) => {
      $(".page-content").removeClass("grid-layout").addClass("list-layout");
      $(".layout-toggle .toggle-link.list").addClass("active");
      $(".layout-toggle .toggle-link.grid").removeClass("active");
      e.preventDefault();
    });
  }

  

  

  
}
