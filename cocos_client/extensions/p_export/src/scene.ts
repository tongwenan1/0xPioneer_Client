
import { join } from 'path';
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
class Pos2 {
    x: number;
    y: number;
}

class JsonItem {
    id: string;
    name: string;
    type: string;
    show: boolean;
    block: boolean;
    posmode: string;
    positions: Pos2[];

}
function GetWorldPosArray(node: cc.Node): Pos2[] {
    var pos = new Pos2();
    pos.x = node.worldPosition.x;
    pos.y = node.worldPosition.y;
    var outpos: Pos2[] = [];
    //test multi pos
    node.children.forEach((child: cc.Node) => {
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


    var outjson: JsonItem[] = [];
    console.log("[ExportInfo]Pick=" + pick?.name + "  childcount=" + pick.children.length);
    for (var i = 0; i < pick.children.length; i++) {

        var node = pick.children[i];


        var ctag = node.getComponent("MapTag");
        var block: boolean = false;
        if (ctag != null) {
            block = (ctag as any).block;
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
        var outpath = join(Editor.Project.path, "outinfo.json");
        console.warn("[ExportInfo]output path = " + outpath);

        fs.writeFileSync(outpath, JSON.stringify(outjson, null, 4));
    }
}