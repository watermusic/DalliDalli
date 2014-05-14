var PP = PP || {};
$(function () {
    PP.Timer = (function () {

        var _interval = null,
            r = null,
            R = 200,
            _init = false,
            element = $("#holder"),
            param = {},
            timerId = null,
            marksAttr = {},
            html = [],
            sec = null;


        var init = function() {

            r = Raphael(element.get(0), 600, 600);
            R = 200;
            _init = true;
            param = {stroke: "#fff", "stroke-width": 30};
            marksAttr = {fill: "#444", stroke: "none"};
            html = [
                document.getElementById("s")
            ];
            // Custom Attribute
            r.customAttributes.arc = function (value, total, R) {
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

            drawMarks(r, R, 60);
            sec = r.path().attr(param).attr({arc: [0, 60, R]});
        };

        var updateVal = function(value, total, R, hand, id) {

            var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
            if (_init) {
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
            html[id].innerHTML = (value < 10 ? "0" : "") + value;
            html[id].style.color = Raphael.getRGB(color).hex;
        };

        var drawMarks = function(r, R, total) {

            var color = "hsb(".concat(Math.round(R) / 200, ", 1, .75)"),
                out = r.set();
            for (var value = 0; value < total; value++) {
                var alpha = 360 / total * value,
                    a = (90 - alpha) * Math.PI / 180,
                    x = 300 + R * Math.cos(a),
                    y = 300 - R * Math.sin(a);
                out.push(r.circle(x, y, 2).attr(marksAttr));
            }
            return out;
        };

        return {

            start : function(amount) {

                if(r === null) {
                    init();
                }

                var start = Date.now();

                timerId =
                    countdown(
                        start,
                        function(ts) {
                            var counter = amount - ts.seconds;
                            updateVal(counter, 60, 200, sec, 0);
                            if( counter == 0) {
                                PP.Timer.finish();
                            }
                        },
                        countdown.SECONDS
                    );

                element.parent().show();

            },
            stop : function() {
                element.parent().hide();
                window.clearInterval(timerId);
            },
            show : function() {
                element.parent().show();
            },
            hide : function() {
                element.parent().hide();
            }
            ,
            finish : function() {
                PP.Timer.stop();
                snd_alarm.play();
            }
        };

    })();
});