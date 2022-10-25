import { debounce } from "lodash";
import utils from "@bigcommerce/stencil-utils";
import StencilDropDown from "./stencil-dropdown";

export default function () {
  const TOP_STYLING = "top: 49px;";
  const $quickSearchResults = $(".quickSearchResults");
  const $quickSearchDiv = $("#quickSearch");
  const stencilDropDownExtendables = {};
  const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);

  $('[data-search="quickSearch"]').each((i, elm) => {
    stencilDropDown.bind(elm, $(elm).closest("form").find("#quickSearch"), TOP_STYLING);
  });

  $("body").on("click", (e) => {
    if ($(e.target).closest("form").length == 0) {
      $(".dropdown.dropdown--quickSearch.is-open").removeClass("is-open");
    }
  });

  // stagger searching for 200ms after last input
  const doSearch = debounce((searchQuery, elm) => {
    utils.api.search.search(searchQuery, { template: "search/quick-results" }, (err, response) => {
      if (err) {
        return false;
      }
      $(elm).closest("form").find(".quickSearchResults").addClass("is-open");
      $(elm).closest("form").find(".quickSearchResults").html(response);
      mc.addWebpageImagesToSearchResults(searchQuery);
    });
  }, 400);

  utils.hooks.on("search-quick", (event) => {
    const searchQuery = $(event.currentTarget).val();

    // server will only perform search with at least 3 characters
    if (searchQuery.length < 3) {
      return;
    }

    doSearch(searchQuery, $(event.currentTarget));
  });

  // Catch the submission of the quick-search
  //   $quickSearchDiv.on("submit", (event) => {
  //     const searchQuery = $(event.currentTarget).find("input").val();

  //     if (searchQuery.length === 0) {
  //       return event.preventDefault();
  //     }

  //     return true;
  //   });

  $(document).keyup((e) => {
    if ($(".dropdown.dropdown--quickSearch").hasClass("is-open") && e.keyCode === 27) {
      $(".dropdown.dropdown--quickSearch.is-open").hide();
      $(".navUser-action.navUser-action--quickSearch").focus();
    }
  });
}
