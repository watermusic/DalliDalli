;(function ( $, window, document, undefined ) {

    var pluginName = "tzineClock",
        defaults = {
        };

    var gVars = {};

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this._interval = null;
        this.r = null;
        this.init();
    }

    Plugin.prototype = {

        init: function () {
            setUp.call(this.element);
        },

        start: function (seconds) {

            var ticks = seconds;
            var _that = this;

            this._interval = setInterval(function(){
                animation(gVars.green, ticks, seconds);
                --ticks;

                console.log(ticks);

                if(ticks < 0) {
                    _that.stop();
                }

            }, 1000);
        },

        stop: function() {
            if(this._interval) {
                clearInterval(this._interval);
            }
        }

    };

    $.fn[ pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });

        return this;
    };


    function setUp()
    {

        console.debug("setUp Clock");

        this.r = Raphael("holder", 400, 400);
        this.R = 200;
        this._init = true;
        this.param = {stroke: "#fff", "stroke-width": 30};
        this.marksAttr = {fill: "#444", stroke: "none"};
        this.html = [
            document.getElementById("s")
        ];
        // Custom Attribute
        this.r.customAttributes.arc = function (value, total, R) {
            var alpha = 360 / total * value,
                a = (90 - alpha) * Math.PI / 180,
                x = 300 + R * Math.cos(a),
                y = 300 - R * Math.sin(a),
                color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)"),
                path;
            if (total == value) {
                path = [["M", 300, 300 - R], ["A", R, R, 0, 1, 1, 299.99, 300 - R]];
            } else {
                path = [["M", 300, 300 - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
            }
            return {path: path, stroke: color};
        };


        drawMarks(this.r, this.R, 60);
        var sec = this.r.path().attr(this.param).attr({arc: [0, 60, this.R]});
        updateVal(45, 60, 200, sec, 0);

    }

    function updateVal(value, total, R, hand, id) {
        var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
        if (this._init) {
            hand.animate({arc: [value, total, R]}, 900, ">");
        } else {
            if (!value || value == total) {
                value = total;
                hand.animate({arc: [value, total, R]}, 750, "bounce", function () {
                    hand.attr({arc: [0, total, R]});
                });
            } else {
                hand.animate({arc: [value, total, R]}, 750, "elastic");
            }
        }
        this.html[id].innerHTML = (value < 10 ? "0" : "") + value;
        this.html[id].style.color = Raphael.getRGB(color).hex;
    }

    function drawMarks(r, R, total) {
        var color = "hsb(".concat(Math.round(R) / 200, ", 1, .75)"),
            out = r.set();
        for (var value = 0; value < total; value++) {
            var alpha = 360 / total * value,
                a = (90 - alpha) * Math.PI / 180,
                x = 300 + R * Math.cos(a),
                y = 300 - R * Math.sin(a);
            out.push(r.circle(x, y, 2).attr(this.marksAttr));
        }
        return out;
    }


})( jQuery, window, document );


//window.onload = function () {
//
//    drawMarks(R, 60);
//    var sec = r.path().attr(param).attr({arc: [0, 60, R]});
//    R -= 40;
//    drawMarks(R, 60);
//    var min = r.path().attr(param).attr({arc: [0, 60, R]});
//    R -= 40;
//    drawMarks(R, 12);
//    var hor = r.path().attr(param).attr({arc: [0, 12, R]});
//    R -= 40;
//    drawMarks(R, 31);
//    var day = r.path().attr(param).attr({arc: [0, 31, R]});
//    R -= 40;
//    drawMarks(R, 12);
//    var mon = r.path().attr(param).attr({arc: [0, 12, R]});
//    var pm = r.circle(300, 300, 16).attr({stroke: "none", fill: Raphael.hsb2rgb(15 / 200, 1, .75).hex});
//    html[5].style.color = Raphael.hsb2rgb(15 / 200, 1, .75).hex;
//
//
//    (function () {
//        var d = new Date,
//            am = (d.getHours() < 12),
//            h = d.getHours() % 12 || 12;
//        updateVal(d.getSeconds(), 60, 200, sec, 2);
//        updateVal(d.getMinutes(), 60, 160, min, 1);
//        updateVal(h, 12, 120, hor, 0);
//        updateVal(d.getDate(), 31, 80, day, 3);
//        updateVal(d.getMonth() + 1, 12, 40, mon, 4);
//        pm[(am ? "hide" : "show")]();
//        html[5].innerHTML = am ? "AM" : "PM";
//        setTimeout(arguments.callee, 1000);
//        init = false;
//    })();
//
//};