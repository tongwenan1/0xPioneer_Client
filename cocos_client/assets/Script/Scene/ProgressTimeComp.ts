import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ProgressTime')
export class ProgressTime extends Component {
    @property(ProgressBar)
    progressBar:ProgressBar;

    @property(Label)
    txtMissionTime:Label;

    private _start: boolean = false;

    private _totalTime:number = 0;

    private _curTime:number = 0;

    start() {
        this.progressBar.progress = 1;
        this.txtMissionTime.string = ``;
    }

    init(time:number){
        this.node.active = true;
        this._totalTime = time;
        this._curTime = 0;
        this._start = true;
        this.progressBar.progress = 1;
        this._curSecond = 0;
    }

    hide(){
        this.node.active = false;
    }

    private _curSecond = 0;

    update(deltaTime: number) {
        if(!this._start){
            return;
        }

        if(this._curTime >= this._totalTime){
            this._start = false;
            this.txtMissionTime.string = '';
            this._curSecond = 0;
            return;
        }

        this._curTime += deltaTime;
        this.progressBar.progress = this._curTime / this._totalTime;

        this._curSecond += deltaTime;
        if(this._curSecond < 1){
            return;
        }
        this._curSecond = 0;

        // timeFormat 00:00:00
        let timeStr = "";
        let time = Math.floor(this._totalTime - this._curTime);
        let hour = Math.floor(time / 3600);
        let day = Math.floor(hour / 24);
        if(day > 0){
            timeStr += `${day}day`;
        }

        if(hour > 0){
            timeStr += `${hour}:`;
        }
        let min = Math.floor((time % 3600) / 60);
        if(min > 0){
            timeStr += `${min}:`;
        }
        let sec = time % 60;
        timeStr += `${sec}`;
        this.txtMissionTime.string = timeStr;
    }
}


