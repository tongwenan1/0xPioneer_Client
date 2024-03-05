
const win = window as any;

export const languages = {
   "DialogueUI": {
        "next": "NEXT"
   },
   "EventUI": {
        "fight": "Fight!",
        "next": "NEXT"
   },
   "talk": {
        "01": "Finally you are here.",
        "02": "Who the hell are you?"
   }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
