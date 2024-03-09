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
class Pos2 {
}
class JsonItem {
}
function GetWorldPosArray(node) {
    var pos = new Pos2();
    pos.x = node.worldPosition.x;
    pos.y = node.worldPosition.y;
    var outpos = [];
    //test multi pos
    node.children.forEach((child) => {
        if (child.name.indexOf("Node") == 0) {
            var cpos = new Pos2();
            cpos.x = child.worldPosition.x;
            cpos.y = child.worldPosition.y;
            outpos.push(cpos);
        }
    });
    if (outpos.length == 0) {
        outpos.push(pos);
    }
    return outpos;
}
//Export,need comp MapTag,orelse block=false;
//need child with name "Node" for multi pos
function Func_Export() {
    var pick = GetPickedNode();
    if (pick == null) {
        console.warn("[ExportInfo]Should pick export node first.");
        return;
    }
    var outjson = [];
    console.log("[ExportInfo]Pick=" + (pick === null || pick === void 0 ? void 0 : pick.name) + "  childcount=" + pick.children.length);
    for (var i = 0; i < pick.children.length; i++) {
        var node = pick.children[i];
        var ctag = node.getComponent("MapTag");
        var block = false;
        if (ctag != null) {
            block = ctag.block;
        }
        //export to json
        var item = new JsonItem();
        item.id = "decorate_" + (i + 1).toString();
        item.name = node.name;
        item.type = "decorate";
        item.show = true;
        item.block = block;
        item.posmode = "world";
        item.positions = GetWorldPosArray(node);
        outjson.push(item);
    }
    //save
    {
        var outpath = (0, path_1.join)(Editor.Project.path, "outinfo.json");
        console.warn("[ExportInfo]output path = " + outpath);
        fs.writeFileSync(outpath, JSON.stringify(outjson, null, 4));
    }
}
