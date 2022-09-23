import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import swal from "./sweet-alert";
import { defaultModal } from "./modal";

export const CartPreviewEvents = {
    close: 'closed.fndtn.dropdown',
    open: 'opened.fndtn.dropdown',
};

export default function (secureBaseUrl, cartId) {
    const loadingClass = 'is-loading';
    const $cart = $('[data-cart-preview]');
    const $cartDropdown = $('#cart-preview-dropdown');
    const $cartLoading = $('<div class="loadingOverlay text-center m-3"><i class="fal fa-spin fa-spinner"></i></div>');

    const $body = $('body');

    $body.on('cart-quantity-update', (event, quantity) => {
        $('.cart-quantity')
            .text(quantity)
            .toggleClass('countPill--positive', quantity > 0);
        if (utils.tools.storage.localStorageAvailable()) {
            localStorage.setItem('cart-quantity', quantity);
        }
    });

    $cart.on('click', event => {
        const options = {
            template: 'common/cart-preview',
        };

        // Redirect to full cart page
        //
        // https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
        // In summary, we recommend looking for the string 'Mobi' anywhere in the User Agent to detect a mobile device.
        if (/Mobi/i.test(navigator.userAgent)) {
            return event.stopPropagation();
        }

        event.preventDefault();

        $cartDropdown
            .addClass(loadingClass)
            .html($cartLoading);
        $cartLoading
            .show();
        $('body').addClass('cart-open');
        utils.api.cart.getContent(options, (err, response) => {
            $cartDropdown
                .removeClass(loadingClass)
                .html(response);
            $cartLoading
                .hide();
        });
    }); 
    $cartDropdown.on('closed.fndtn.dropdown',function(event){
        $('body').removeClass('cart-open');
    });
    
    $(document).on('click', '.previewCartItem .form-increment .form-input',function(event){
        event.preventDefault();
        event.stopPropagation();
    });
    $(document).on('click', '.previewCartItem .form-increment .btn',function(event){
        event.preventDefault();
        event.stopPropagation();
        const $target = $(event.currentTarget);
        const $input = $(event.currentTarget).parent().find('input');
        const itemId = $(event.currentTarget).data('cart-itemid');

        console.log(itemId);

        let oldQty = parseInt($input.val(), 10);
        let qty = parseInt($input.val(), 10);

        if ($target.data('action') === 'inc') {
        qty++;
        } else if (qty > 1) {
        qty--;
        }

        $input.val(qty);

        if (qty === 1 && oldQty === 1) {
        //dont trigger for anything below 1
        } else {
        $cartDropdown
            .addClass(loadingClass)
            .append($cartLoading);
        $cartLoading
            .show();
            utils.api.cart.itemUpdate(itemId, qty, (err, response) => {
            if (response.data.status === 'succeed') {
            const options = {
                template: 'common/cart-preview',
            };
            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown
                .removeClass(loadingClass)
                .html(response);
                $cartLoading
                .hide();
                const cartTotal = $cartDropdown.find('[data-cart-total]').data('cart-total');
                console.log(cartTotal)
                $countPill.html(cartTotal);
            });
            } else {
            swal.fire(
                "Done!",
                response.data.errors.join('\n'),
                'error'
            );
            }
        });
        }
    });
    $(document).on('click', '.previewCartItem .close-icon',function(event){
        event.preventDefault();
        event.stopPropagation();
        $cartDropdown.close()
    });
    let quantity = 0;

    if (cartId) {
        // Get existing quantity from localStorage if found
        if (utils.tools.storage.localStorageAvailable()) {
            if (localStorage.getItem('cart-quantity')) {
                quantity = Number(localStorage.getItem('cart-quantity'));
                $body.trigger('cart-quantity-update', quantity);
            }
        }

        // Get updated cart quantity from the Cart API
        const cartQtyPromise = new Promise((resolve, reject) => {
            utils.api.cart.getCartQuantity({ baseUrl: secureBaseUrl }, (err, qty) => {
                if (err) {
                    reject(err);
                }
                resolve(qty);
            });
        });

        // If the Cart API gives us a different quantity number, update it
        cartQtyPromise.then(qty => {
            quantity = qty;
            $body.trigger('cart-quantity-update', quantity);
        });
    } else {
        $body.trigger('cart-quantity-update', quantity);
    }
    $(document).on('click',"[data-item-edit]", (event) => {
        const itemId = $(event.currentTarget).data("itemEdit");
  
        event.preventDefault();
        // edit item in cart
        
        const modal = defaultModal();
        const options = {
          template: "cart/modals/configure-product",
        };
    
        modal.open();
    
        utils.api.productAttributes.configureInCart(itemId, options, (err, response) => {
    
          response.content = response.content.replace('{name}', response.data.product_name)
          
          modal.updateContent(response.content);
    
        });
    
        utils.hooks.on("product-option-change", (event, option) => {
          const $changedOption = $(option);
          const $form = $changedOption.parents("form");
          const $submit = $("input.button", $form);
          const $messageBox = $(".alertMessageBox");
          const item = $('[name="item_id"]', $form).attr("value");
    
          utils.api.productAttributes.optionChange(item, $form.serialize(), (err, result) => {
            const data = result.data || {};
    
            if (err) {
              swal.fire({
                text: err,
                icon: "error",
              });
              return false;
            }
    
            if (data.purchasing_message) {
              $("p.alertBox-message", $messageBox).text(data.purchasing_message);
              $submit.prop("disabled", true);
              $messageBox.show();
            } else {
              $submit.prop("disabled", false);
              $messageBox.hide();
            }
    
            if (!data.purchasable || !data.instock) {
              $submit.prop("disabled", true);
            } else {
              $submit.prop("disabled", false);
            }
          });
        });
    });
}
