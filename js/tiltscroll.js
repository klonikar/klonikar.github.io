/**
    Author: Kiran Lonikar
    Description: Tilt to scroll. See accompanying tilt.html for sample usage.
    Call "TiltScroll.init();" to initialize and then in event handlers, call
    TiltScroll.attachTo([document.getElementById(divId)]);
    to attach the tilt handling for the div which the user selected.
    You can also call TiltScroll.param('sensitivity', Number(this.value)) to change sensitivity
    based on some slider like input field.
*/

(function(w) {
    var impl = {
        ax: 0,
        ay: 0,
        sensitivity: 0.2,
        gyroOriginX: 10,
        gyroOriginY: 45,
        acceleroOriginX: 1.5,
        acceleroOriginY: 3.5,
        scrollWindow: true,
        adjustForOrigin: function(val, adjustment) {
            if(val > 0) {
                val -= adjustment;
                //if(val < 0) val = 0;
            } else if(val < 0) {
                val += adjustment;
                //if(val > 0) val = 0;
            }
            return val;
        },
        gyroHandler: function(e) {
            impl.ax = impl.adjustForOrigin(e.gamma, impl.gyroOriginX)*impl.sensitivity;
            impl.ay = impl.adjustForOrigin(e.beta, impl.gyroOriginY)*impl.sensitivity;
        },
        acceleroHandler: function (e) {
            impl.ax = impl.adjustForOrigin(e.accelerationIncludingGravity.x, impl.acceleroOriginX)*impl.sensitivity;
            impl.ay = impl.adjustForOrigin(-e.accelerationIncludingGravity.y, impl.acceleroOriginY)*impl.sensitivity;
         },
         items: [],
         pollInterval: 10,
         moveMe: function() {
             impl.items.forEach(function(elem, idx, arr) {
                 if(!elem || typeof elem == 'function')
                     return;
                 elem.scrollLeft += impl.ax;
                 var prevscrollPosY = elem.scrollTop;
                 elem.scrollTop += impl.ay;
                 if(prevscrollPosY != elem.scrollTop) {
                     //console.log("after scroll: " + elem.scrollTop + ", old pos: " + prevscrollPosY + ", ay: " + impl.ay + ", ax: " + impl.ax);
                 }
                 if(impl.scrollWindow && impl.ay != 0 && prevscrollPosY == elem.scrollTop) {
                     window.scrollBy(0, impl.ay);
                 }
             });
        },
        mainLoop: null
    };

    w.TiltScroll = {

        isInitialized: false,

        init: function(config) {
        	var i;

           	if(!config) {
       	        config = {};
            }

            for(i in config) {
       	        if(config.hasOwnProperty(i) && typeof config[i] !== 'function') {
       	            impl[i] = config[i];
                }
            }

            TiltScroll.isInitialized = true;

            if (!config.noUseGyro && window.DeviceOrientationEvent) { // gyroscope
                console.log("Gyroscope found");
                window.addEventListener('deviceorientation', impl.gyroHandler, false);
            }
            else if(window.DeviceMotionEvent) { // accelerometer
                console.log("Accelerometer found");
                impl.sensitivity = 0.7;
	        window.addEventListener('devicemotion', impl.acceleroHandler, false);
            }
            impl.mainLoop = setInterval(impl.moveMe, impl.pollInterval);
            return this;
        },
        param: function(name, value){
            impl[name] = value;
            console.log("Setting: " + name + " to " + value);
        },
        attachTo: function(items, scrollWindow) {
            impl.items = items;
            impl.scrollWindow = scrollWindow;
        }
    };
})(window);
