// const Mousetrap = require('mousetrap');

export default function () {
    $(document).ready(() => {
        $('#skiptocontent a').on('focus', () => {
            $('#skiptocontent').addClass('focusin');
        }).on('focusout', () => {
            $('#skiptocontent').removeClass('focusin');
        });
        // only show custom AX focus styles after tab key is pressed (return, space, tab, shift, left, up, right, down)
        document.addEventListener('keydown', (e) => { if (e.keyCode === 9 || 32 || 13 || 16 || 37 || 38 || 39 || 40) $('body').addClass('show-focus-outlines'); });
        document.addEventListener('click', () => { $('body').removeClass('show-focus-outlines'); });

        // skip to content link adjustments based on page type
        if ($('#target-skip').length) {
            $('#skiptocontent a').attr('href', '#target-skip');
        }

        // add alt value to tracking pixels
        setTimeout(() => {
            $(document).find('body>img').attr('alt', '').attr('aria', 'hidden');
        }, 100);
        $(document).find('body>img').attr('alt', '').attr('aria', 'hidden');

        // Begin keyboard functions & scoped varibales
        let $menu = null;
        let $nextMenu = '';
        let $prevMenu = '';

        function fnStopPropagation(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        }

        function fnToggleDropdown(active) {
            let isactive = active;
            const $submenu = $menu.next();
            if ($submenu.length) {
                if (isactive === undefined) {
                    isactive = $menu.is('.active');
                }
                if (isactive) {
                    $menu.removeClass('active');
                    $submenu.slideUp({
                        done: () => {
                            $menu.get(0).scrollIntoView(false);
                        },
                    });
                } else {
                    $menu.addClass('active');
                    $menu.siblings('div').addClass('is-open');
                    $submenu.slideDown();
                }
            }
        }

        function fnChangeMenu($newMenu, force) {
            if (force || ($menu && !$menu.is($newMenu))) {
                fnToggleDropdown(true);// HERE
                $newMenu.focus();
            }
            $menu = $newMenu;
        }

        function fnNavigateMenu($takeNextmenu) {
            if ($takeNextmenu.find('.nav-link').first().length) {
                fnChangeMenu($takeNextmenu.find('.nav-link').first(), true);
            } else {
                fnChangeMenu($menu);
                $menu.removeClass('active');
                $menu.focus();
            }
        }

        $(document).keydown((event) => {
            // console.log('BOOM');
            const keycode = (event.keyCode ? event.keyCode : event.which);
            const $inputQuant = $('.form-control:input[type="number"]:focus');
            const $navItem = $('.nav-link:focus');
            const $pagination = $('.page-link:focus');
            // console.log('KEY: ', keycode, '. Inp: ', $inputQuant.length, '. nav: ', $navItem.length, '. pag: ', $pagination.length);
            // role buttons spacekey binding
            if ($(event.target).attr('role') === 'button' && keycode === 32) {
                // console.log('BOOM 2');
                event.target.click();
            } else if ($navItem.length) {
                // console.log('BOOM 3');
                switch (keycode) {
                default:
                    // do nothing
                    break;
                case 37:
                    fnStopPropagation(event);
                    // console.log('c: move left in main nav');
                    fnChangeMenu($navItem);
                    $nextMenu = $menu.parent().prev();
                    fnNavigateMenu($nextMenu);
                    break;
                case 39:
                    fnStopPropagation(event);
                    // console.log('e: move right in main nav');
                    fnChangeMenu($navItem);
                    $prevMenu = $menu.parent().next();
                    fnNavigateMenu($prevMenu);
                    break;
                }
            // } else if ($inputQuant.length && (keycode === 38 || keycode === 40)) {
            //     console.log('BOOM 3');
            //     event.preventDefault();
            //     let curVal = '';
            //     switch (keycode) {
            //     default:
            //         // do nothing
            //         break;
            //     case 40:
            //         console.log('down in input');
            //         curVal = $($inputQuant).val();
            //         curVal--;
            //         $($inputQuant).val(curVal);
            //         break;
            //     case 38:
            //         console.log('up in input');
            //         curVal = $($inputQuant).val();
            //         curVal++;
            //         $($inputQuant).val(curVal);
            //         break;
            //     }
            } else if ($pagination.length && (keycode === 37 || keycode === 39)) {
                // console.log('BOOM 4');
                fnStopPropagation(event);
                switch (keycode) {
                default:
                    // do nothing
                    break;
                case 37:
                    // if focused in pagination control
                    $('.page-link:focus').parent().prev().find('.page-link').focus();
                    break;
                case 39:
                    // if focused in pagination control
                    $('.page-link:focus').parent().next().find('.page-link').focus();
                    break;
                }
            }
        });

        // Begin Complex Keyboard Menu Control
        // Mousetrap.bind(['space', 'up', 'down', 'left', 'right'], (e, key) => {
        //     let $nextMenu = '';
        //     let $prevMenu = '';
        //     let $contents = '';
        //     // let $next = '';
        //     const $navItem = $('.nav-link:focus');
        //     const $pagination = $('.page-link:focus') || $('.pagination-item:focus');
        //     const focused = $(':focus');
        //     const depth = focused.parents('.list-group').length;

        //     const nestedRow = $navItem.parents('.MM-container').find('.MM-row').find('.MM-row').length;

        //     const rowNumber = $navItem.parents('.MM-container').find('.MM-row').index($navItem.parents('.MM-row'));
        //     const totalRows = $navItem.parents('.MM-container').find('.MM-row').length - 1;
        //     const colNumber = $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber})`).find('.MM-column').index($navItem.parents('.MM-column'));
        //     const totalCols = $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber})`).find('.MM-column').length - 1;
        //     // console.log('Depth:', depth, 'Nested: ', nestedRow, '      Row: ', rowNumber, ' of ', totalRows, '      Col: ', colNumber, ' of ', totalCols);
        //     // if using moustrap for custom area, stop propagation on that event
        //     if ($navItem.length > 0 || $pagination.length > 0) {
        //         fnStopPropagation(e);
        //     }
        //     // if statement for different functional areas:
        //     //      nav, pagination
        //     if ($navItem.length) {
        //         switch (key) {
        //         default:
        //             // do nothing
        //             break;
        //         case 'up':
        //             if (depth === 0) {
        //                 // opens dropdown if at top level
        //                 fnToggleDropdown();
        //             } else if ($navItem.is('.has-subMenu')) {
        //                 const $prev = $menu.parent().prev().find('.nav-link').first();
        //                 if ($prev.length && nestedRow !== 1) {
        //                     // console.log('a');
        //                     fnChangeMenu($navItem);
        //                 } else if (depth === 1 && $navItem.hasClass('nav-header') && rowNumber > 0 && nestedRow !== 1) {
        //                     // console.log('b: move up a row, same column, header node');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber - 1})`).find(`.MM-column:eq(${colNumber}) .nav-link`).first().focus();
        //                 } else {
        //                     // console.log('c: move up to main nav, collapse MM');
        //                     fnChangeMenu($menu, true);
        //                 }
        //             } else if ($navItem.parent().is(':first-child')) {
        //                 if ($navItem.parent().parent().siblings().hasClass('nav-header')) {
        //                     if (nestedRow > 0) {
        //                         // console.log('f: go from first node in nested list to header node');
        //                         $navItem.parents('.MM-row').find('.nav-header').first().focus();
        //                     } else {
        //                         // console.log('f: go from first node in list to header node');
        //                         $navItem.parents('.MM-column').find('.nav-header').first().focus();
        //                     }
        //                 } else {
        //                     console.log('');
        //                     if (rowNumber === 0) {
        //                         // console.log('g');
        //                         fnChangeMenu($menu, true);
        //                     } else if (nestedRow > 0) {
        //                         // console.log('h: in nested row, go to closest header');
        //                         $navItem.parent().parent().parent().siblings('.nav-header').focus();
        //                     } else {
        //                         // console.log('i2');
        //                         $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber - 1})`).find(`.MM-column:eq(${colNumber}) .nav-link`).focus();
        //                     }
        //                 }
        //             } else if ($navItem.parent().parent().is('.list-group-horizontal')) {
        //                 // console.log('j');
        //                 fnChangeMenu($menu, true);
        //             } else {
        //                 // console.log('k: move up to next node');
        //                 $navItem.parent().prev().find('.nav-link').first().focus();
        //             }
        //             break;
        //         case 'down':
        //             if (depth === 0) {
        //                 // console.log('A: down at first level');
        //                 if ($navItem.is('.active')) {
        //                     // console.log('A: find first link and focus on it');
        //                     $contents = $navItem.next();
        //                     $contents.find('.nav-link').first().focus();
        //                 } else {
        //                     // console.log('A: open dropdown');
        //                     fnChangeMenu($navItem);
        //                     fnToggleDropdown();
        //                 }
        //             } else if (depth === 1 && $navItem.hasClass('nav-header')) {
        //                 // console.log('B: down from header node');
        //                 $navItem.next().find('.nav-link').first().focus();
        //             } else if (depth === 2 && $navItem.parent().is(':last-child')) {
        //                 // console.log('D: down from last element in a list');
        //                 if (rowNumber < totalRows) {
        //                     // console.log('E: down from first row');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber - 1})`).find(`.MM-column:eq(${colNumber}) .nav-link`).first().focus();
        //                 } else {
        //                     // console.log('G: No lower nodes');
        //                     break;
        //                 }
        //             } else {
        //                 // console.log('J: down to next node');
        //                 $navItem.parent().next().find('.nav-link').first().focus();
        //             }
        //             break;
        //         case 'left':
        //             if (depth === 1 || depth === 2) {
        //                 if (colNumber > 0) {
        //                     // console.log('a: move to left column, first node');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber})`).find(`.MM-column:eq(${colNumber - 1})`).find('.nav-link').first().focus();
        //                 } else if (rowNumber > 0 && nestedRow !== 1) {
        //                     // console.log('b: move up row, last column, first node');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber - 1})`).find(`.MM-column:eq(${totalCols})`).find('.nav-link').first().focus();
        //                 } else {
        //                     // console.log('b: no more left nodes');
        //                     break;
        //                 }
        //             } else {
        //                 // console.log('c: move left in main nav');
        //                 fnChangeMenu($navItem);
        //                 $nextMenu = $menu.parent().prev();
        //                 fnNavigateMenu($nextMenu);
        //             }
        //             break;
        //         case 'right':
        //             if (depth === 1 || depth === 2) {
        //                 if (colNumber < totalCols) {
        //                     // console.log('a: move to right column, first node');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber})`).find(`.MM-column:eq(${colNumber + 1}) .nav-link`).first().focus();
        //                 } else if (colNumber === totalCols && rowNumber < totalRows) {
        //                     // console.log('b: move to first column, second row, first node');
        //                     $navItem.parents('.MM-container').find(`.MM-row:eq(${rowNumber + 1})`).find('.MM-column:eq(0) .nav-link').first().focus();
        //                 } else {
        //                     // console.log('c: no more right nodes');
        //                     break;
        //                 }
        //             } else if (depth === 3 || nestedRow > 0) {
        //                 // console.log('d: in nested structure');
        //                 if (colNumber < totalCols) {
        //                     // console.log('d1: move to right column');
        //                     $navItem.closest(`.MM-column:eq(${colNumber})`).siblings(`.MM-column:eq(${colNumber + 1})`).find('.nav-link').first().focus();
        //                 } else if (colNumber === totalCols && rowNumber < totalRows) {
        //                     // console.log('d2');
        //                     $navItem.closest(`.MM-row:eq(${rowNumber})`).siblings(`.MM-row:eq(${rowNumber})`).find('.nav-link').first().focus();
        //                 } else {
        //                     break;
        //                 }
        //             } else {
        //                 // console.log('e: move right in main nav');
        //                 fnChangeMenu($navItem);
        //                 $prevMenu = $menu.parent().next();
        //                 fnNavigateMenu($prevMenu);
        //             }
        //             break;
        //         case 'space':
        //             if (depth === 0) {
        //                 fnToggleDropdown();
        //             }
        //             break;
        //         }
        //     }
        // });
        // End menu controls
    });
}
