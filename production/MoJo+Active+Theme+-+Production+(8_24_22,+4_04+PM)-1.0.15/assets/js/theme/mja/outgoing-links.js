export default async function outgoingLinks() {
  const isExternal = (url) => {
    // helper function to determine whether not a link is external to the domain
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (match != null && typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return true;
    if (
      match != null &&
      typeof match[2] === "string" &&
      match[2].length > 0 &&
      match[2].replace(new RegExp(":(" + { "http:": 80, "https:": 443 }[location.protocol] + ")?$"), "") !== location.host
    ) {
      return true;
    } else {
      return false;
    }
  };

  // if a page builder link is external
  // remove onclick="handleClick()" and attach a click event to open in new tab
  setTimeout(() => {
    $(document)
      .find('[onclick*="handleClick"]')
      .each((i, e) => {
        const href = $(e).attr("onclick").replace("handleClick('", "").replace("')", "");
        if (isExternal(href)) {
          $(e).removeAttr("onclick");
          $(e).on("click", () => {
            window.open(href);
          });
        }
      });
  }, 250);
}
