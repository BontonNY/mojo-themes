/**
 * Show the maintenance mode message to store administrators
 * @param maintenanceMode
 */
export default function (maintenanceMode = {}) {
    const header = maintenanceMode.header;
    const notice = maintenanceMode.notice;
    const password = maintenanceMode.password || false || 'ytnfelaufg';
    const securePath = maintenanceMode.securePath || '';

    function isInIframe() {
        try {
            return window.location !== window.parent.location;
        } catch (e) {
            return true;
        }
    }

    // Return if header & notice is null or if isInIframe is false (inside theme editor)
    if (!(header && notice) || isInIframe()) {
        return;
    }

    if (password) {
        const $element = $('<div>', {
            class: 'previewCode',
        });

        const url = encodeURIComponent((new URL(window.location.href).pathname + window.location.search).replace(/^\/|\/$/g, ''));

        $element.html(`
            <div class="row bg-dark text-white px-2 pb-1 rounded-right text-center">
                <div class="col pl-0">
                    <div class="small">preview code</div>
                    <strong>${password}</strong>
                </div>
                <div class="col p-0 d-flex align-items-center">
                    <a class="btn-light btn-sm" href="${securePath}/manage/theme-editor?redirectIframeUrl=${url}" target="_blank">Edit Page</a>
                </div>
            </div>`);

        $('body').prepend($element);
    } else {
        const $element = $('<div>', {
            id: 'maintenance-notice',
            class: 'maintenanceNotice',
        });


        $element.html(`<p class="maintenanceNotice-header">${header}</p>${notice}`);

        $('body').append($element);
    }
}
