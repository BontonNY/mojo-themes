import './global/jquery-migrate';
import './common/select-option-plugin';
import $ from 'jquery'
window.$ = $;
import initMc from '../theme/mja/mc';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';

import SiteWideBanner from './sitewide-banners';
import GetPageHtml from './get-page-html';

import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';
import objectFitImages from './global/object-fit-polyfill';
import 'bootstrap/dist/js/bootstrap.bundle';
import loginForm from './loginForm';
import initializeProductForm from './mja/initializeProductForm';
import initializeMiniCart from './mja/initializeMiniCart';
import accessibility from './global/accessibility';
import nsnCartOrder from './global/NSNOrder';
import 'mousetrap';

//import Swatches from "@mojoactive/swatches";
import Swatches from './mja/swatches-mja';
import mja from "@mojoactive/lib";
import fetchProductVariantImages from './mja/fetchProductVariantImages';

import navigation from './mja/navigation'
import outgoingLinks from './mja/outgoing-links';
import owlCarousel from './global/owlCarousel';
import cookies from 'js-cookie';
import home from './global/home';

import axios from 'axios';
import matchHeight from 'jquery-match-height'

// detect useragent + platform // only when absolutely necessary
var b = document.documentElement;
	b.className = b.className.replace('no-js', 'js');
	b.setAttribute("data-useragent", navigator.userAgent.toLowerCase());
	b.setAttribute("data-platform", navigator.platform.toLowerCase());

var clStr = b.className,
	ua    = b.getAttribute("data-useragent"),
	pf    = b.getAttribute("data-platform"),
	is    = function(string){ return ua.indexOf(string) > -1 },
	browser = {
		isFirefox : is('firefox'),
		isIE 	  : is('msie') || is('trident/7.0'),
		isIE7 	  : is('msie 7.0'),
		isIE8 	  : is('msie 8.0'),
		isIE9 	  : is('msie 9.0'),
		isIE11    : is('rv:11') || is('trident/7.0'),
		isChrome  : is('chrome'),
		isWin7    : is('windows nt 6.1'),
		isWin8    : is('windows nt 6.2'),
		isWindows : pf.indexOf('win32') > -1,
		isAndroid : is('android'),
		isSafari  : is('safari') && !is('chrome'),
		isIPad    : is('ipad'),
		isIPhone  : is('iphone'),
		isAndroid : is('android')
	};

	for (var title in browser){
		var helperClass = title.slice(2).toLowerCase();
		if (browser[title]) { clStr += helperClass+' '; }
	}
	b.setAttribute('class',clStr);
// end user agent detection

function is_touch_device() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }
  if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }
  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");

var winW = $(window).width();
var winH = $(window).height();
var mja_cookie = cookies.get('mja.swatches.active');

function resize_func(){
	if(winW > 1024) {
		//do stuff
	}
};

