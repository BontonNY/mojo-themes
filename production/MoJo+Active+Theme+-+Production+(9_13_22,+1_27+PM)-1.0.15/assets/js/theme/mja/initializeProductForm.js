import $ from 'jquery';
/**
 * A hack to remove the weird replacement on the category and search pages that strips out the first form element.
 * todo: figure out why this is happening and remove this code
 */
export default function initializeProductForm() {
    setTimeout(() => {
        $('[data-form-action]').each((i, el) => {
            const $el = $(el);
            const action = $el.data('form-action');
            const classes = $el.get()[0].classList;
            $el.find('[disabled]').removeAttr('disabled');
            $el.find('.disabled').removeClass('disabled');
            $el.replaceWith(`<form class="${classes}" action="${action}">${$el.html()}</form>`);
        });
    }, 500);
}
