
import  { join } from 'path';
import * as fs from "fs";

//change path for import cc
module.paths.push(join(Editor.App.path, 'node_modules'));


import * as cc from "cc"



export function load() {


};
export function unload() {

};


export const methods: { [key: string]: (...any: any) => any } = {

    "func_export": Func_Export
};

//find a node by uuid
function GetNode(uuid: string, parent: cc.Node = null): cc.Node {
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
function GetPickedNode(): cc.Node {
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

    console.log("child=" + child?.name);

    var outjson: { [id: string]: any } = {};
    for (var i = 0; i < child.components.length; i++) {
        var c = child.components[i];
        console.log("child comp =" + c.name);
        var out:any ={};
        if (c.name.indexOf("<testcomp>") >= 0) {
            var tag: number = (c as any).tag;
            console.log("tag=" + tag);
            out["tag"]=tag;
        }
        
        outjson[c.name] =out;
    }

    //save
    console.warn("proj path = " + Editor.Project.path);

   
    var path = join(Editor.Project.path,"outinfo.json");
    fs.writeFileSync(path, JSON.stringify(outjson, null, 4));

}