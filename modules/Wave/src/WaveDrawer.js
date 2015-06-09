define([
    'jquery',
    'modules/core/src/SongBarsIterator',
    'modules/Cursor/src/CursorModel',
    'modules/Edition/src/ElementManager',
    'modules/Wave/src/WaveBarView',
    'pubsub'
], function($, SongBarsIterator, CursorModel, ElementManager, WaveBarView, pubsub) {
    function WaveDrawer(viewer, params, waveMng) {
            params = params || {};
            if (!params.pixelRatio) {
                throw "WaveDrawer - pixelRatio not defined";
            }
            this.CL_TYPE = 'CURSOR';
            this.CL_NAME = 'audioCursor';
            this.pixelRatio = params.pixelRatio;
            this.showHalfWave = params.showHalfWave;
            this.marginCursor = params.marginCursor || 0;
            this.drawMargins = params.drawMargins; //for debugging
            this.topAudio = params.topAudio || 80;
            this.heightAudio = params.heightAudio || 100;
            this.color = ["#55F", "#99F"];
            this.waveBarDimensions = [];
            this.enabled = true;
            this.viewer = viewer;
            this.waveMng = waveMng;
            this.elemMng = new ElementManager();
            this._adaptViewer();
        }
        /**
         * update viewer dimensions if needed (space between lines and margin top)
         */
    WaveDrawer.prototype._adaptViewer = function() {

        if (this.topAudio > 0) { // if audio is greater than 0 it means audio will be on top of score line
            this.viewer.setLineMarginTop(this.topAudio);
        } else {
            distance = (this.heightAudio - this.topAudio) - this.viewer.LINE_HEIGHT;
            if (distance > 0) {
                this.viewer.setLineMarginTop(distance, true);
            }
        }
    };
    WaveDrawer.prototype.getType = function() {
        return this.CL_TYPE;
    };

    /**
     * @param  {Float} time      in seconds (e.g. 4.54)
     * @param  {Integer} barIndex number of bar in which the cursor is (should be previously calculated)
     * @return {Object}          e.g. { x: 12, y: 23, w:5, h:5}
     */
    WaveDrawer.prototype._getAudioPosFromTime = function(time, barIndex) {
        var timeBoundaries = this.waveMng.barTimesMng.getTimeLimits(barIndex);
        var timeDist = timeBoundaries.end - timeBoundaries.start;
        var dim = this.waveBarDimensions[barIndex].getArea();
        var percent = (time - timeBoundaries.start) / (timeBoundaries.end - timeBoundaries.start);
        var newDim = {};
        newDim.y = dim.y + this.marginCursor;
        newDim.h = dim.h - this.marginCursor * 2;
        newDim.x = dim.x + percent * dim.w;
        newDim.w = dim.w;
        return newDim;
    };
    /**
     * @param  {Integer} x        coordinate x
     * @param  {Integer} barIndex number of bar in which the cursor is (should be previously calculated)
     * @return {Float}  time in seconds (e.g. 3.94)
     */
    WaveDrawer.prototype._getAudioTimeFromPos = function(x, barIndex) {
        var timeBoundaries = this.waveMng.barTimesMng.getTimeLimits(barIndex);
        var timeDist = timeBoundaries.end - timeBoundaries.start;

        var barDim = this.viewer.scaler.getScaledObj(this.waveBarDimensions[barIndex].getArea());
        var percentPos = (x - barDim.x) / barDim.w;

        return percentPos * timeDist + timeBoundaries.start;
    };
    /**
     *
     * @param  {Float} time     in seconds (e.g. 1.23)
     * @param  {Integer} barIndex number of bar in which the cursor is (should be previously calculated)
     *                            if not specfied, it will take current bar number from barTimesMng (this is used for example, when playing)
     * @return {Object}          e.g. { x: 12, y: 23, w:5, h:5}
     */
    WaveDrawer.prototype._getCursorDims = function(time, barIndex) {
        barIndex = barIndex || this.waveMng.barTimesMng.index;
        return this._getAudioPosFromTime(time, barIndex);

    };
    /**
     * @interface
     * @param  {Object} coords
     */
    WaveDrawer.prototype.onSelected = function(coords, clicked, mouseUp) {
        var self = this;
        var cursorBars = this.elemMng.getElemsInPath(this.waveBarDimensions, coords);

        if (cursorBars[0] != null && cursorBars[1] != null) {
            var pos1 = this._getAudioTimeFromPos(coords.x, cursorBars[0]);
            var pos2 = this._getAudioTimeFromPos(coords.xe, cursorBars[1]);
            this.cursor.setPos([pos1, pos2]);
        }
        if (mouseUp){
            var posCursor = this.cursor.getPos();
            if (posCursor[0] != posCursor[1]){  //if there is something selected
                $.publish('selected-audio', posCursor);
            }

        }
    };
    /**
     * @interface
     */
    WaveDrawer.prototype.getYs = function(coords) {
        return this.elemMng.getYs(this.waveBarDimensions, coords);
    };

    /**
     * @interface
     */
    WaveDrawer.prototype.isEnabled = function() {
        return this.enabled;
    };

    /**
     * @interface
     */
    WaveDrawer.prototype.enable = function() {
        this.enabled = true;
    };

    /**
     * @interface
     */
    WaveDrawer.prototype.disable = function() {
        this.enabled = false;
    };

    /**
     * @interface
     * @param  {[type]} ctx [description]
     * @return {[type]}     [description]
     */
    WaveDrawer.prototype.inPath = function(coords) {
        return !!this.elemMng.getElemsInPath(this.waveBarDimensions, coords);
    };

    WaveDrawer.prototype.drawPayingCursor = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.cursorPos.x, this.cursorPos.y);
        ctx.lineTo(this.cursorPos.x, this.cursorPos.y + this.cursorPos.h);
        ctx.stroke();
    };
    /**
     * @interface
     * @param  {CanvasContext} ctx
     */
    WaveDrawer.prototype.drawCursor = function(ctx) {
        var saveFillColor = ctx.fillStyle;
        ctx.fillStyle = "#9900FF";
        ctx.globalAlpha = 0.2;
        var areas = this.getAreasFromTimeInterval(this.cursor.getStart(), this.cursor.getEnd());
        for (i = 0, c = areas.length; i < c; i++) {
            ctx.fillRect(
                areas[i].x,
                areas[i].y,
                areas[i].w,
                areas[i].h
            );
        }
        ctx.fillStyle = saveFillColor;
        ctx.globalAlpha = 1;

    };

    WaveDrawer.prototype.setCursorEditable = function(bool) {
        if (this.cursor) {
            this.cursor.setEditable(bool);
        }
    };
    WaveDrawer.prototype.updateCursorPlaying = function(time) {
        this.cursorPos = this._getCursorDims(time);
    };

    WaveDrawer.prototype.getAreasFromTimeInterval = function(startTime, endTime) {
        var barTimesMng = this.waveMng.barTimesMng;
        var startBar = barTimesMng.getIndexByTime(startTime);
        var endBar = barTimesMng.getIndexByTime(endTime);
        var areas = this.elemMng.getElementsAreaFromCursor(this.waveBarDimensions, [startBar, endBar]);
        var cursor1 = this._getCursorDims(startTime, startBar);
        var cursor2 = this._getCursorDims(endTime, endBar);
        if (cursor1.x != cursor2.x) {
            if (cursor1.x > areas[0].x && cursor1.x < areas[0].x + areas[0].w) {
                var space = cursor1.x - areas[0].x;
                areas[0].x = cursor1.x;
                areas[0].w -= space;
            }
            var lastArea = areas[areas.length - 1];

            if (cursor2.x > lastArea.x && cursor2.x < lastArea.x + lastArea.w) {
                lastArea.w = cursor2.x - lastArea.x;
            }
        } else {
            areas = [];
        }
        return areas;
    };


    WaveDrawer.prototype.newCursor = function(audio) {
        this.cursor = new CursorModel(audio.getDuration());
    };
    WaveDrawer.prototype.drawAudio = function(barTimesMng, tempo, duration) {

        if (!tempo || !duration) {
            throw "WaveDrawer - missing parameters";
        }
        this.waveBarDimensions = [];
        var numBars = barTimesMng.getLength();
        var area, dim, prevDim, bar, barTime = 0,
            sliceSong,
            start = 0,
            peaks,
            toggleColor = 0;

        for (var i = 0; i < barTimesMng.getLength(); i++) {
            sliceSong = barTimesMng.getCurrBarTime(i) / duration;
            prevDim = dim;
            dim = this.viewer.barWidthMng.getDimensions(i);
            if (!dim) {
                dim = prevDim;
                dim.left = dim.left + dim.width;
                dim.width = dim.width / this.viewer.LAST_BAR_WIDTH_RATIO - dim.width;
            }
            waveBarView = new WaveBarView({
                x: dim.left,
                y: dim.top - this.viewer.CHORDS_DISTANCE_STAVE - this.topAudio,
                w: dim.width,
                h: this.heightAudio
            }, this.viewer.scaler);

            this.waveBarDimensions.push(waveBarView);
            area = waveBarView.getArea();
            peaks = this.waveMng.audio.getPeaks(area.w, start, start + sliceSong);
            this.drawPeaks(peaks, area, this.color[toggleColor], this.viewer);
            toggleColor = (toggleColor + 1) % 2;
            start += sliceSong;
        }
        //if there is no canvasLayer we don't paint cursor
        if (this.viewer.canvasLayer) {
            this.viewer.canvasLayer.addElement(this);
            this.updateCursorPlaying(0);
            this.viewer.canvasLayer.refresh();
        }
        $.publish('audio-drawn', this);

    };


    WaveDrawer.prototype._drawMargins = function(area, ctx) {
        ctx.beginPath();
        ctx.moveTo(area.x, area.y);
        ctx.lineTo(area.x + area.w, area.y);
        ctx.stroke();

        ctx.moveTo(area.x, area.y + area.h);
        ctx.lineTo(area.x + area.w, area.y + area.h);
        ctx.stroke();
        ctx.closePath();
    };
    WaveDrawer.prototype.drawPeaks = function(peaks, area, color, viewer) {
        var ctx = viewer.ctx;
        var self = this;

        viewer.drawElem(function() {
            // A half-pixel offset makes lines crisp
            var $ = 0.5 / self.pixelRatio;
            var width = area.w;
            var height = area.h;
            var offsetY = area.y;
            var halfH = height / 2;
            var length = peaks.length;
            var scale;
            var i, h, maxH;

            // if (self.params.fillParent && width != length) {
            //     scale = width / length;
            // }
            maxH = self.showHalfWave ? halfH : height;
            scale = width / length;
            ctx.fillStyle = color;
            if (self.drawMargins) {
                self._drawMargins(area, ctx);
            }

            ctx.beginPath();
            ctx.moveTo(area.x + $, halfH + offsetY);
            // 3 lines for printing the inferior half
            if (!self.showHalfWave) {
                for (i = 0; i < length; i++) {
                    h = Math.round(peaks[i] * halfH);
                    ctx.lineTo(area.x + i * scale + $, halfH + h + offsetY);
                }
            }

            ctx.lineTo(area.x + width + $, halfH + offsetY);
            ctx.moveTo(area.x + $, halfH + offsetY);

            for (i = 0; i < length; i++) {
                h = Math.round(peaks[i] * maxH);
                ctx.lineTo(area.x + i * scale + $, halfH - h + offsetY);
            }

            ctx.lineTo(area.x + width + $, halfH + offsetY);
            ctx.closePath();
            ctx.fill();
            // Always draw a median line
            ctx.fillRect(area.x, halfH + offsetY - $, width, $);
        });

    };

    return WaveDrawer;
});