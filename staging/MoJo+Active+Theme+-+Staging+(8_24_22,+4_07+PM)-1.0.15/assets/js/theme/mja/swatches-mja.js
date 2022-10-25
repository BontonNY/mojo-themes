"use strict";

function t(t) {
    return t && "object" == typeof t && "default" in t ? t.default : t
}
var e = t(require("jquery")),
    n = t(require("js-cookie")),
    a = t(require("lodash")),
    r = t(require("mustache")),
    i = t(require("axios")),
    o = t(require("nanoevents")),
    s = new function() {
        this.ImageExpression = function() {
            return /^(.+) - .+/gim
        }, this.ImageColorTransform = function(t) {
            return t
        }, this.AltImageExpression = function() {
            return /\ Alt$/gim
        }, this.CookieName = "mja.swatches.active", this.ImageSize = "640", this.HiddenCustomFieldKey = "swatches:hidden", this.HiddenCustomFieldValue = "name", this.SwatchLimit = 12, this.ImageRequestLimit = 12, this.CustomFieldsRequestLimit = 15, this.ProductOptionsRequestLimit = 15, this.CorrectProductImages = !0, this.SwatchPreselect = !0, this.SwatchPreselectTimeout = 500, this.CustomImageRenderer = null
    };

function c(t, e) {
    var n, a, r, i, o = {
        label: 0,
        sent: function() {
            if (1 & r[0]) throw r[1];
            return r[1]
        },
        trys: [],
        ops: []
    };
    return i = {
        next: s(0),
        throw: s(1),
        return: s(2)
    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
        return this
    }), i;

    function s(i) {
        return function(s) {
            return function(i) {
                if (n) throw new TypeError("Generator is already executing.");
                for (; o;) try {
                    if (n = 1, a && (r = 2 & i[0] ? a.return : i[0] ? a.throw || ((r = a.return) && r.call(a), 0) : a.next) && !(r = r.call(a, i[1])).done) return r;
                    switch (a = 0, r && (i = [2 & i[0], r.value]), i[0]) {
                        case 0:
                        case 1:
                            r = i;
                            break;
                        case 4:
                            return o.label++, {
                                value: i[1],
                                done: !1
                            };
                        case 5:
                            o.label++, a = i[1], i = [0];
                            continue;
                        case 7:
                            i = o.ops.pop(), o.trys.pop();
                            continue;
                        default:
                            if (!(r = o.trys, (r = r.length > 0 && r[r.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                o = 0;
                                continue
                            }
                            if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
                                o.label = i[1];
                                break
                            }
                            if (6 === i[0] && o.label < r[1]) {
                                o.label = r[1], r = i;
                                break
                            }
                            if (r && o.label < r[2]) {
                                o.label = r[2], o.ops.push(i);
                                break
                            }
                            r[2] && o.ops.pop(), o.trys.pop();
                            continue
                    }
                    i = e.call(t, o)
                } catch (t) {
                    i = [6, t], a = 0
                } finally {
                    n = r = 0
                }
                if (5 & i[0]) throw i[1];
                return {
                    value: i[0] ? i[1] : void 0,
                    done: !0
                }
            }([i, s])
        }
    }
}

function u(t) {
    var e = t.alt,
        n = t.url,
        a = t.thumbnail;
    if (s.ImageExpression().test(e)) {
        var r = s.ImageExpression().exec(e)[1];
        if (r = s.ImageColorTransform(r)) return {
            alt: e,
            url: n,
            color: r,
            hover: s.AltImageExpression().test(e),
            thumbnail: a
        }
    }
    return {
        alt: e,
        url: n,
        color: e,
        hover: !1,
        thumbnail: a
    }
}
var d = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        return window.mja && window.mja.debug ? console.log(t) : function() {}
    },
    l = function(t) {
        return t.edges.map((function(t) {
            var e = t.node;
            return {
                url: e.url,
                alt: e.altText,
                thumbnail: e.isDefault
            }
        }))
    },
    h = function(t) {
        return void 0 === t && (t = []), "\n    query($ids: [Int!] = [" + t.join(",") + "]) {\n        site {\n        products(entityIds: $ids, first: " + t.length + ") {\n            edges {\n            node {\n                entityId\n                customFields(first: " + s.CustomFieldsRequestLimit + ") {\n                edges {\n                    node {\n                    name\n                    value\n                    }\n                }\n                }\n            }\n            }\n        }\n        }\n    }\n"
    },
    p = function(t, e) {
        return void 0 === t && (t = []), void 0 === e && (e = 768), "\nquery($ids: [Int!] = [" + t.join(",") + "]) {\n    site {\n      products(entityIds: $ids, first: " + t.length + ") {\n        edges {\n          node {\n            entityId\n            images(first: " + s.ImageRequestLimit + ") {\n              edges {\n                node {\n                  url(width: " + e + ")\n                  altText,\n                  isDefault\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
    },
    f = function() {
        function t(t) {
            this.client = null, this.client = i.create({
                headers: {
                    Authorization: "Bearer " + t
                }
            })
        }
        return t.prototype.request = function(t) {
            return this.client.post("/graphql", {
                query: t
            })
        }, t.prototype.generateHiddenValues = function(t) {
            var e = t.filter((function(t) {
                    return t.name === s.HiddenCustomFieldKey
                })),
                n = [];
            return e.forEach((function(t) {
                var e = t.value.split(",").map((function(t) {
                    return t.trim().toUpperCase()
                }));
                n.push.apply(n, e)
            })), n
        }, t.prototype.generateImages = function(t) {
            var e = t.edges.map((function(t) {
                var e = t.node,
                    n = e.altText;
                return {
                    url: e.url,
                    alt: n,
                    thumbnail: e.isDefault
                }
            })).filter((function(t) {
                return t.alt && t.url
            }));
            if (e) {
                var n = {};
                return e.map(u).forEach((function(t) {
                    var e = t.color,
                        a = t.hover,
                        r = t.url,
                        i = t.thumbnail;
                    e = e.toUpperCase(), n[e] || (n[e] = {}), n[e][a ? "hover" : "normal"] = r.replace("{:size}", s.ImageSize), i && (n[e].thumbnail = i)
                })), n
            }
            return {}
        }, t.prototype.generateSwatches = function(t, e) {
            var n = t.edges.filter((function(t) {
                return "Swatch" === t.node.displayStyle && t.node.values && t.node.values.edges && t.node.values.edges.length
            })).map((function(t) {
                var e = t.node.values.edges.map((function(t) {
                    var e = [];
                    if (t.node.imageUrl) {
                        var n = "background-image: url(" + t.node.imageUrl + ")";
                        e.push({
                            type: "pattern",
                            style: n
                        })
                    }
                    return t.node.hexColors && t.node.hexColors.length && t.node.hexColors.forEach((function(t) {
                        var n = "background-color: " + t;
                        // var n = "background-color: white";
                        e.push({
                            type: "color",
                            style: n
                        })
                    })), {
                        id: t.node.entityId,
                        label: t.node.label,
                        searchLabel: t.node.label.toUpperCase(),
                        styles: e
                    }
                }));
                return {
                    id: t.node.entityId,
                    values: e
                }
            }));
            if (n[0] && n[0].id && n[0].values) {
                var a = n[0];
                return {
                    product_id: e,
                    id: a.id,
                    values: a.values
                }
            }
            return null
        }, t.prototype.combineResponses = function(t, e, n) {
            return e.site.products.edges.forEach((function(e) {
                var n = e.node,
                    a = t.site.products.edges.filter((function(t) {
                        return t.node.entityId === n.entityId
                    }))[0];
                if (a) {
                    var r = n.customFields.edges.map((function(t) {
                        var e = t.node;
                        return {
                            name: e.name,
                            value: e.value
                        }
                    }));
                    a.node.customFields = r
                }
            })), n.site.products.edges.forEach((function(e) {
                var n = e.node,
                    a = t.site.products.edges.filter((function(t) {
                        return t.node.entityId === n.entityId
                    }))[0];
                a && (a.node.images = n.images)
            })), t
        }, t.prototype.transformData = function(t) {
            var e = this;
            return t.site.products.edges.map((function(t) {
                var n = t.node,
                    a = n.entityId,
                    r = e.generateHiddenValues(n.customFields),
                    i = e.generateImages(n.images),
                    o = e.generateSwatches(n.productOptions, a);
                return o && o.values && r && (d("Swatches:", "Blacklist:", r.join(", ")), o.values = o.values.filter((function(t) {
                    return !r.includes("id" === s.HiddenCustomFieldValue ? "" + t.id : t.label.toUpperCase())
                }))), {
                    images: i,
                    swatch: o,
                    meta: {
                        images: l(n.images)
                    }
                }
            })).filter((function(t) {
                return t && t.swatch
            }))
        }, t.prototype.fetch = function(t, e) {
            return void 0 === e && (e = 768), n = this, a = void 0, i = function() {
                var n, a, r, i;
                return c(this, (function(o) {
                    switch (o.label) {
                        case 0:
                            return o.trys.push([0, 2, , 3]), t = t.slice(0, 50), [4, Promise.all([this.request((c = t, void 0 === c && (c = []), void 0 === u && (u = 768), "\nquery($ids: [Int!] = [" + c.join(",") + "]) {\n    site {\n      products(entityIds: $ids, first: " + c.length + ") {\n        edges {\n          node {\n            entityId\n            productOptions(first: " + s.ProductOptionsRequestLimit + ") {\n              edges {\n                node {\n                  entityId\n                  ... on MultipleChoiceOption {\n                    displayStyle\n                    entityId\n                    displayName\n                    values {\n                      edges {\n                        node {\n                          entityId\n                          label\n                          ... on SwatchOptionValue {\n                            hexColors\n                            imageUrl(width: " + u + ")\n                          }\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n")), this.request(h(t)), this.request(p(t, e))])];
                        case 1:
                            return n = o.sent(), a = n[0], r = n[1], i = n[2], [2, this.transformData(this.combineResponses(a.data.data, r.data.data, i.data.data))];
                        case 2:
                            throw o.sent(), new Error("The GraphQL request to the storefront failed. Please contact BigCommerce support and ask about the status of their GraphQL endpoint.");
                        case 3:
                            return [2]
                    }
                    var c, u
                }))
            }, new((r = void 0) || (r = Promise))((function(t, e) {
                function o(t) {
                    try {
                        c(i.next(t))
                    } catch (t) {
                        e(t)
                    }
                }

                function s(t) {
                    try {
                        c(i.throw(t))
                    } catch (t) {
                        e(t)
                    }
                }

                function c(e) {
                    e.done ? t(e.value) : new r((function(t) {
                        t(e.value)
                    })).then(o, s)
                }
                c((i = i.apply(n, a || [])).next())
            }));
            var n, a, r, i
        }, t
    }(),
    m = new o;

