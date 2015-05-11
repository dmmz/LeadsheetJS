define([
    'modules/core/src/SongBarsIterator',
    'modules/Cursor/src/CursorModel',
    'modules/WaveManager/src/WaveBarView',
    'pubsub'
], function(SongBarsIterator, CursorModel, WaveBarView,pubsub) {
    function WaveDrawer(viewer, params, waveMng) {
            params = params || {};
            if (!params.pixelRatio) {
                throw "WaveDrawer - pixelRatio not defined";
            }

            this.pixelRatio = params.pixelRatio;
            this.showHalfWave = params.showHalfWave;
            this.marginCursor = params.marginCursor || 0;
            this.drawMargins = params.drawMargins; //for debugging
            this.topAudio = params.topAudio || 80;
            this.heightAudio = params.heightAudio || 100;
            this.color = ["#55F", "#99F"];
            this.waveBarDimensions = [];
            this.viewer = viewer;
            this.waveMng = waveMng;
            this._adaptViewer();
            this._initSubscribe();
        }
    /**
     * update viewer dimensions if needed (space between lines and margin top)
     */
    WaveDrawer.prototype._adaptViewer = function() {
        if (this.topAudio > 0) {
            this.viewer.setLineMarginTop(this.topAudio);
        } else {
            distance = this.viewer.LINE_HEIGHT + this.topAudio + this.heightAudio;
            if (distance < 0) {
                this.viewer.setLineMarginTop(distance, true);
            }
        }
    };
    WaveDrawer.prototype._initSubscribe = function() {
        var self = this;
        $.subscribe('CanvasLayer-updateCursors',function(el,coords){
            self.updateCursor(coords);
        });
    };
    /**
     * @param  {Float} time      in seconds (e.g. 4.54)
     * @param  {Integer} barIndex number of bar in which the cursor is (should be previously calculated) 
     * @return {Object}          e.g. { x: 12, y: 23, w:5, h:5}
     */
    WaveDrawer.prototype._getAudioPosFromTime = function(time, barIndex) {
        var timeBoundaries = this.waveMng.barTimesMng.getTimeLimits(barIndex);
        var timeDist = timeBoundaries.end - timeBoundaries.start;
        var dim = this.waveBarDimensions[barIndex];
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

        var barDim = this.viewer.scaler.getScaledObj(this.waveBarDimensions[barIndex]);
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
        return this._getAudioPosFromTime(time,barIndex);
        
    };
    WaveDrawer.prototype.updateCursorPlaying = function(time) {
        this.cursorPos = this._getCursorDims(time);
    };

    WaveDrawer.prototype.getAreasFromCursor = function() {
        var barTimesMng = this.waveMng.barTimesMng,
        startTime = this.cursor.getStart(),
        endTime = this.cursor.getEnd();
        var startBar = barTimesMng.getIndexByTime(startTime);
        var endBar = barTimesMng.getIndexByTime(endTime);
        var areas = EditionUtils.getElementsAreaFromCursor(this.waveBarDimensions, [startBar, endBar]);

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
    WaveDrawer.prototype.drawCursor = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.cursorPos.x, this.cursorPos.y);
        ctx.lineTo(this.cursorPos.x, this.cursorPos.y + this.cursorPos.h);
        ctx.stroke();
    };
    //CANVASLAYER ELEMENT METHOD
    WaveDrawer.prototype.draw = function(ctx) {
       var saveFillColor = ctx.fillStyle;
        ctx.fillStyle = "#9900FF";
        ctx.globalAlpha = 0.2;
        var areas = this.getAreasFromCursor();
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
    WaveDrawer.prototype.newCursor = function(audio) {
        this.cursor = new CursorModel(audio.getDuration());
    };
    WaveDrawer.prototype.drawAudio = function(barTimesMng) {
        //important to reset each time we draw
        this.waveBarDimensions = [];
        var numBars = barTimesMng.getLength();
        var area, dim, bar, barTime = 0,
            sliceSong = 1 / numBars,
            start = 0,
            peaks,
            toggleColor = 0;
        for (var i = 0; i < barTimesMng.getLength(); i++) {
            dim = this.viewer.barWidthMng.getDimensions(i);
            waveBarView = new WaveBarView(
                dim.left,
                dim.top - this.viewer.CHORDS_DISTANCE_STAVE - this.topAudio,
                dim.width,
                this.heightAudio
            );
            this.waveBarDimensions.push(waveBarView);
            area = waveBarView.getArea();
            peaks = this.waveMng.audio.getPeaks(area.w, start, start + sliceSong);
            this.drawPeaks(peaks, area, this.color[toggleColor], this.viewer);
            toggleColor = (toggleColor + 1) % 2;
        }
         this.viewer.canvasLayer.addElement('audioCursor', this);
        this.updateCursorPlaying(0);
        this.viewer.canvasLayer.refresh();
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
            var scale = 1;
            var i, h, maxH;
            // if (self.params.fillParent && width != length) {
            //     scale = width / length;
            // }
            scale = width / length;
            ctx.fillStyle = color;
            if (self.drawMargins) {
                self._drawMargins(area, ctx);
            }

            ctx.beginPath();
            ctx.moveTo(area.x + $, halfH + offsetY);
            //Comment these 3 lines if we only want to print the superior half
            if (!self.showHalfWave) {
                for (i = 0; i < length; i++) {
                    h = Math.round(peaks[i] * halfH);
                    ctx.lineTo(area.x + i * scale + $, halfH + h + offsetY);
                }
            }

            ctx.lineTo(area.x + width + $, halfH + offsetY);
            ctx.moveTo(area.x + $, halfH + offsetY);

            for (i = 0; i < length; i++) {
                maxH = self.showHalfWave ? height : halfH;
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
    WaveDrawer.prototype.getYs = function(coords) {
        
        var cursorBars = this.getBarsInPath(coords);
      
        if (cursorBars){
            return {
                topY: this.waveBarDimensions[cursorBars[0]].getArea().y,
                bottomY : this.waveBarDimensions[cursorBars[1]].getArea().y
            };
        }else{
            return false;
        }
    };
    // TODO, refactor: these functions are present in NoteSpaceManager and in ChordSpaceManager
    WaveDrawer.prototype.getBarsInPath = function(coords) {
         var note,
            min = null,
            max = null;
        for (var i in this.waveBarDimensions) {
            if (this.isInPath(coords, i)) {
                if (min == null) {
                    min = Number(i);
                }
                if (max == null || max < i) {
                    max = Number(i);
                }
            }
        }
        return (min === null && max === null) ? false : [min, max];
    };
    WaveDrawer.prototype.isInPath = function(area,i) {
        area.xe = area.xe || area.x;
        area.ye = area.ye || area.y; //in case xe and ye are not defined, they take the same value a x and y respectively
        pos = this.viewer.scaler.getScaledObj(this.waveBarDimensions[i].getArea());
        var posXe = pos.x + pos.w,
            posYe = pos.y + pos.h;
        return (area.x < posXe && area.xe > pos.x) && (area.y < posYe && area.ye > pos.y);
    };
    WaveDrawer.prototype.updateCursor = function(coords) {
            //Doing the inverse of what we do in getCursorDims
        var cursorBars = this.getBarsInPath(coords);
        if (cursorBars[0] != null && cursorBars[1] != null) {
            var pos1 = this._getAudioTimeFromPos(coords.x, cursorBars[0]);
            var pos2 = this._getAudioTimeFromPos(coords.xe, cursorBars[1]);
            this.cursor.setPos([pos1, pos2]);
        }
    };
    return WaveDrawer;
});