import { Vec2 } from "cc";
import { MapDecoratePosMode } from "../../../Const/Model/MapDecorateModelDefine";



export default class MapDecorateModel {

    public get id(): string {
        return this._id;
    }
    public get name(): string {
        return this._name;
    }
    public get show(): boolean {
        return this._show;
    }
    public get block(): boolean {
        return this._block;
    }
    public get posMode(): MapDecoratePosMode {
        return this._posMode;
    }
    public get stayMapPositions(): Vec2[] {
        return this._stayMapPositions;
    }
    
    public set id(value: string) {
        this._id = value;
    }
    public set name(value: string) {
        this._name = value;
    }
    public set show(value: boolean) {
        this._show = value;
    }
    public set block(value: boolean) {
        this._block = value;
    }
    public set posMode(value: MapDecoratePosMode) {
        this._posMode = value;
    }
    public set stayMapPositions(value: Vec2[]) {
        this._stayMapPositions = value;
    }


    public constructor(id: string, name: string, show: boolean, block: boolean, posMode: MapDecoratePosMode, stayMapPositions: Vec2[]) {
        this._id = id;
        this._name = name;
        this._show = show;
        this._block = block;
        this._posMode = posMode;
        this._stayMapPositions = stayMapPositions;
    }

    private _id: string;
    private _name: string;
    private _show: boolean;
    private _block: boolean;
    private _posMode: MapDecoratePosMode;
    private _stayMapPositions: Vec2[];
}