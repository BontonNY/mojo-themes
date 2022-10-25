import utils from "@bigcommerce/stencil-utils";
import "owl.carousel";
import owlCarousel from "../global/owlCarousel";

export default function () {
  const getJSON = (query, template) => {
    return new Promise(function (resolve, reject) {
      utils.api.search.search(query, { template: "search/json" }, function (err, response) {
        if (err) return reject(err);
        resolve(JSON.parse(response));
      });
    });
  };

  const getPage = (url) => {
    return new Promise(function (resolve, reject) {
      utils.api.getPage(url, { template: "search/json" }, function (err, response) {
        if (err) return reject(err);
        resolve(JSON.parse(response).page);
      });
    });
  };

  const addWebpageImagesToSearchResults = (searchQuery) => {
    getJSON(searchQuery).then((json) => {
      let pageUrls = json.content_results.map((o) => o.url);
      let promises = pageUrls.map((o) => getPage(o));
      Promise.all(promises).then((pages) => {
        pages.forEach((page, i) => {
          let elm = $(`.searchList-item[data-url="${pageUrls[i]}"]`);
          let image = $(page.content).find("img");
          image.addClass("img-fluid mx-auto");
          elm.find("figure").html(image);
        });
      });
    });
  };

  const initializeCarousels = () => {
    owlCarousel();
  };

  window.mc = window.mc || {};
  window.mc = $.extend({}, window.mc, {
    getJSON,
    getPage,
    addWebpageImagesToSearchResults,
    initializeCarousels
  });
}
