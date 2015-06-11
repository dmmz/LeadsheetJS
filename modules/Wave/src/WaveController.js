define(['modules/Wave/src/WaveModel',
    'modules/Wave/src/WaveDrawer',
    'modules/Wave/src/BarTimesManager',
    'modules/core/src/SongBarsIterator',
    'jquery',
    'pubsub'
], function(WaveModel, WaveDrawer, BarTimesManager, SongBarsIterator, $, pubsub) {
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
    function WaveController(song, cModel, viewer, params) {
        if (!song) {
            throw "WaveController - song not defined";
        }
        // if (!cModel) {
        //     throw "WaveController - cModel not defined";
        // }
        if (!viewer) {
            throw "WaveController - viewer not defined";
        }

        params = params || {};

        this.barTimesMng = new BarTimesManager();
        this.song = song;
        this.cursorNotes = cModel;
        this.isLoaded = false;
        this.viewer = viewer;
        this.audio = new WaveModel();
        this.file = params.file;
        this.tempo = params.tempo;
        this.isEnabled = true; //this is initialized on load
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
    WaveController.prototype._initSubscribe = function() {
        var self = this;
        //when window is resized, leadsheet is drawn, and audio needs to be redrawn too
        $.subscribe('LSViewer-drawEnd', function() {
            if (!self.isEnabled) {
                return;
            }
            if (self.isLoaded) {
                self.drawer.drawAudio(self.barTimesMng, self.audio.tempo, self.audio.getDuration());
            } else if (self.file && self.tempo) {
                self.load(self.file, self.tempo);
            }
        });
        $.subscribe("ToPlayer-play", function() {
            self.play();
        });
        $.subscribe("ToPlayer-pause", function() {
            self.pause();
        });
        $.subscribe('ToPlayer-stop', function() {
            self.pause();
        });
        $.subscribe("ToLayers-removeLayer", function() {
            self.disable();
        });
    };

    WaveController.prototype.load = function(url, tempo, redraw, callback) {

        if (isNaN(tempo) || tempo <= 0) {
            throw "WaveController - No tempo speficied";
        }

        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = false;

        xhr.onload = function() {
            var audioData = xhr.response;
            self.audio.load(audioData, self, tempo, function() {
                self.isLoaded = true;
                self.enable();
                self.barTimesMng.setBarTimes(self.song, self.audio);
                self.drawer.newCursor(self.audio);
                if (redraw) {
                    self.viewer.setShortenLastBar(true);
                    self.viewer.draw(self.song); // no need to drawAudio(), as it is called on 'drawEnd'
                } else {
                    self.drawer.drawAudio(self.barTimesMng, self.audio.tempo, self.audio.getDuration());
                }
                $.publish('Audio-loaded');
                if (typeof callback !== "undefined") {
                    callback();
                }
            });
        };
        xhr.send();
    };
    WaveController.prototype.enable = function() {
        this.isEnabled = true;
    };
    WaveController.prototype.disable = function() {
        this.isEnabled = false;
    };
    WaveController.prototype.restartAnimationLoop = function() {
        var self = this;
        var noteMng = this.song.getComponent('notes');
        var iNote = 0,
            prevINote = 0,
            time;
        var minBeatStep = this.audio.beatDuration / 32; //we don't want to update notes cursor as often as we update audio cursor, to optimize we only update note cursor every 1/32 beats
        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        this.startTime = this.audio.audioCtx.currentTime;
        this.barTimesMng.reset(); //every time we start playing we reset barTimesMng (= we set currBar to 0) because, for the moment, we play always from the beginning
        var timeStep = 0,
            currBar = 0;
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
                currBar = self.barTimesMng.updateCurrBarByTime(time);
                //to avoid problems when finishing audio, we play while currBar is in barTimesMng, if not, we pause
                if (currBar < self.barTimesMng.getLength()) {
                    self.drawer.updateCursorPlaying(time);
                    self.drawer.viewer.canvasLayer.refresh();
                    requestFrame(frame);
                } else {
                    self.pause();
                }
            }
        };
        frame();
    };

    WaveController.prototype.play = function() {
        if (this.isLoaded) {
            this.isPause = false;
            this.restartAnimationLoop();
            this.audio.play();

        }
    };

    WaveController.prototype.pause = function() {
        if (this.isLoaded) {
            this.isPause = true;
            this.audio.pause();

        }
    };

    WaveController.prototype.getPlayedTime = function() {
        //var dur = this.buffer.duration;
        return this.audio.audioCtx.currentTime - this.startTime;
    };

    return WaveController;
});