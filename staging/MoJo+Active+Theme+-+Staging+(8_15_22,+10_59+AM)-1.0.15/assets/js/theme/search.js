import { hooks } from "@bigcommerce/stencil-utils";
import CatalogPage from "./catalog";
import FacetedSearch from "./common/faceted-search";
import compareProducts from "./global/compare-products";
import urlUtils from "./common/url-utils";
import Url from "url";
import collapsibleFactory from "./common/collapsible";
import nod from "./common/nod";
import { orderBy } from "lodash";

export default class Search extends CatalogPage {
  formatCategoryTreeForJSTree(node) {
    const nodeData = {
      text: node.data,
      id: node.metadata.id,
      state: {
        selected: node.selected,
      },
    };

    if (node.state) {
      nodeData.state.opened = node.state === "open";
      nodeData.children = true;
    }

    if (node.children) {
      nodeData.children = [];
      node.children.forEach((childNode) => {
        nodeData.children.push(this.formatCategoryTreeForJSTree(childNode));
      });
    }

    return nodeData;
  }

  showProducts() {
    const url = urlUtils.replaceParams(window.location.href, {
      section: "product",
    });

    this.$productListingContainer.removeClass("d-none");
    this.$facetedSearchContainer.removeClass("d-none");
    this.$contentResultsContainer.addClass("d-none");

    $("[data-content-results-toggle]").removeClass("active");
    $("[data-content-results-toggle]").addClass("navBar-action");

    $("[data-product-results-toggle]").removeClass("navBar-action");
    $("[data-product-results-toggle]").addClass("active");

    urlUtils.goToUrl(url);
  }

  showContent() {
    const url = urlUtils.replaceParams(window.location.href, {
      section: "content",
    });

    this.$contentResultsContainer.removeClass("d-none");
    this.$productListingContainer.addClass("d-none");
    this.$facetedSearchContainer.addClass("d-none");

    $("[data-product-results-toggle]").removeClass("active");
    $("[data-product-results-toggle]").addClass("navBar-action");

    $("[data-content-results-toggle]").removeClass("navBar-action");
    $("[data-content-results-toggle]").addClass("active");

    urlUtils.goToUrl(url);
  }

  onReady() {
    compareProducts(this.context.urls);

    const $searchForm = $("[data-advanced-search-form]");
    const $categoryTreeContainer = $searchForm.find("[data-search-category-tree]");
    const url = Url.parse(window.location.href, true);
    const treeData = [];
    this.$productListingContainer = $("#product-listing-container");
    this.$facetedSearchContainer = $("#faceted-search-container");
    this.$contentResultsContainer = $("#search-results-content");

    // Init faceted search
    if ($("#filter-controls").length > 0) {
      this.initFacetedSearch();
    } else {
      this.onSortBySubmit = this.onSortBySubmit.bind(this);
      hooks.on("sortBy-submitted", this.onSortBySubmit);
    }

    $("#btnToggleSidebarFilters").on("click", function () {
      if ($(this).hasClass("is-open")) {
        $(".searchResults-filters").slideUp();
        $(this).removeClass("is-open");
      } else {
        $(".searchResults-filters").slideDown();
        $(this).addClass("is-open");
      }
    });

    // Init collapsibles
    collapsibleFactory();

    // $('[data-product-results-toggle]').on('click', event => {
    //     event.preventDefault();
    //     this.showProducts();
    // });

    // $('[data-content-results-toggle]').on('click', event => {
    //     event.preventDefault();
    //     this.showContent();
    // });

    // if (this.$productListingContainer.find('li.product').length === 0 || url.query.section === 'content') {
    //     this.showContent();
    // } else {
    //     this.showProducts();
    // }

    // this.showProducts();
    // this.showContent();

    const validator = this.initValidation($searchForm).bindValidation($searchForm.find("#search_query_adv"));

    this.context.categoryTree.forEach((node) => {
      treeData.push(this.formatCategoryTreeForJSTree(node));
    });

    this.categoryTreeData = treeData;
    this.createCategoryTree($categoryTreeContainer);

    $searchForm.on("submit", (event) => {
      let active = $(".category-list a.active");
      let selectedCategoryIds = active.toArray().map((o) => $(o).data("id"));

      if (!validator.check()) {
        return event.preventDefault();
      }

      $searchForm.find('input[name="category[]"]').remove();

      for (const categoryId of selectedCategoryIds) {
        const input = $("<input>", {
          type: "hidden",
          name: "category[]",
          value: categoryId,
        });

        $searchForm.append(input);
      }
    });

    const params = urlUtils.parseQueryParams(window.location.search.split("&"));
    if (params && params.section == "webpage") {
      // hide products and categories
      $(".search-panel--webpages .search-heading").hide();
      $(".search-panel--webpages").fadeIn();
    } else {
      $(".search-panel--products,.search-panel--webpages, .search-panel--categories").fadeIn();
    }

    mc.addWebpageImagesToSearchResults(params["?search_query"]);
  }

