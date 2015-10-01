/**
 * Created by jerek0 on 01/10/15.
 */
import $ from 'jquery';
import WebcamCanvas from './canvas/WebcamCanvas';

export default class WebcamManager {

    constructor(canvas, video) {
        this.canvasId = canvas;
        this.canvas = $(this.canvasId)[0];
        this.videoId = video;
        this.video = $(this.videoId)[0];
        
        this.detectedColors = {};
    }
    
    initCanvas() {
        this.canvasManager = new WebcamCanvas(this.canvas,this.video);
    }

    addDetectedColor(detectedColor) {
        this.detectedColors[detectedColor.color] = detectedColor;
    }
    
    trackColors() {
        var scope = this,
            colorsToTrack = [],
            colors;
        
        for(var key in this.detectedColors) {
            colorsToTrack.push(this.detectedColors[key].color);
        }
        
        colors = new tracking.ColorTracker(colorsToTrack);
        tracking.track(this.videoId, colors);
        
        colors.on('track', function(e) {
            e.workshopData = "local";
            scope.onColorTrack.bind(scope, e).call();
            e.workshopData = "distant";
            workshop.app.networkManager.cid && workshop.app.networkManager.sendData({ targetId: workshop.app.networkManager.cid, type: 'colorsTrack', event: e });
        });
    }

    onColorTrack (event) {
        var scope = this;

        this.canvasManager && this.canvasManager.resetCanvas();

        for(var color in this.detectedColors){
            this.detectedColors[color].removeEffects();
        }

        if (event.data.length != 0) {
            event.data.forEach(function(rect) {
                for(var color in scope.detectedColors) {
                    if (rect.color == color) {
                        scope.detectedColors[rect.color].setPos(rect.x, rect.y);
                        scope.detectedColors[rect.color].updateEffects();
                    }
                }

                scope.canvasManager && scope.canvasManager.onDetectedColor(rect);
            });
        }
    }
    
    loadSounds(cb) {
        var scope = this,
            i = 0;
        
        for(var color in this.detectedColors) {
            scope.loadSound(scope.detectedColors[color], function () {
                i++;
                if (i == Object.keys(scope.detectedColors).length) {
                    cb && cb();
                }
            });
        }
    }

    /**
     * Load sound
     * @return {void}
     */

    loadSound (color, cb){
        color.sound.loadSound(function(){
            cb && cb();
        });
    }
    
}