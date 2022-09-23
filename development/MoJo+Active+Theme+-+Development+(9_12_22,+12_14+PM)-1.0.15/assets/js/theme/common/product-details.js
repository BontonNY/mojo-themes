import utils from "@bigcommerce/stencil-utils";
import "foundation-sites/js/foundation/foundation";
import "foundation-sites/js/foundation/foundation.reveal";
import ImageGallery from "../product/image-gallery";
import modalFactory, { showAlertModal } from "../global/modal";
import _, { isEmpty, isNumber, isObject, isPlainObject } from "lodash";
import Wishlist from "../wishlist";

export default class ProductDetails {
  constructor($scope, context, productAttributesData = {}) {
    this.$overlay = $("[data-cart-item-add] .loadingOverlay");
    this.$scope = $scope;
    this.context = context;
    this.imageGallery = new ImageGallery($("[data-image-gallery]", this.$scope));
    this.imageGallery.init();
    this.listenQuantityChange();
    this.initRadioAttributes();
    Wishlist.load(this.context);
    this.getTabRequests();

    const $form = $("form[data-cart-item-add]", $scope);
    const $productOptionsElement = $("[data-product-option-change]", $form);
    const hasOptions = $productOptionsElement.html() ? $productOptionsElement.html().trim().length : 0;
    const hasDefaultOptions = $productOptionsElement.find("[data-default]").length;

    $productOptionsElement.on("change", (event) => { 
      this.productOptionsChanged(event);
      this.setProductVariant();
    });

    $form.on("submit", (event) => {
      this.addProductToCart(event, $form[0]);
    });

    // Update product attributes. Also update the initial view in case items are oos
    // or have default variant properties that change the view
    if ((isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
      const $productId = $('[name="product_id"]', $form).val();

      utils.api.productAttributes.optionChange($productId, $form.serialize(), "products/bulk-discount-rates", (err, response) => {
        const attributesData = response.data || {};
        const attributesContent = response.content || {};
        this.updateProductAttributes(attributesData);
        if (hasDefaultOptions) {
          this.updateView(attributesData, attributesContent);
        } else {
          this.updateDefaultAttributesForOOS(attributesData);
        }
      });
    } else {
      this.updateProductAttributes(productAttributesData);
    }

    $productOptionsElement.show();

    this.previewModal = modalFactory("#previewModal")[0];

    this.showSelectedOptionValue();

    // Changes Swatches to Images of Product
    this.imageSwatchesPDP();
  }

  /**
   * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
   * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
   * @param formData: FormData object
   * @returns FormData object
   */
  filterEmptyFilesFromForm(formData) {
    try {
      for (const [key, val] of formData) {
        if (val instanceof File && !val.name && !val.size) {
          formData.delete(key);
        }
      }
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
    return formData;
  }

  setProductVariant() {
    if (this.context.isAMP) {
      return;
    }

    const unsatisfiedRequiredFields = [];
    const options = [];

    $.each($("[data-product-attribute]"), (index, value) => {
      const optionLabel = value.children[0].innerText;
      const optionTitle = optionLabel.split(":")[0].trim();
      const required = optionLabel.toLowerCase().includes("required");
      const type = value.getAttribute("data-product-attribute");

      if ((type === "input-file" || type === "input-text" || type === "input-number") && value.querySelector("input").value === "" && required) {
        unsatisfiedRequiredFields.push(value);
      }

      if (type === "textarea" && value.querySelector("textarea").value === "" && required) {
        unsatisfiedRequiredFields.push(value);
      }

      if (type === "date") {
        const isSatisfied = Array.from(value.querySelectorAll("select")).every((select) => select.selectedIndex !== 0);

        if (isSatisfied) {
          const dateString = Array.from(value.querySelectorAll("select"))
            .map((x) => x.value)
            .join("-");
          options.push(`${optionTitle}:${dateString}`);

          return;
        }

        if (required) {
          unsatisfiedRequiredFields.push(value);
        }
      }

      if (type === "set-select") {
        const select = value.querySelector("select");
        const selectedIndex = select.selectedIndex;

        if (selectedIndex !== 0) {
          options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);

          return;
        }

        if (required) {
          unsatisfiedRequiredFields.push(value);
        }
      }

      if (type === "set-rectangle" || type === "set-radio" || type === "swatch" || type === "input-checkbox" || type === "product-list") {
        const checked = value.querySelector(":checked");
        if (checked) {
          if (type === "set-rectangle" || type === "set-radio" || type === "product-list") {
            const label = checked.labels[0].innerText;
            if (label) {
              options.push(`${optionTitle}:${label}`);
            }
          }

          if (type === "swatch") {
            if(typeof checked.labels[0] != 'undefined'){
              const label = checked.labels[0].children[0];
              if (label) {
                options.push(`${optionTitle}:${label.title}`);
              }
            }
          }

          if (type === "input-checkbox") {
            options.push(`${optionTitle}:Yes`);
          }

          return;
        }

        if (type === "input-checkbox") {
          options.push(`${optionTitle}:No`);
        }

        if (required) {
          unsatisfiedRequiredFields.push(value);
        }
      }
    });

    let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(", ") : "unsatisfied";
    const view = $(".productView");

    if (productVariant) {
      productVariant = productVariant === "unsatisfied" ? "" : productVariant;
      if (view.attr("data-event-type")) {
        view.attr("data-product-variant", productVariant);
      } else {
        const productName = view.find(".productView-title")[0].innerText;
        const card = $(`[data-name="${productName}"]`);
        card.attr("data-product-variant", productVariant);
      }
    }
  }

  /**
   * Since $productView can be dynamically inserted using render_with,
   * We have to retrieve the respective elements
   *
   * @param $scope
   */
  getViewModel($scope) {
    return {
      $priceWithTax: $("[data-product-price-with-tax]", $scope),
      $priceWithoutTax: $("[data-product-price-without-tax]", $scope),
      rrpWithTax: {
        $div: $(".rrp-price--withTax", $scope),
        $span: $("[data-product-rrp-with-tax]", $scope),
      },
      rrpWithoutTax: {
        $div: $(".rrp-price--withoutTax", $scope),
        $span: $("[data-product-rrp-price-without-tax]", $scope),
      },
      nonSaleWithTax: {
        $div: $(".non-sale-price--withTax", $scope),
        $span: $("[data-product-non-sale-price-with-tax]", $scope),
      },
      nonSaleWithoutTax: {
        $div: $(".non-sale-price--withoutTax", $scope),
        $span: $("[data-product-non-sale-price-without-tax]", $scope),
      },
      priceSaved: {
        $div: $(".price-section--saving", $scope),
        $span: $("[data-product-price-saved]", $scope),
      },
      priceNowLabel: {
        $span: $(".price-now-label", $scope),
      },
      priceLabel: {
        $span: $(".price-label", $scope),
      },
      $weight: $(".productView-info [data-product-weight]", $scope),
      $increments: $(".form-field--increments :input", $scope),
      $addToCart: $("#form-action-addToCart", $scope),
      $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
      stock: {
        $container: $(".form-field--stock", $scope),
        $input: $("[data-product-stock]", $scope),
      },
      sku: {
        $label: $("dt.sku-label", $scope),
        $value: $("[data-product-sku]", $scope),
      },
      upc: {
        $label: $("dt.upc-label", $scope),
        $value: $("[data-product-upc]", $scope),
      },
      quantity: {
        $text: $(".incrementTotal", $scope),
        $input: $("[name=qty\\[\\]]", $scope),
      },
      $bulkPricing: $(".productView-info-bulkPricing", $scope),
    };
  }

  /**
   * Checks if the current window is being run inside an iframe
   * @returns {boolean}
   */
  isRunningInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  /**
   *
   * Handle product options changes
   *
   */
  productOptionsChanged(event) {
 
    if($("#"+event.target.id).closest('.form-field').attr('data-product-attribute')=="swatch"){
      $("#img-loading").addClass('active');
    }

    const $changedOption = $(event.target);
    const $form = $changedOption.parents("form");
    const productId = $('[name="product_id"]', $form).val();

    // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
    if ($changedOption.attr("type") === "file" || window.FormData === undefined) {
      return;
    }

    utils.api.productAttributes.optionChange(productId, $form.serialize(), "products/bulk-discount-rates", (err, response) => {
      

      const productAttributesData = response.data || {};
      const productAttributesContent = response.content || {};
      this.updateProductAttributes(productAttributesData);
      this.updateView(productAttributesData, productAttributesContent);

      setTimeout(function(){
        if($("#img-loading").hasClass('active')){
            $("#img-loading").removeClass('active');
        }
      },1000)

    });
  }

  showProductImage(image) {
    if (isPlainObject(image)) {
      
      const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
        image.data,
        { "1x": this.context.themeSettings.zoom_size }
        /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
      );

      const mainImageUrl = utils.tools.imageSrcset.getSrcset(
        image.data,
        { "1x": this.context.themeSettings.product_size }
        /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
      );

      const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data);

      this.imageGallery.setAlternateImage({
        mainImageUrl,
        zoomImageUrl,
        mainImageSrcset,
      });

      
    } else {
      this.imageGallery.restoreImage();
    }
  }

  /**
   *
   * Handle action when the shopper clicks on + / - for quantity
   *
   */
  listenQuantityChange() {
    this.$scope.on("click", "[data-quantity-change] button", (event) => {
      event.preventDefault();
      const $target = $(event.currentTarget);
      const viewModel = this.getViewModel(this.$scope);
      const $input = viewModel.quantity.$input;
      const quantityMin = parseInt($input.data("quantityMin"), 10);
      const quantityMax = parseInt($input.data("quantityMax"), 10);

      let qty = parseInt($input.val(), 10);

      // If action is incrementing
      if ($target.data("action") === "inc") {
        // If quantity max option is set
        if (quantityMax > 0) {
          // Check quantity does not exceed max
          if (qty + 1 <= quantityMax) {
            qty++;
          }
        } else {
          qty++;
        }
      } else if (qty > 1) {
        // If quantity min option is set
        if (quantityMin > 0) {
          // Check quantity does not fall below min
          if (qty - 1 >= quantityMin) {
            qty--;
          }
        } else {
          qty--;
        }
      }

      // update hidden input
      viewModel.quantity.$input.val(qty);
      // update text
      viewModel.quantity.$text.text(qty);
    });

    // Prevent triggering quantity change when pressing enter
    this.$scope.on("keypress", ".form-input--incrementTotal", (event) => {
      // If the browser supports event.which, then use event.which, otherwise use event.keyCode
      const x = event.which || event.keyCode;
      if (x === 13) {
        // Prevent default
        event.preventDefault();
      }
    });
  }

  /**
   *
   * Add a product to cart
   *
   */
  addProductToCart(event, form) {
    const $addToCartBtn = $("#form-action-addToCart", $(event.target));
    const originalBtnVal = $addToCartBtn.val();
    const waitMessage = $addToCartBtn.data("waitMessage");

    // Do not do AJAX if browser doesn't support FormData
    if (window.FormData === undefined) {
      return;
    }

    // Somehow Safari iOS doesn't work right with FormData,
    // so we submit the form as normal.
    if (this.context.isAMP) {
      $(form).attr("target", "_top");
      return;
    }

    // Prevent default
    event.preventDefault();

    $addToCartBtn.val(waitMessage).prop("disabled", true);

    this.$overlay.show();

    // Add item to cart
    utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
      const errorMessage = err || response.data.error;

      $addToCartBtn.val(originalBtnVal).prop("disabled", false);

      this.$overlay.hide();

      // Guard statement
      if (errorMessage) {
        // Strip the HTML from the error message
        const tmp = document.createElement("DIV");
        tmp.innerHTML = errorMessage;

        return showAlertModal(tmp.textContent || tmp.innerText);
      }

      //Open preview modal and update content
      if (this.previewModal) {
        // this.previewModal.open();
        this.updateCartContent(this.previewModal, response.data.cart_item.id);
        $('.nav-item--cart a').trigger('click')
      } else {
        this.$overlay.show();
        // if no modal, redirect to the cart page
        this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
      }
    });
  }

  /**
   * Get cart contents
   *
   * @param {String} cartItemId
   * @param {Function} onComplete
   */
  getCartContent(cartItemId, onComplete) {
    const options = {
      template: "cart/preview",
      params: {
        suggest: cartItemId,
      },
      config: {
        cart: {
          suggestions: {
            limit: 4,
          },
        },
      },
    };

    utils.api.cart.getContent(options, onComplete);
  }

  /**
   * Redirect to url
   *
   * @param {String} url
   */
  redirectTo(url) {
    if (this.isRunningInIframe() && !window.iframeSdk) {
      window.top.location = url;
    } else {
      window.location = url;
    }
  }

  /**
   * Update cart content
   *
   * @param {Modal} modal
   * @param {String} cartItemId
   * @param {Function} onComplete
   */
  updateCartContent(modal, cartItemId, onComplete) {
    this.getCartContent(cartItemId, (err, response) => {
      if (err) {
        return;
      }

      modal.updateContent(response);

      // Update cart counter
      const $body = $("body");
      const $cartQuantity = $("[data-cart-quantity]", modal.$content);
      const $cartCounter = $(".nav-item--cart .cart-count .cart-quantity");
      const quantity = $cartQuantity.data("cartQuantity") || 0;

      $cartCounter.addClass("cart-count--positive");
      $body.trigger("cart-quantity-update", quantity);

      if (onComplete) {
        onComplete(response);
      }
    });
  }

  /**
   * Show an message box if a message is passed
   * Hide the box if the message is empty
   * @param  {String} message
   */
  showMessageBox(message) {
    const $messageBox = $(".productAttributes-message");

    if (message) {
      $(".alertBox-message", $messageBox).text(message);
      $messageBox.show();
    } else {
      $messageBox.hide();
    }
  }

  /**
   * Hide the pricing elements that will show up only when the price exists in API
   * @param viewModel
   */
  clearPricingNotFound(viewModel) {
    viewModel.rrpWithTax.$div.hide();
    viewModel.rrpWithoutTax.$div.hide();
    viewModel.nonSaleWithTax.$div.hide();
    viewModel.nonSaleWithoutTax.$div.hide();
    viewModel.priceSaved.$div.hide();
    viewModel.priceNowLabel.$span.hide();
    viewModel.priceLabel.$span.hide();
  }

  /**
   * Update the view of price, messages, SKU and stock options when a product option changes
   * @param  {Object} data Product attribute data
   */
  updatePriceView(viewModel, price) {
    this.clearPricingNotFound(viewModel);

    if (price.with_tax) {
      viewModel.priceLabel.$span.show();
      viewModel.$priceWithTax.html(price.with_tax.formatted);
    }

    if (price.without_tax) {
      viewModel.priceLabel.$span.show();
      viewModel.$priceWithoutTax.html(price.without_tax.formatted);
    }

    if (price.rrp_with_tax) {
      viewModel.rrpWithTax.$div.show();
      viewModel.rrpWithTax.$span.html(price.rrp_with_tax.formatted);
    }

    if (price.rrp_without_tax) {
      viewModel.rrpWithoutTax.$div.show();
      viewModel.rrpWithoutTax.$span.html(price.rrp_without_tax.formatted);
    }

    if (price.saved) {
      viewModel.priceSaved.$div.show();
      viewModel.priceSaved.$span.html(price.saved.formatted);
    }

    if (price.non_sale_price_with_tax) {
      viewModel.priceLabel.$span.hide();
      viewModel.nonSaleWithTax.$div.show();
      viewModel.priceNowLabel.$span.show();
      viewModel.nonSaleWithTax.$span.html(price.non_sale_price_with_tax.formatted);
    }

    if (price.non_sale_price_without_tax) {
      viewModel.priceLabel.$span.hide();
      viewModel.nonSaleWithoutTax.$div.show();
      viewModel.priceNowLabel.$span.show();
      viewModel.nonSaleWithoutTax.$span.html(price.non_sale_price_without_tax.formatted);
    }
  }

  /**
   * Update the view of price, messages, SKU and stock options when a product option changes
   * @param  {Object} data Product attribute data
   */
  updateView(data, content = null) {
    const viewModel = this.getViewModel(this.$scope);

    this.showMessageBox(data.stock_message || data.purchasing_message);

    if (isObject(data.price)) {
      this.updatePriceView(viewModel, data.price);
    }

    if (isObject(data.weight)) {
      viewModel.$weight.html(data.weight.formatted);
    }

    // Set variation_id if it exists for adding to wishlist
    if (data.variantId) {
      viewModel.$wishlistVariation.val(data.variantId);
    }

    // If SKU is available
    if (data.sku) {
      viewModel.sku.$value.text(data.sku);
      viewModel.sku.$label.show();
    } else {
      viewModel.sku.$label.hide();
      viewModel.sku.$value.text("");
    }

    // If UPC is available
    if (data.upc) {
      viewModel.upc.$value.text(data.upc);
      viewModel.upc.$label.show();
    } else {
      viewModel.upc.$label.hide();
      viewModel.upc.$value.text("");
    }

    // if stock view is on (CP settings)
    if (viewModel.stock.$container.length && isNumber(data.stock) &&  data.stock != 0 ) {
      
      // if the stock container is hidden, show
      viewModel.stock.$container.removeClass("d-none");
      viewModel.stock.$input.text(data.stock);
      
      // console.log('data.stock', data.stock);

      if($('[data-product-option-change]').length){
        $("[data-product-option-change] div:eq(0)").after(viewModel.stock.$container)
      }
    } else {
      viewModel.stock.$container.addClass("d-none");
      viewModel.stock.$input.text(data.stock);

    }

    this.updateDefaultAttributesForOOS(data);

    // If Bulk Pricing rendered HTML is available
    if (data.bulk_discount_rates && content) {
      viewModel.$bulkPricing.html(content);
    } else if (typeof data.bulk_discount_rates !== "undefined") {
      viewModel.$bulkPricing.html("");
    }
  }

  updateDefaultAttributesForOOS(data) {
    const viewModel = this.getViewModel(this.$scope);
    if (!data.purchasable || !data.instock) {
      viewModel.$addToCart.prop("disabled", true);
      viewModel.$increments.prop("disabled", true);
    } else {
      viewModel.$addToCart.prop("disabled", false);
      viewModel.$increments.prop("disabled", false);
    }
  }

  /**
   * Hide or mark as unavailable out of stock attributes if enabled
   * @param  {Object} data Product attribute data
   */
  updateProductAttributes(data) {
    const behavior = data.out_of_stock_behavior;
    const inStockIds = data.in_stock_attributes;
    const outOfStockMessage = ` (${data.out_of_stock_message})`;

    this.showProductImage(data.image);

    if (behavior !== "hide_option" && behavior !== "label_option") {
      return;
    }

    $("[data-product-attribute-value]", this.$scope).each((i, attribute) => {
      const $attribute = $(attribute);
      const attrId = parseInt($attribute.data("productAttributeValue"), 10);

      if (inStockIds.indexOf(attrId) !== -1) {
        this.enableAttribute($attribute, behavior, outOfStockMessage);
        // console.log("enableAttribute")
      } else {
        this.disableAttribute($attribute, behavior, outOfStockMessage);
        // console.log("disableAttribute ")
      }
    });
  }

  disableAttribute($attribute, behavior, outOfStockMessage) {
    if (this.getAttributeType($attribute) === "set-select") {
      return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
    }

    if (behavior === "hide_option") {
      $attribute.hide();
    } else {
      $attribute.addClass("unavailable");
    }
  }

  disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
    const $select = $attribute.parent();

    if (behavior === "hide_option") {
      $attribute.toggleOption(false);
      // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
      if ($select.val() === $attribute.attr("value")) {
        $select[0].selectedIndex = 0;
      }
    } else {
      $attribute.attr("disabled", "disabled");
      $attribute.html($attribute.html().replace(outOfStockMessage, "") + outOfStockMessage);
    }
  }

  enableAttribute($attribute, behavior, outOfStockMessage) {
    if (this.getAttributeType($attribute) === "set-select") {
      return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
    }

    if (behavior === "hide_option") {
      $attribute.show();
    } else {
      $attribute.removeClass("unavailable");
    }
  }

  enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === "hide_option") {
      $attribute.toggleOption(true);
    } else {
      $attribute.prop("disabled", false);
      $attribute.html($attribute.html().replace(outOfStockMessage, ""));
    }
  }

  getAttributeType($attribute) {
    const $parent = $attribute.closest("[data-product-attribute]");

    return $parent ? $parent.data("productAttribute") : null;
  }

  /**
   * Allow radio buttons to get deselected
   */
  initRadioAttributes() {
    $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
      const $radio = $(radio);

      // Only bind to click once
      if ($radio.attr("data-state") !== undefined) {
        $radio.on("click", () => {
          if ($radio.data("state") === true) {
            $radio.prop("checked", false);
            $radio.data("state", false);

            $radio.trigger("change");
          } else {
            $radio.data("state", true);
          }

          this.initRadioAttributes();
        });
      }

      $radio.attr("data-state", $radio.prop("checked"));
    });
  }

  /**
   * Check for fragment identifier in URL requesting a specific tab
   */
  getTabRequests() {
    if (window.location.hash && window.location.hash.indexOf("#tab-") === 0) {
      const $activeTab = $(".tabs").has(`[href='${window.location.hash}']`);
      const $tabContent = $(`${window.location.hash}`);
      if ($activeTab.length > 0) {
        $activeTab.find(".tab").removeClass("active").has(`[href='${window.location.hash}']`).addClass("active");
        $tabContent.addClass("active").siblings().removeClass("active");
      }
    }
  }

  showSelectedOptionValue() {
    
    $('[data-product-attribute] select').on('change', function(){
      // console.log('CHANGES')
      // console.log($(this).attr('data-value'))
      $(this).parent().find('span[data-option-value]').html('');
      $(this).parent().find('span[data-option-value]').html(
        $(this).find('option:selected').text()
      );
    });

    $('[data-product-attribute] input[type="radio"]').on('click', function(){
      $(this).parent().find('span[data-option-value]').html(
         $(this).attr('data-value')
      );
    });

    $('#size-chart-popup').on('click', function(e){
        e.preventDefault();
        // console.log('size_chart_popup');
        const $sizeModel = modalFactory("#alert-modal")[0];
        $sizeModel.open();
        $sizeModel.updateContent('<p>SIZE CHART INFO</p>');
    })

    // let id = $('[data-product-option-change] .form-field:first-child').find(' .form-option').first().attr('for');
    // if($("#"+id).is('input')){
    //   $("#"+id).trigger('click');
    // }
    $('.form-option-swatch').on('click',function(event){
      if (document.body.clientWidth <= 767) {
        let imageFileName = event.currentTarget.firstElementChild.style.backgroundImage;
        let n = imageFileName.lastIndexOf('/');
        imageFileName = imageFileName.substring(n + 1, (imageFileName.length - 2));
        const imageURL = `/images/stencil/${document.body.clientWidth}w/attribute_rule_images/${imageFileName}`;
        const imageViewerFirstSlide = document.querySelector('.productViewMobile-thumbnails .owl-stage:first-child img');
        imageViewerFirstSlide.setAttribute('src', imageURL);
        imageViewerFirstSlide.setAttribute('srcset', imageURL);
      }

      var imageOffsetTop = $('.product-main-image').offset().top;
      var scrollTop = $(window).scrollTop();
      if(scrollTop > imageOffsetTop){
        console.log(scrollTop);
        $("html, body").animate({ scrollTop: imageOffsetTop }, "slow");
      }
    });

    /*
    // Picks First Available Size
    $('[data-product-option-change] [data-product-attribute="set-rectangle"]').each(function () {
      let id = $(this).find('.form-option:not(.unavailable)').first().attr('for');
      if ($("#" + id).is('input')) {
        $("#" + id).trigger('click');
        // Picks First Available Color
        setTimeout(() => {
          $('[data-product-option-change] [data-product-attribute="swatch"]').each(function () {
            let id = $(this).find('.form-option:not(.unavailable)').first().attr('for');
            if ($("#" + id).is('input')) {
              $("#" + id).trigger('click');
            }
          });
        }, 2000);
      }
    });
    */

  }

  // Changes Swatches to Images of Product
  imageSwatchesPDP() {
    const productID = document.querySelector("div.productView").getAttribute("data-entity-id");
    fetch(`https://bc.mojoactive.com/products?id=${productID}&include=variants`, {
        method: "GET",
        headers: {
            "X-STOREIDENTIFIER": "cf275027-b466-45e5-9957-65fe819093ca",
        },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data[0].variants) {
                const swatches = document.getElementsByClassName("form-option-swatch");
                swatches.forEach((swatch) => {
                    const swatchID = swatch.getAttribute("data-product-attribute-value");
                    let changedToImage = false;
                    data[0]?.variants?.map(({ option_values, image_url }) => {
                        const imgLarge = image_url;
                        option_values.forEach((oneOption) => {
                            if (oneOption.option_display_name.toLowerCase() === 'color') {
                                if (oneOption.id == swatchID) {
                                    if (imgLarge.length && !changedToImage) {
                                        // console.log(swatchID);
                                        // console.log(oneOption.id);
                                        const index = imgLarge.lastIndexOf('/');
                                        const imgFileName = imgLarge.substring(index + 1);
                                        const imgSmall = "/images/stencil/60w/attribute_rule_images/" + imgFileName;
                                        // console.log(swatch.firstElementChild.style);
                                        swatch.firstElementChild.style.backgroundImage = `url(${imgSmall})`;
                                        changedToImage = true;
                                    }
                                }
                            }
                        });
                    });
                });
            }
            document.querySelector("[data-product-attribute='swatch']").style.display = "block";
        });
}
}

