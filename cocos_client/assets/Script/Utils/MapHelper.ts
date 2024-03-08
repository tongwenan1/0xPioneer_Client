import {GameMain} from "db://assets/Script/GameMain";
import {tween, Vec3} from "cc";

export default class MapHelper {
    static highlightPosOnOuterMap(mapPos: { x: number, y: number }) {
        const currentWorldPos = GameMain.inst.MainCamera.node.worldPosition;
        const goWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(mapPos.x, mapPos.y);
        const distance = Vec3.distance(currentWorldPos, goWorldPos);
        tween()
            .target(GameMain.inst.MainCamera.node)
            .to(Math.min(0.8, distance / 1800), {worldPosition: goWorldPos})
            .start();
    }
}