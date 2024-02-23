import { _decorator, game } from 'cc';

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 */
export const enum ECursorStyle {
    url = "url",
    default = "default",
    auto = "auto",
    crosshair = "crosshair",
    pointer = "pointer",
    move = "move",
    e_resize = "e-resize",
    ne_resize = "ne-resize",
    nw_resize = "nw-resize",
    n_resize = "n-resize",
    se_resize = "se-resize",
    sw_resize = "sw-resize",
    s_resize = "s-resize",
    w_resize = "w-resize",
    text = "text",
    wait = "wait",
    help = "help"
}

export class MouseCursor {
    public static lastStyle: string = ECursorStyle.default;

    public static SetCursorStyle(style: ECursorStyle, url = "") {
        if (style == ECursorStyle.url)
        {
            // game.canvas.style.cursor = `url(${url}),auto`;
            game.canvas.style.cursor = `url("/${url}"), auto`;
        }
        else {
            //game.canvas.style.cursor = style;
            game.canvas.style.cursor = style;
        }

        MouseCursor.lastStyle = game.canvas.style.cursor;
    }

    public static set enabled(value: boolean) {
        game.canvas.style.cursor = value ? "none" : MouseCursor.lastStyle;
    }

    public static get enabled() {
        return game.canvas.style.cursor == "none";
    }

}