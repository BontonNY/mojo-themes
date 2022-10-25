import Cookies from 'js-cookie';
import $ from 'jquery';

const LOGIN_FORM_REDIRECT = 'mja:login:redirect';

export default async function () {
    if (Cookies.get(LOGIN_FORM_REDIRECT)) {
        Cookies.remove(LOGIN_FORM_REDIRECT);
        window.location = '/';
    } else if ($('#non-customer-login-form').length) {
        $('#non-customer-login-form').on('submit', () => {
            Cookies.set(LOGIN_FORM_REDIRECT, true);
            return true;
        });
    }
}
