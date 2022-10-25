import mja from '@mojoactive/lib';
// MVP: Enter NSN (part #), Quantity, creates a cart, redirects to cart

// FEATURES I WANT
// show cart items on open
// Show min 3 rows be default
// NSN field can take UPC, Part#, NSN, or other Name AKA SEARCH INPUTS
// Add new rows without pulling attention as needed
// autofill NSN suggestions
// quantity to validate stock level, show max order available
// ADD TO CART shows success message/graphic, then redirects to cart page
export default function () {
    $(document).ready(() => {
        function morefields(number) {
            let i = 0;
            while (i < number) {
                const $rowinputs = $('.repeating-form').last();
                const $cloneit = $($rowinputs).clone(true);
                // eslint-disable-next-line func-names
                $cloneit.find('input').each(function () {
                    const $this = $(this);
                    $this.attr('id', $this.attr('id').replace(/_(\d+)_/, ($0, $1) => `_${+$1 + 1}_`));
                    $this.attr('name', $this.attr('name').replace(/\[(\d+)\]/, ($0, $1) => `[${+$1 + 1}]`));
                    $this.val('');
                });
                // eslint-disable-next-line func-names
                $cloneit.find('label').each(function () {
                    const $this = $(this);
                    $this.attr('for', $this.attr('for').replace(/\[(\d+)\]/, ($0, $1) => `[${+$1 + 1}]`));
                });
                $cloneit.insertAfter($rowinputs);
                i++;
            }
        }
        $('#MoreInputs').click(() => {
            morefields(1);
        });
        // clone first set twice onload
        morefields(2);
    });

    // submit handling
    // check for existing cart or create new
    // add quantity of ProductId to said cart
    $('#quick-order').submit((e) => {
        // console.log('Handler for .submit() called.');
        e.preventDefault();
        const lineItems = $('.repeating-form').get().map((element) => { // fix selector
            const productId = $(element).find('.form-input.NSN').val();
            const quantity = $(element).find('.form-input.Quantity').val() || 0;
            // console.log(element, productId, quantity);
            return [productId, parseInt(quantity, 10)];
        }).filter(([, quantity]) => quantity > 0);
        // console.log(lineItems);
        mja.bc.addItem(...lineItems).then(() => {
            $('.navUser-item.navUser-item--cart>a, #cart-preview-dropdown').trigger('click'); // figure out completed state
            // console.log('SUCCESS');
        });
    });
}
