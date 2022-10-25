require('whatwg-fetch');

function getPageHtmlContent(PAGE_URL) {
    /* eslint no-undef: "off" */
    return fetch(PAGE_URL, { credentials: 'same-origin' })
        .then(page => page.text());
}

export default class GetPageHtml {
    constructor () {
        this.html = {};
    }
    async getPage(PAGE_URL) {
        const getPageText = await getPageHtmlContent(PAGE_URL);
        if (!getPageText) {
            return;     // There is no page
        }
//         const $fragment = document.createElement('div');
//         $fragment.innerHTML = getPageText;
//         this.html = $fragment;
        
        return getPageText;
        
    }

};
