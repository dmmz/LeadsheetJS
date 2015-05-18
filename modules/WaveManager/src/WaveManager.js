define(['modules/WaveManager/src/WaveAudio',
    'modules/WaveManager/src/WaveDrawer',
    'modules/WaveManager/src/BarTimesManager',
    'modules/core/src/SongBarsIterator',
    'jquery',
    'pubsub'
], function(WaveAudio, WaveDrawer, BarTimesManager, SongBarsIterator, $, pubsub) {
    /**
     * @param {SongModel} song
     * @param {cursorNotes} cModel     // notes cursor, it is updated when playing
     * @param {LSViewer} viewer
     * @param {Object} params :
     *   - showHalfWave: show only the half of the waveform like in soundcloud
     *   - drawMargins: show the margin of the are in which the audio is drawn (for debug purposes)
     *   - topAudio: y distance to the actual bar from which audio is drawn, if 0 it will overwrite the current bar
     *   - heightAudio: height of the audio area, if 150 it will completely overwrite the current bar in the score
     */
    function WaveManager(song, cModel, viewer, params) {
        if (!song) {
            throw "WaveManager - song not defined";
        }
        if (!cModel) {
            throw "WaveManager - cModel not defined";
        }
        if (!viewer) {
            throw "WaveManager - viewer not defined";
        }

        params = params || {};

        this.barTimesMng = new BarTimesManager();
        this.song = song;
        this.cursorNotes = cModel;
        this.isLoaded = false;
        
        this.audio = new WaveAudio();

        var paramsDrawer = {
            pixelRatio: window.devicePixelRatio,
            showHalfWave: params.showHalfWave,
            drawMargins: params.drawMargins,
            topAudio: params.topAudio,
            heightAudio: params.heightAudio,
            marginCursor: params.marginCursor
        };
        this.drawer = new WaveDrawer(viewer, paramsDrawer, this);
        this._initSubscribe();
    }
    WaveManager.prototype._initSubscribe = function() {
         var self = this;
         //when window is resized, leadsheet is drawn, and audio needs to be redrawn too
         $.subscribe('LSViewer-drawEnd', function(){
            if (self.isLoaded){
                self.drawer.drawAudio(self.barTimesMng,self.audio.tempo,self.audio.getDuration());    
            }
        });
    };

    WaveManager.prototype.isReady = function() {
        return this.isLoaded;
    };

    WaveManager.prototype.load = function(url, tempo) {
        if (isNaN(tempo) || tempo <= 0) {
            throw "WaveManager - No tempo speficied";
        }

        // TODO Use tempo to compute length
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = false;

        xhr.onload = function() {
            var audioData = xhr.response;
            self.audio.load(audioData, self, tempo, function() {
                self.isLoaded = true;
                self.barTimesMng.setBarTimes(self.song, self.audio);
                self.drawer.newCursor(self.audio);
                self.drawer.drawAudio(self.barTimesMng,self.audio.tempo,self.audio.getDuration());
            });
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
                        self.cursorNotes.setPos(iNote);
                        prevINote = iNote;
                    }
                    timeStep += minBeatStep;
                }
                time = self.getPlayedTime();
                self.barTimesMng.updateCurrBarByTime(time);
                self.drawer.updateCursorPlaying(time);
                self.drawer.viewer.canvasLayer.refresh();
                requestFrame(frame);
            }
        };
        frame();
    };

    WaveManager.prototype.play = function() {
        if (this.isReady()) {
            this.isPause = false;
            this.restartAnimationLoop();
            this.audio.play();
        }
    };

    WaveManager.prototype.pause = function() {
        if (this.isReady()) {
            this.isPause = true;
            this.audio.pause();
            this.currBar = 0;
        }
    };

    WaveManager.prototype.getPlayedTime = function() {
        //var dur = this.buffer.duration;
        return this.audio.audioCtx.currentTime - this.startTime;
    };

    return WaveManager;
});