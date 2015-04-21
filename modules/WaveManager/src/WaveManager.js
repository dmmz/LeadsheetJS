define(['modules/WaveManager/src/WaveAudio',
    'modules/WaveManager/src/WaveDrawer'
], function(WaveAudio, WaveDrawer) {
    /**
     * @param {SongModel} song   
     * @param {CursorModel} cModel 
     * @param {LSViewer} viewer 
     * @param {Object} params :
     *   - showHalfWave: show only the half of the waveform like in soundcloud
     *   - drawMargins: show the margin of the are in which the audio is drawn (for debug purposes)
     *   - topAudio: y distance to the actual bar from which audio is drawn, if 0 it will overwrite the current bar
     *   - heightAudio: height of the audio area, if 150 it will completely overwrite the current bar in the score
     */
    function WaveManager(song, cModel, viewer, params) {
        params = params || {};

        this.waveBarDimensions = [];
        this.barTimes = [];
        this.currBar = 0;
        this.song = song;
        this.cursorModel = cModel;

        if (params.topAudio > 0){
           viewer.setLineMarginTop(params.topAudio);
        }else if( params.heightAudio - params.topAudio  > viewer.LINE_HEIGHT ){
            var distance = viewer.LINE_HEIGHT - params.heightAudio - params.topAudio;
            viewer.setLineMarginTop(distance, true);
        }
        this.audio = new WaveAudio();
        var paramsDrawer = {
            pixelRatio: window.devicePixelRatio,
            showHalfWave: params.showHalfWave,
            drawMargins: params.drawMargins,
            topAudio: params.topAudio,
            heightAudio: params.heightAudio,
            marginCursor: params.marginCursor
        };
        this.drawer = new WaveDrawer(viewer, paramsDrawer);

    }
    WaveManager.prototype._updateCurrBarByTime = function(time) {
        while (this.currBar < this.barTimes.length && this.barTimes[this.currBar] < time) {
            this.currBar++;
        }
        return this.currBar;
    };
    WaveManager.prototype.load = function(url) {
        var xhr = new XMLHttpRequest();
        var self = this;

        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function() {
            var audioData = xhr.response;
            self.audio.load(audioData, self);
        };
        xhr.send();
    };

    WaveManager.prototype.restartAnimationLoop = function() {
        var self = this;
        var noteMng = this.song.getComponent('notes');
        var iNote = 0,
            prevINote = 0,
            time;
        var minBeatStep = this.audio.beatDuration / 32; //we don't want to update notes cursor as often as we update audio cursor, to optimize we only update note cursor every 1/32 beats
        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        this.startTime = this.audio.audioCtx.currentTime;
        var timeStep = 0;
        var frame = function() {
            if (!self.isPause) {

                if (self.getPlayedTime() >= timeStep + minBeatStep) {
                    iNote = noteMng.getPrevIndexNoteByBeat(self.getPlayedTime() / self.audio.beatDuration + 1);
                    if (iNote != prevINote) {
                        self.cursorModel.setPos(iNote);
                        $.publish('ToViewer-draw', self.song);
                        prevINote = iNote;
                    }
                    timeStep += minBeatStep;
                }
                time = self.getPlayedTime();
                self._updateCurrBarByTime(time);
                self.drawer.drawCursor(self.currBar, self.barTimes, time);
                requestFrame(frame);
            }
        };
        frame();
    };
    WaveManager.prototype.play = function() {

        this.isPause = false;
        this.restartAnimationLoop();
        this.audio.play();

    };
    WaveManager.prototype.pause = function() {
        this.isPause = true;
        this.audio.pause();
        this.currBar = 0;
    };

    WaveManager.prototype.getPlayedTime = function() {
        //var dur = this.buffer.duration;
        return this.audio.audioCtx.currentTime - this.startTime;
    };
    WaveManager.prototype.getBarTime = function(songIt, barTime) {

        return barTime + songIt.getBarTimeSignature().getBeats() * this.audio.beatDuration;
    };
    return WaveManager;
});