"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getAbsoluteURLComponents = exports.getTagDisplayName = exports.getPostsWithTag = exports.getTags = exports.parseMetadata = exports.getPost = exports.getPosts = exports.getAllPosts = exports.loadPost = exports.PostMetadataSchema = void 0;
var directory_tree_1 = __importDefault(require("directory-tree"));
var gray_matter_1 = __importDefault(require("gray-matter"));
var fs_1 = __importDefault(require("fs"));
var z = __importStar(require("zod"));
var path_1 = __importDefault(require("path"));
exports.PostMetadataSchema = z
    .object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean(),
    author: z.string(),
    tags: z.string().array(),
    filePath: z.string()
})
    .nonstrict();
var filesInPostDirectory = function () {
    var _a;
    var POST_DIRECTORY = "./content/posts";
    var postFiles = [];
    var postDirectories = (_a = directory_tree_1["default"](POST_DIRECTORY)) === null || _a === void 0 ? void 0 : _a.children;
    if (!postDirectories)
        throw new Error("Post directory \"" + POST_DIRECTORY + "\" not found!");
    if (!postDirectories.length)
        throw new Error("No blog posts found in \"" + POST_DIRECTORY + "\"!");
    directory_tree_1["default"](POST_DIRECTORY, { extensions: /\.md$/ }, function (item, path, stats) {
        postFiles.push({ filename: path, mtime: stats.mtimeMs });
    });
    return postFiles;
};
var loadPost = function (fileSpec) { return __awaiter(void 0, void 0, void 0, function () {
    var fileContents, fileMtimeMS, _a, data, content;
    return __generator(this, function (_b) {
        fileContents = fs_1["default"].readFileSync(fileSpec, "utf8");
        fileMtimeMS = fs_1["default"].statSync(fileSpec).mtimeMs;
        _a = gray_matter_1["default"](fileContents), data = _a.data, content = _a.content;
        return [2 /*return*/, {
                filePath: fileSpec,
                content: content,
                metadataJSON: JSON.stringify(__assign(__assign({}, data), { filePath: fileSpec })),
                mtime: fileMtimeMS
            }];
    });
}); };
exports.loadPost = loadPost;
var loadCache = function (filename) {
    return JSON.parse(fs_1["default"].readFileSync(filename, "utf-8"));
};
var writePostsToCache = function (filename, posts) {
    return fs_1["default"].writeFileSync(filename, JSON.stringify(posts));
};
var readPostsFromFiles = function (filenames) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(filenames.map(function (x) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exports.loadPost(x)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); }))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var refreshCache = function (files, cacheFilename) { return __awaiter(void 0, void 0, void 0, function () {
    var posts, cacheDirty, cache, _loop_1, _i, files_1, f;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                posts = [];
                cacheDirty = false;
                cache = loadCache(cacheFilename);
                _loop_1 = function (f) {
                    var cachedPost, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                cachedPost = cache.find(function (e) { return e.filePath == f.filename; });
                                if (!(!cachedPost || cachedPost.mtime != f.mtime)) return [3 /*break*/, 2];
                                _c = (_b = posts).push;
                                return [4 /*yield*/, exports.loadPost(f.filename)];
                            case 1:
                                _c.apply(_b, [_d.sent()]);
                                cacheDirty = true;
                                return [3 /*break*/, 3];
                            case 2:
                                posts.push(cachedPost);
                                _d.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, files_1 = files;
                _a.label = 1;
            case 1:
                if (!(_i < files_1.length)) return [3 /*break*/, 4];
                f = files_1[_i];
                return [5 /*yield**/, _loop_1(f)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: 
            //if (cacheDirty) writePostsToCache(cacheFilename, cache);
            return [2 /*return*/, posts];
        }
    });
}); };
var getAllPosts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var cacheFilename, files, e_1, posts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cacheFilename = "pageCache.json";
                return [4 /*yield*/, filesInPostDirectory()];
            case 1:
                files = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                return [4 /*yield*/, refreshCache(files, cacheFilename)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                e_1 = _a.sent();
                return [4 /*yield*/, readPostsFromFiles(files.map(function (x) { return x.filename; }))];
            case 5:
                posts = _a.sent();
                writePostsToCache(cacheFilename, posts);
                return [2 /*return*/, posts];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getAllPosts = getAllPosts;
var getPosts = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(process.env.NODE_ENV == "development")) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.getAllPosts()];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [4 /*yield*/, exports.getAllPosts()];
            case 3: return [2 /*return*/, (_a.sent()).filter(function (p) { return !JSON.parse(p.metadataJSON).draft; })];
        }
    });
}); };
exports.getPosts = getPosts;
// For a given year, month and slug, return the first post found with
// the given slug. WARNING: This means that we require slugs to have
// unique titles.
var getPost = function (year, month, slug) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, exports.loadPost("./content/posts/" + slug + "/" + slug + ".md")];
    });
}); };
exports.getPost = getPost;
// This rather silly function exists because NextJS does not know how to
// serialize dates in JSON, so we have to explicitly do that job ourselves.
var parseMetadata = function (metadataJSON) {
    var metadataObject = JSON.parse(metadataJSON);
    return exports.PostMetadataSchema.parse(__assign(__assign({}, metadataObject), { date: new Date(metadataObject.date) }));
};
exports.parseMetadata = parseMetadata;
// Iterates over all posts and returns a list of all tags used.
var getTags = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tags, posts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tags = [];
                return [4 /*yield*/, exports.getPosts()];
            case 1:
                posts = _a.sent();
                posts.forEach(function (p) {
                    var postTags = JSON.parse(p.metadataJSON).tags;
                    postTags.forEach(function (tag) { return tags.includes(tag) || tags.push(tag); });
                });
                return [2 /*return*/, tags];
        }
    });
}); };
exports.getTags = getTags;
// Returns a list of posts with a given tag.
var getPostsWithTag = function (tagName) { return __awaiter(void 0, void 0, void 0, function () {
    var allPosts, postsWithTag;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getPosts()];
            case 1:
                allPosts = _a.sent();
                postsWithTag = [];
                allPosts.forEach(function (p) {
                    var postTags = JSON.parse(p.metadataJSON).tags;
                    if (postTags.includes(tagName))
                        postsWithTag.push(p);
                });
                return [2 /*return*/, postsWithTag];
        }
    });
}); };
exports.getPostsWithTag = getPostsWithTag;
// This rather silly function is here to preserve URI compatibility with
// v1 of this blog, which exported URIs for tags in lower-case, while the
// tags themselves were case-sensitive. So this just exists so we can
// get the internally used, case-sensitive tag name, from the externally
// presented lower-cased used in URLs etc.
var getTagDisplayName = function (lowerCaseTagName) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, t;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0;
                return [4 /*yield*/, exports.getTags()];
            case 1:
                _a = _b.sent();
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                t = _a[_i];
                if (lowerCaseTagName == t.toLowerCase())
                    return [2 /*return*/, t];
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 2];
            case 4: throw new Error("No display name found for tag!");
        }
    });
}); };
exports.getTagDisplayName = getTagDisplayName;
// Convenience function to get the three components necessary to construct
// an absolute URL, given a post and its parsed metadata.
var getAbsoluteURLComponents = function (metadata) {
    var year = String(metadata.date.getFullYear());
    var month = String(metadata.date.getMonth() + 1).padStart(2, "0");
    var slug = path_1["default"].basename(metadata.filePath, ".md");
    return { year: year, month: month, slug: slug };
};
exports.getAbsoluteURLComponents = getAbsoluteURLComponents;
