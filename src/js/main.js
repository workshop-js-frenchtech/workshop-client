/**
 * Created by jerek0 on 07/05/2015.
 */

import NetworkManager from "./network/NetworkManager";
import * as util from "./misc/util"
import $ from "jquery";
import Sound from "./audio/Sound";
import DetectedColor from "./DetectedColor";

var app = {
    init: function () {
        window.workshop = {};
        
        var scope = this;
        
        this.getLocalWebcam(function() {
            scope.initNetwork.bind(scope).call();
            scope.initSound.bind(scope, scope.initColorTracker.bind(scope)).call();
        });
        
        this.bindUIActions();
    },
    
    bindUIActions: function() {
        this.registerNetworkUI();
    },
    
    registerNetworkUI: function() {
        window.addEventListener('keydown', function(e) {
            switch(e.keyCode) {
                case 32: // SPACE
                    $('.network-ui').toggleClass('hidden');
                    break;
                
                default:
                    console.log(e.keyCode);
                    break;
            }
        });
    },
    
    getLocalWebcam: function (cb) {
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        // Put user's video directly into #myVideo
        navigator.getUserMedia({video: true, audio: true}, function (localMediaStream) {
            var video = document.querySelector('#myVideo');
            video.src = window.URL.createObjectURL(localMediaStream);

            workshop.localWebcamStream = localMediaStream;

            // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
            // See crbug.com/110938.
            video.onloadedmetadata = function (e) {
                // Ready to go. Do some stuff.
                setTimeout(function () {
                    $('#myVideo').toggleClass('video-small', false);
                }, 1000);
            };

            cb && cb();

        }, util.log);
    },

    initNetwork: function () {
        this.networkManager = new NetworkManager();
    },

    initSound: function(cb) {
        // Define audio context
        window.AudioContext = window.AudioContext ||
        window.webkitAudioContext;

        this.audioContext = new AudioContext();

        // Define color

        this.ColorsDetected = [];

        this.ColorsDetected['magenta'] = new DetectedColor('magenta', new Sound('audio/PO_DualBass120C-02.wav', this.audioContext), 100, 100);
        this.ColorsDetected['yellow'] = new DetectedColor('yellow', new Sound('audio/PO_BeatAmpedA120-02.wav', this.audioContext), 100, 100);
        this.ColorsDetected['red'] = new DetectedColor('red', new Sound('audio/PO_Massaw120C-02.wav', this.audioContext), 100, 100);

        cb && cb();
    },
    
    initColorTracker: function() {
        var scope = this;
        
        tracking.ColorTracker.registerColor('red', function(r, g, b) {
            if (r > 100 && g < 50 && b < 50) {
                return true;
            }
            return false;
        });
        
        var colors = new tracking.ColorTracker(['magenta', 'cyan', 'yellow', 'red']);

        colors.on('track', function(event) {
            if (event.data.length === 0) {

                for(var color in scope.ColorsDetected){
                    scope.ColorsDetected[color].removeEffects();
                }

            } else {

                for(var color in scope.ColorsDetected){
                    scope.ColorsDetected[color].removeEffects();
                }

                event.data.forEach(function(rect) {
                    for(var color in scope.ColorsDetected) {
                        if (rect.color == color) {
                            scope.ColorsDetected[rect.color].setPos(rect.x, rect.y);
                            scope.ColorsDetected[rect.color].updateEffects();
                        }
                    }
                });
            }
        });

        tracking.track('#myVideo', colors);
    }
};

app.init();
