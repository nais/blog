"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
console.log("hi");
var fs = require("fs");
var path = require("path");
var _a = require("../components/posts"), getAbsoluteURLComponents = _a.getAbsoluteURLComponents, getPosts = _a.getPosts, getTags = _a.getTags, parseMetadata = _a.parseMetadata;
var urlEntry = function (location, lastmod) {
    return "\n              <url>\n                <loc>" + location + "</loc>\n                <lastmod>" + lastmod.toISOString() + "</lastmod>\n                <changefreq>monthly</changefreq>\n                <priority>1.0</priority>\n              </url>\n            ";
};
var urlForPost = function (metadataJSON, baseUrl) {
    var m = parseMetadata(metadataJSON);
    var _a = getAbsoluteURLComponents(m), year = _a.year, month = _a.month, slug = _a.slug;
    var location = baseUrl + "/posts/" + year + "/" + month + "/" + slug;
    return urlEntry(location, m.date);
};
var makeSitemap = function () { return __awaiter(void 0, void 0, void 0, function () {
    var baseUrl, staticPages, posts, tags, sitemap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                baseUrl = "https://nais.io/blog-rewrite";
                staticPages = fs
                    .readdirSync("pages")
                    .filter(function (staticPage) {
                    return ![
                        ".DS_Store",
                        "_app.js",
                        "_document.js",
                        "_error.js",
                        "sitemap.xml.tsx",
                        "404.tsx",
                        "index.tsx",
                        "posts",
                    ].includes(staticPage);
                })
                    .map(function (staticPagePath) {
                    return baseUrl + "/" + path.parse(staticPagePath).name;
                });
                staticPages.push(baseUrl + "/");
                console.log(staticPages);
                return [4 /*yield*/, getPosts()];
            case 1:
                posts = _a.sent();
                return [4 /*yield*/, getTags()];
            case 2:
                tags = _a.sent();
                sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n  <?xml-stylesheet type=\"text/xsl\" href=\"" + baseUrl + "/sitemap.xsl\"?>\n\n    <urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n      " + staticPages.map(function (url) { return urlEntry(url, new Date()); }).join("") + "\n      " + posts
                    .map(function (_a) {
                    var metadataJSON = _a.metadataJSON;
                    return urlForPost(metadataJSON, baseUrl);
                })
                    .join("") + "\n      " + tags
                    .map(function (tag) {
                    return urlEntry(baseUrl + "/tags/" + tag.toLowerCase(), new Date());
                })
                    .join("") + "\n    </urlset>\n  ";
                // GitHub pages wants to strip file extensions from requests, so
                // we add extra XML so clients can reach it at "/sitemap.xml".
                fs.writeFileSync("docs/sitemap.xml.xml", sitemap);
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var text, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, makeSitemap()];
            case 1:
                text = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
