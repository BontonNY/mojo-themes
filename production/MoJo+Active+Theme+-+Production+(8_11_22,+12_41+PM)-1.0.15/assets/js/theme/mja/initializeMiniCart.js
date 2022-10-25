import $ from 'jquery';

export default function initializeMiniCart() {
    const $body = $('body');
    const $qty = $('.cart-qty');

    $body.on('cart-quantity-update', (event, quantity) => {
        $qty.text(`(${quantity})`);
    });

    setTimeout(() => {
        $qty.addClass('show');
    }, 500);
}
