import { _decorator, game } from 'cc';
import { ECursorStyle } from '../Const/ConstDefine';

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 */
export class MouseCursor {
    public static lastStyle: string = ECursorStyle.default;

    public static SetCursorStyle(style: ECursorStyle, url = "") {
        if (style == ECursorStyle.url)
        {
            // game.canvas.style.cursor = `url(${url}),auto`;
            game.canvas.style.cursor = `url("${window.location.href}${url}"), auto`;
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