  loadTreeNodes(node, cb) {
    $.ajax({
      url: "/remote/v1/category-tree",
      data: { selectedCategoryId: node.id, prefix: "category" },
      headers: { "x-xsrf-token": window.BCData && window.BCData.csrf_token ? window.BCData.csrf_token : "" },
    }).done((data) => {
      cb(data.map((o) => this.formatCategoryTreeForJSTree(o)));
    });
  }

  createCategoryTree($container) {
    this.categoryTreeData = orderBy(this.categoryTreeData, (o) => o.text, "asc");
    for (let item of this.categoryTreeData) {
      this.renderCategoryItem($container, item);
    }

    $(document).on("click", ".category-list a", (e) => {
      e.preventDefault();
      if ($(e.target).hasClass("active")) {
        $(e.target).removeClass("active");
      } else {
        $(e.target).addClass("active");
      }
    });
  }

  renderCategoryItem($container, item) {
    let elm = $(`<ul class="category-list"></ul>`);
    elm.append(
      `<li>
      <a href="#" class="${item.state.selected ? "active" : ""}" data-id="${item.id}">
      <i class="fal fa-square" data-unselected></i>
      <i class="fas fa-check-square" data-selected style="display:none"></i>
      ${item.text}
      </a>
      </li>`
    );

    if (!item.state.opened && item.children) {
      this.loadTreeNodes(item, (data) => {
        if (data.length > 0) {
          data = orderBy(data, (o) => o.text, "asc");
          for (let child of data) {
            this.renderCategoryItem(elm, child);
          }
        }
      });
    } else if (item.state.opened && item.children) {
      if (Array.isArray(item.children) && item.children.length > 0) {
        item.children = orderBy(item.children, (o) => o.text, "asc");
        for (let child of item.children) {
          this.renderCategoryItem(elm, child);
        }
      }
    }

    $container.append(elm);
  }

  initFacetedSearch() {
    const $productListingContainer = $("#product-listing-container");
    const $facetedSearchContainer = $("#faceted-search-container");
    const $searchHeading = $("#search-results-heading");
    const $searchCount = $("#search-results-product-count");
    const productsPerPage = this.context.searchProductsPerPage;
    const requestOptions = {
      template: {
        productListing: "search/product-listing",
        sidebar: "search/sidebar",
        heading: "search/heading",
        productCount: "search/product-count",
      },
      config: {
        product_results: {
          limit: productsPerPage,
        },
      },
      showMore: "search/show-more",
    };

    this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
      $productListingContainer.html(content.productListing);
      $facetedSearchContainer.html(content.sidebar);
      $searchHeading.html(content.heading);
      $searchCount.html(content.productCount);

      $("body").triggerHandler("compareReset");

      $("html, body").animate(
        {
          scrollTop: 0,
        },
        100
      );
    });
  }

  initValidation($form) {
    this.$form = $form;
    this.validator = nod({
      submit: $form,
    });

    return this;
  }

  bindValidation($element) {
    if (this.validator) {
      this.validator.add({
        selector: $element,
        validate: "presence",
        errorMessage: $element.data("errorMessage"),
      });
    }

    return this;
  }

  check() {
    if (this.validator) {
      this.validator.performCheck();
      return this.validator.areAll("valid");
    }

    return false;
  }
}