function g(t, e) {
    m.emit(t, e)
}
var v = new(function() {
    function t() {
        this.map = {}, this.repo = null
    }
    return t.prototype.preselectSwatch = function() {
        var t = this;
        this.selectedSwatch && s.SwatchPreselect && setTimeout((function() {
            e('[data-product-attribute-value="' + t.selectedSwatch + '"]').click(), t.selectedSwatch = null
        }), s.SwatchPreselectTimeout)
    }, t.prototype.init = function(t, n) {
        var r = this;
        d("Swatches: Initializing.."), this.repo = new f(t), this.map = {}, n.watch ? setInterval((function() {
            r.checkPendingSwatches()
        }), n.timeout) : e(window).on("DOMContentLoaded load ready resize scroll readystatechange", a.debounce((function() {
            r.checkPendingSwatches()
        }), 500, {
            leading: !0,
            trailing: !0
        })), "loading" !== document.readyState && this.checkPendingSwatches(), this.preselectSwatch()
    }, Object.defineProperty(t.prototype, "selectedSwatch", {
        get: function() {
            return n.get(s.CookieName)
        },
        set: function(t) {
            n.set(s.CookieName, t)
        },
        enumerable: !1,
        configurable: !0
    }), t.prototype.renderSwatch = function(t, e) {
        var n = t.values.length > 5,
            a = t.values.length;
        n && (t.values = t.values.slice(0, s.SwatchLimit));
        var r = e.find('[data-event-type="product-click"][href]').attr("href");
        t.href = r;
        var i = this.compileSwatchTemplate(t);
        d("Swatches: Adding template with swatch", t), e.find(".card-swatches").html(i), this.bootstrapSwatch(e), n && this.showMoreSwatches(e), e.attr("data-swatches", "loaded"), e.attr("data-swatch-id", t.id), e.attr("data-swatch-count", a), g("swatch:loaded", {
            $product: e,
            swatch: t,
            images: this.map[t.product_id]
        })
    }, t.prototype.compileSwatchTemplate = function(t) {
        return r.render('\n\t\t<div class="form" data-cart-item-add>\n\t\t\t<div class="form-field" data-product-attribute="swatch">\n\t\t\t\t<label class="form-label form-label--alternate form-label--inlineSmall">\n\t\t\t\t\tColor:\n\t\t\t\t\t<span data-option-value></span>\n\t\t\t\t\t<small>Required</small>\n\t\t\t\t</label>\n\n\t\t\t\t{{#values}}\n\t\t\t\t<input aria-label="{{label}}" class="form-radio" type="radio" name="attribute[{{id}}]" required data-input-value="{{id}}" data-value="{{id}}">\n\t\t\t\t<label class="form-option" for="attribute[{{id}}]" data-product-swatch-name="{{label}}" data-product-attribute-value="{{id}}">\n\t\t\t\t\t{{#styles}}\n\t\t\t\t\t\t<span class="form-option-variant form-option-variant--{{type}}" title="{{../label}}" style="{{style}}"></span>\n\t\t\t\t\t{{/styles}}\n\t\t\t\t</label>\n\t\t\t\t{{/values}}\n\n\t\t\t\t{{#href}}\n\t\t\t\t<a href="{{href}}" class="form-option swatch-show-product hidden" title="More Options Available"\n\t\t\t\t\tdata-index="9999" for="attribute" data-swatch-show-product>\n\t\t\t\t\t<span class="form-option-variant form-option-variant--color">+</span>\n\t\t\t\t</a>\n\t\t\t\t{{/href}}\n\t\t\t</div>\n\t\t</div>\n\t\t', t)
    }, t.prototype.showMoreSwatches = function(t) {
        d("Swatches:", "Showing more for", t.data("prod")), e(".card-swatches", t)
    }, t.prototype.bootstrapSwatch = function(t) {
        var n = this;
        e("[data-product-attribute-value]", t).click((function(t) {
            var a = e(t.target).parents("[data-prod]"),
                r = e(t.target, a).closest("[data-product-attribute-value]").data("product-attribute-value");
            d("Swatches: clicked on", r), e("[data-input-value]", a).prop("checked", !1), e('[data-input-value="' + r + '"]', a).first().get()[0].checked = !0, n.selectedSwatch = r, n.renderImages(a, r);
            var i = a.data("prod");
            g("swatch:clicked", {
                $product: a,
                swatch: n.map[i][r],
                swatchId: r
            })
        })), t.find(".card-swatches").removeClass("hide")
    }, t.prototype.defaultImageRenderer = function(t, e, n) {
        if (void 0 === e && (e = ""), void 0 === n && (n = ""), d("Swatches: Default rendering image", e, "with a hover of", n), e) {
            var a = t.find(".card-image-hover"),
                r = t.find(".card-image-normal");
            n ? a.css("background-image", "url(" + n + ")") : a.css("background-image", "none"), r.data("src", e).attr("src", e)
        }
    }, t.prototype.renderImages = function(t, e) {
        var n = t.data("prod"),
            a = this.map[n][e],
            r = a.normal,
            i = a.hover,
            o = a.name;
        s.CustomImageRenderer ? (d("Swatches: Using CUSTOM image rendering method."), s.CustomImageRenderer(t, {
            name: o,
            id: e
        }, this.map[n].meta.images)) : (d("Swatches: Using DEFAULT image rendering method."), this.defaultImageRenderer(t, r, i))
    }, t.prototype.checkPendingSwatches = function() {
        var t = this;
        d("Swatches: Checking for pending swatches..");
        var n = e('[data-prod][data-swatches="pending"]');
        if (n.length) {
            g("swatch:loading", {
                $product: n
            }), n.attr("data-swatches", "loading");
            var a = n.map((function(t, n) {
                return e(n).data("prod")
            })).get();
            this.repo.fetch(a).then((function(a) {
                a && a.forEach((function(n) {
                    var a = n.images,
                        r = n.swatch,
                        i = n.meta,
                        o = e('[data-prod="' + r.product_id + '"]');
                    o.length && (t.map[r.product_id] = {
                        meta: i
                    }, r.values.forEach((function(e) {
                        e.searchLabel in a ? t.map[r.product_id][e.id] = a[e.searchLabel] : Object.values(a).filter((function(t) {
                            return t.thumbnail
                        })).length ? t.map[r.product_id][e.id] = Object.values(a).filter((function(t) {
                            return t.thumbnail
                        }))[0] : Object.values(a).length > 0 ? t.map[r.product_id][e.id] = Object.values(a)[0] : t.map[r.product_id][e.id] = {}, t.map[r.product_id][e.id].name = e.searchLabel, t.map[r.product_id][e.id].label = e.label
                    })), r.values.length ? (s.CorrectProductImages && t.renderImages(o, r.values[0].id), t.renderSwatch(r, o)) : (d("Swatches: Swatch has no values, skipping."), g("swatch:failed", {
                        $product: o
                    }), o.attr("data-swatches", "failed")))
                })), g("swatches:ran"), n.not('[data-swatches="loaded"]').attr("data-swatches", "empty"), n.is('[data-swatches="empty"]') && g("swatch:empty", {
                    $product: n
                })
            })).catch((function(t) {
                if (g("swatch:failed", {
                        $product: n
                    }), n.attr("data-swatches", "failed"), t) throw t
            })), d("Swatches: Grabbing swatches for " + a.join(", "))
        }
    }, t
}());
var w = {
    config: s,
    init: function(t, e) {
        void 0 === e && (e = {
            watch: !1,
            timeout: 800
        }), v.init(t, e)
    },
    check: function() {
        v.checkPendingSwatches()
    },
    on: function(t, e) {
        m.on(t, e)
    }
};
//module.exports = w;
export default w;
//# sourceMappingURL=swatches.js.map
