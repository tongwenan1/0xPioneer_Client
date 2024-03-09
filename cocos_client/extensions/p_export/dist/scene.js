"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
const path_1 = require("path");
const fs = __importStar(require("fs"));
//change path for import cc
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const cc = __importStar(require("cc"));
function load() {
}
exports.load = load;
;
function unload() {
}
exports.unload = unload;
;
exports.methods = {
    "func_export": Func_Export
};
//find a node by uuid
function GetNode(uuid, parent = null) {
    if (parent == null)
        parent = cc.director.getScene();
    var r = parent.getChildByUuid(uuid);
    if (r != null)
        return r;
    for (var i = 0; i < parent.children.length; i++) {
        var r = GetNode(uuid, parent.children[i]);
        if (r != null)
            return r;
    }
    return null;
}
//get picked node
function GetPickedNode() {
    const type = Editor.Selection.getLastSelectedType();
    if (type != "node") {
        console.warn("pick type is node a node:" + type);
        return null;
    }
    else {
        var uuid = Editor.Selection.getLastSelected(type);
        return GetNode(uuid, null);
    }
}
function Func_Export() {
    var child = GetPickedNode();
    console.log("child=" + (child === null || child === void 0 ? void 0 : child.name));
    var outjson = {};
    for (var i = 0; i < child.components.length; i++) {
        var c = child.components[i];
        console.log("child comp =" + c.name);
        var out = {};
        if (c.name.indexOf("<testcomp>") >= 0) {
            var tag = c.tag;
            console.log("tag=" + tag);
            out["tag"] = tag;
        }
        outjson[c.name] = out;
    }
    //save
    console.warn("proj path = " + Editor.Project.path);
    var path = (0, path_1.join)(Editor.Project.path, "outinfo.json");
    fs.writeFileSync(path, JSON.stringify(outjson, null, 4));
}
