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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProcessor = analyzeProcessor;
var fs_1 = require("fs");
var path_1 = require("path");
var child_process_1 = require("child_process");
var STORAGE = "/tmp/sandboox";
function analyzeProcessor(job) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, apkId, githubUrl, dir, apkPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = job.data, apkId = _a.apkId, githubUrl = _a.githubUrl;
                    console.log("Processing APK: ", apkId);
                    dir = path_1.default.join(STORAGE, apkId);
                    fs_1.default.mkdirSync(dir, {
                        recursive: true
                    });
                    apkPath = path_1.default.join(dir, "app.apk");
                    return [4 /*yield*/, download(githubUrl, apkPath)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, runJadx(apkPath, dir)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, runApktool(apkPath, dir)];
                case 3:
                    _b.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
function download(url, output) {
    return __awaiter(this, void 0, void 0, function () {
        var res, Readable, nodeStream, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Download failed: ".concat(res.status));
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("stream"); })];
                case 2:
                    Readable = (_a.sent()).Readable;
                    nodeStream = Readable.fromWeb(res.body);
                    file = fs_1.default.createWriteStream(output);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            nodeStream.pipe(file);
                            file.on("finish", resolve);
                            nodeStream.on("error", reject);
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runJadx(apk, dir) {
    return new Promise(function (resolve, reject) {
        var proc = (0, child_process_1.spawn)("jadx", [
            "-d",
            "".concat(dir, "/jadx"),
            apk
        ]);
        proc.on("close", resolve);
        proc.on("error", reject);
    });
}
function runApktool(apk, dir) {
    return new Promise(function (resolve, reject) {
        var proc = (0, child_process_1.spawn)("apktool", [
            "d",
            apk,
            "-o",
            "".concat(dir, "/apktool")
        ]);
        proc.on("close", resolve);
        proc.on("error", reject);
    });
}