export default class Global extends PageManager {
	onReady() {
		initMc();
		cartPreview(this.context.secureBaseUrl, this.context.cartId);
		quickSearch();
		currencySelector();
		foundation($(document));
		quickView(this.context);
		carousel();
		menu();
		mobileMenuToggle();
		privacyCookieNotification();
		maintenanceMode(this.context.maintenanceMode);
		loadingProgressBar();
		svgInjector();
		objectFitImages();
		loginForm();
		initializeProductForm();
		initializeMiniCart();
		accessibility();
		nsnCartOrder();
		navigation();
		outgoingLinks()
		owlCarousel();
		home();
		
		mja.bc.initialize({ storefront: this.context.storefrontAPIToken });
    
		Swatches.on('swatch:clicked', async ({ $product, swatch, swatchId }) => {
			const $img = $product.find('.card-image-normal');
			const img = $product.find(`[data-product-attribute-value=${swatchId}]`).data('large-img');
			$img.attr('src', img);
		});

		Swatches.on('swatch:loaded', async () => {
			$('article[data-prod]:not([data-custom-swatch])').each(async (i, el) => {
				const $product = $(el);
				
				$product.attr('data-custom-swatch', 'loading');
				const productId = $product.data('prod')
				
				const imageSets = await fetchProductVariantImages(productId);
				
				let noRepeatsMap = new Map();
				imageSets?.forEach(set => {
					if (set?.option?.entityId) {
						if (!noRepeatsMap.has(set.option.entityId)) {
							noRepeatsMap.set(set.option.entityId, true);
							const $swatch = $product.find(`[data-product-attribute-value="${set.option.entityId}"]`);
							$swatch.attr('data-large-img', set.large);
				
							const index = set.large.lastIndexOf('/');
							const imgFileName = set.large.substring(index + 1);
							const imgSmall = "/images/stencil/30w/attribute_rule_images/" + imgFileName;
							const span = $swatch.children()[0];
							span.style.backgroundImage = `url(${imgSmall})`;
				
							const $pattern = $('<span></span>')
								.addClass('form-option-variant form-option-variant--pattern')
								.attr('title', set.option.label)
								.css('background-image', `url(${set.img})`);
							$product.attr('data-custom-swatch', 'ready');
						}
					}
				});
				
				// this removes swatches that did not load - fix for variants with "purchasable" unchecked
				var swatchCount = $product.data('swatch-count');
				$product.find('[data-product-attribute-value]').each(function(){
					if($(this).html() == '<div class="loader"></div>') {
						$(this).remove();
						swatchCount = swatchCount-1;
					}
				});
				$product.attr('data-swatch-count', swatchCount);
				
				$product.find('[data-product-attribute="swatch"] input[type="radio"]:first').attr('checked', true);
				if(mja_cookie != 'null' && mja_cookie != null) {
					$('.form-option[data-product-attribute-value="'+mja_cookie+'"]').trigger('click');
				}
								
			})
		});

		Swatches.config.SwatchPreselect = false;
		Swatches.init(this.context.storefrontAPIToken);

		// Debugging Tool.
		$('[data-json]').each((i, el) => {
				// eslint-disable-next-line no-console
				console.log($(el).data('json'));
		});
		
		$('.nav-link[href*="sitewide-banners"]').parent().remove();
		$('.nav-link[href*="global-footer"]').parent().remove();
		$('.nav-link[href*="global-mega-nav"]').parent().remove();
		
		if($('#consent-manager-update-banner').length) {
			$('footer').addClass('consented');
		}
		
		const swb = new SiteWideBanner();
		swb.getBanners().then(banners => {
			if(typeof banners === 'object') {
				if(banners.top) {
					$('#sitewide-banner-top').html(banners.top[0])
				}
				if(banners.bottom) {
					$('#sitewide-banner-bottom').html(banners.bottom[0])
				}
			}
		}).catch(error => console.error(error));
        
    	if($('#get_footer').length) {
			var getFooter = new GetPageHtml();
			getFooter.getPage('/global-footer/').then(html => {
				var theFooter = $(html).find('footer').html();
				$('#get_footer').html(theFooter);
			}).catch(error => console.error(error));
		}
        

		var y=window.matchMedia("screen and (min-width: 1200px)");
		y.addListener(this.onXlUp);
		this.onXlUp(y);

		var y=window.matchMedia("screen and (max-width: 1199px)");
		y.addListener(this.onXlDown);
		this.onXlDown(y);


    	if($('.get_navPages-1').length) {
			var getmegaNav = new GetPageHtml();
			getmegaNav.getPage('/global-mega-nav/').then(html => {
				var megaNav1 = $(html).find('#megaNav_1').html();
				$('#global-nav #navPages-1').html(megaNav1);
				var megaNav2 = $(html).find('#megaNav_2').html();
				$('#global-nav #navPages-2').html(megaNav2);
				var megaNav3 = $(html).find('#megaNav_3').html();
				$('#global-nav #navPages-3').html(megaNav3);
				var megaNav4 = $(html).find('#megaNav_4').html();
				$('#global-nav #navPages-4').html(megaNav4);
				var megaNav5 = $(html).find('#megaNav_5').html();
				$('#global-nav #navPages-5').html(megaNav5);
				var megaNav6 = $(html).find('#megaNav_6').html();
				$('#global-nav #navPages-6').html(megaNav6);
				var megaNav7 = $(html).find('#megaNav_7').html();
				$('#global-nav #navPages-7').html(megaNav7);
				var megaNav8 = $(html).find('#megaNav_8').html();
				$('#global-nav #navPages-8').html(megaNav8);
				var megaNav9 = $(html).find('#megaNav_9').html();
				$('#global-nav #navPages-9').html(megaNav9);
				var megaNav10 = $(html).find('#megaNav_10').html();
				$('#global-nav #navPages-10').html(megaNav10);


		 

				this.onXlUp(y);
				this.onXlDown(y);
				
 

				
			}).catch(error => console.error(error));
		}
        
		$('body').on('click', '.nl_form_submit', function(e) {
			var the_form = $(this).parents('form');
			if(the_form.find('input[name="nl_email"]').val().trim() == '') {
				e.preventDefault();
				the_form.find('.js_error').text('required');
			} else {
				e.preventDefault();
				$.ajax({
					type: 'post',
					url: '/subscribe.php',
					data: $(the_form).serialize(),
					success: function(data) {
						var the_dom = $($.parseHTML(data));
						var the_text = the_dom.find('.page-content p span').text();
						
						if(the_text.indexOf('already subscribed') > -1) {
							the_form.find('.js_error').addClass('already').text('Already Subscribed');
						} else if(the_text.indexOf('Thank you for joining') > -1) {
							the_form.find('.js_error').addClass('success').text('Thanks for Signing Up');
						} else {
							the_form.find('.js_error').text('Please Try Again');
						}
					}
				});
			}
		});
        
        
        
/*
	 __                __        __
	/  \ |\ |    |    /  \  /\  |  \
	\__/ | \|    |___ \__/ /~~\ |__/

	 O N   L O A D     O N   L O A D
*/
		$(window).on('load', function() {

			resize_func();
			
		});

/*
	 __           __   ___  __    __  ___
	/  \ |\ |    |__) |__  /__` |  / |__
	\__/ | \|    |  \ |___ .__/ | /_ |___

	O N   R E S I Z E   O N   R E S I Z E
*/
	var resizeTimer;
		var prevWinW = $(window).width();
		$(window).on('resize', function(e) {

			$('.js_error').text('');

			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				// Run code here, resizing has "stopped"
				winW = $(window).width();
				winH = $(window).height();

				//only if width changed
				if(prevWinW != winW) {
					prevWinW = winW;
					resize_func();
				}
			}, 250, function(){ clearTimeout(resizeTimer); });

		});

		if($('#viewport').length && window.location.hostname === 'localhost') {
			$('#viewport').html(winW+'px');
			$(window).on('resize', function(e) {
				winW = $(window).width();
				$('#viewport').html(winW+'px');
			});
		} else {
			$('#viewport').remove();
		}


		if($('.breadcrumb-item.active').length){
			let str = $('.breadcrumb-item.active span[itemprop="name"]').html();
			if(str.indexOf("~") != -1){
				str = str.substr(0, str.indexOf("~"));
				$('.breadcrumb-item.active span[itemprop="name"]').html(str)
			}
		}
		if($('h1.productView-title').length){
			let str = $('h1.productView-title').html();
			if(str.indexOf("~") != -1){
				str = str.substr(0, str.indexOf("~"));
				$('h1.productView-title').html(str);
			}
		}
		if($('.card-body .card-title').length){
			$('.card-body .card-title').each(function(){
				let str = $(this).find('span').html();
				if(str.indexOf("~") != -1){
					str = str.substr(0, str.indexOf("~"));
					$(this).find('span').html(str);
				}
			});
		}
		
		if(localStorage.getItem("col-per-row")){
			$('#c_rows').val(localStorage.getItem("col-per-row"))
			if( 'more' == localStorage.getItem("col-per-row")){
				$('.productGrid').addClass('more').removeClass('less');
			}else{
				$('.productGrid').addClass('less').removeClass('more');
			}
		}
		
		$(document).on('change','#c_rows', function(){
			localStorage.setItem("col-per-row", $(this).val());
			if( 'more' == $(this).val()){
				$('.productGrid').addClass('more').removeClass('less');
			}else{
				$('.productGrid').addClass('less').removeClass('more');
			}
		});

		$(document).on('click', '.accordion-title', function(){

			$(this).find('i').toggleClass('fa-minus').toggleClass('fa-plus');
			$('.accordion-content').hide();

			if($(this).closest('.accordion-block').find('.accordion-content').hasClass('is-open')){
				$(this).closest('.accordion-block').find('.accordion-content').removeClass('is-open');
			}
			else{
				$(this).closest('.accordion-block').find('.accordion-content').addClass('is-open');
			}
			

		});
		setTimeout(() => {
			$('.card-swatches').matchHeight();
			$('.card-brand').matchHeight();
			// $('.card-title').matchHeight();
			
		  }, 2800);	
		// $("#acc-category .accordion-block").prependTo($("#facet-accordion--navList"));

		// REMOVES BRAND NAME FROM PLP AND PDP IF IN JSON FILE - BEGIN
		if (this.context.pageType != "category") {
			undoNonCategoryPage();
			undoCarousels();
		}
		if ((this.context.pageType === "category") || (this.context.pageType === "product")) {
			const page_type = this.context.pageType;
			if (sessionStorage.getItem("exclude_brands") != null) {
				// Get Session Variable
				const exclude_brands = JSON.parse(sessionStorage.getItem("exclude_brands"));
				if (this.context.pageType === "category") {
					PLP_exclude_brands(exclude_brands);
				} else if (this.context.pageType === "product") {
					PDP_exclude_brands(exclude_brands);
				}
			} else {
				const filePath = this.context.baseURL + "/content/exclude_brands/exclude_brands.json";
				axios.get(filePath)
					.then(function (response) {
						if (response.data.exclude_brands) {
							const exclude_brands = response.data.exclude_brands;
							// Set Session Variable
							sessionStorage['exclude_brands'] = JSON.stringify(exclude_brands);
							if (page_type === "category") {
								PLP_exclude_brands(exclude_brands);
							} else if (page_type === "product") {
								PDP_exclude_brands(exclude_brands);
							}
						}
					});
			}
		}

		function PLP_exclude_brands(exclude_brands) {
			const cardBrands = document.querySelectorAll(".productGrid .product .card-brand");
			cardBrands.forEach((cardBrandValue) => {
				const fBrandInArray = (element) => element.toLowerCase() === cardBrandValue.innerText.toLowerCase();
				const cardBrandIndex = exclude_brands.findIndex(fBrandInArray);
				if (cardBrandIndex >= 0) {
					cardBrandValue.style.setProperty("visibility", "hidden");
				} else {
					cardBrandValue.style.setProperty("visibility", "visible");
				}
			});

			undoCarousels();
			paginationFix();
		}

		function paginationFix() {
			const targetNode = document.getElementById('product-listing-container');
			const config = { attributes: true, childList: true, subtree: true };
			let ranOnce = false;
			const callback = function (mutationsList, observer) {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						if (!ranOnce) {
							if (sessionStorage.getItem("exclude_brands") != null) {
								// Get Session Variable
								const exclude_brands = JSON.parse(sessionStorage.getItem("exclude_brands"));
								PLP_exclude_brands(exclude_brands);
							} else {
								const filePath = this.context.baseURL + "/content/exclude_brands/exclude_brands.json";
								axios.get(filePath)
									.then(function (response) {
										if (response.data.exclude_brands) {
											const exclude_brands = response.data.exclude_brands;
											// Set Session Variable
											sessionStorage['exclude_brands'] = JSON.stringify(exclude_brands);
											PLP_exclude_brands(exclude_brands);
										}
									});
							}
							ranOnce = true;
						}
					}
					/* else if (mutation.type === 'attributes') {} */

				}
			};
			const observer = new MutationObserver(callback);
			observer.observe(targetNode, config);
		}

		function PDP_exclude_brands(exclude_brands) {
			const pdpBrand = document.querySelector(".productView-product .brand a.brand");
			const fBrandInArray = (element) => element.toLowerCase() === pdpBrand.innerText.toLowerCase();
			const pdpBrandIndex = exclude_brands.findIndex(fBrandInArray);
			if (pdpBrandIndex >= 0) {
				pdpBrand.parentElement.style.setProperty("visibility", "hidden");
			} else {
				pdpBrand.parentElement.style.setProperty("visibility", "visible");
			}
		}

		function undoNonCategoryPage() {
			const cardBrands = document.querySelectorAll(".productGrid .product .card-brand");
			cardBrands.forEach((cardBrandValue) => {
				cardBrandValue.style.setProperty("visibility", "visible");
			});
		}

		function undoCarousels() {
			setTimeout(() => {
				const cardsCarousel = document.querySelectorAll(".carousel-section .card-brand");
				cardsCarousel.forEach((cardValue) => {
					cardValue.style.setProperty("visibility", "visible");
				});
			}, 2500);
		}
		// REMOVES BRAND NAME FROM PLP AND PDP IF IN JSON FILE - END
	}

	
	onXlDown(media){
		if (media.matches) {		  

		  	$("#mobile-nav").html($("#global-nav").html())
			$('#mobile-nav ul.level-0 li').each(function(){ 
				let $li =$(this);
				$(this).find('ul.level-1').each(function(){
					$(this).appendTo($li);
				})
			})
			$('#mobile-nav ul.level-0 li ').each(function(){
				$(this).find('.level-1').wrapAll("<div class='float-to-right'>");
			})
			$('#mobile-nav .level-1 ul.level-2').addClass("float-to-right").removeClass('d-none');
			let moreHtml = `<span class="more"><i class="fal fa-angle-right" aria-hidden="true"></i></span>`;
			$('#mobile-nav .level-1 > li.has-sub-menu a').append(moreHtml);

		}
	}

	onXlUp(media){
		if (media.matches) {
		  $("#mobile-nav > div").empty()
		}
	}
	
	 
}
