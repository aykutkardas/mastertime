/*!
 * masterTime JavaScript Library v1.1.1
 * https://github.com/aykutkardas/mastertime/
 *
 * Author: Aykut KARDAŞ
 * Released under the MIT license
 *
 * Date: 2017-08-07T12:21Z
 */

var MT = MT || {};

String.prototype.MTformat = function () {
    var str = this,
        arg = arguments;
    for (var i = 0; i < arg.length; i++) {
        var keys = ['t', 'k', 'a'];
        if (arg[i]) {
            str = str.replace('{' + keys[i] + '}', arg[i]);
        }
    }
    return str;
}


MT.times = [];
MT.start = [];
MT.work = [];
MT.name = [];

MT.targets = document.querySelectorAll('*[mt-time], *[mt-ago]');

MT.collect = function (index) {
    var target = MT.targets[index];
    var attr = function (name) {
        return target.getAttribute("mt-" + name)
    }
    MT.times.push({
        target: target,
        name: attr("name") || index,
        time: Number(attr("time")),
        way: attr("way"),
        show: attr("show"),
        start: attr("start"),
        complete: attr("complete"),
        interval: attr("interval"),
        end: attr("end"),
        ago: attr("ago")
    });

    MT.name[MT.times[index].name] = index;

}

MT.working = function (index) {

    var timer = MT.times[index]
    var target = timer.target,
        name = timer.name,
        time = timer.ago ? Number(timer.ago) : timer.time,
        way = timer.way,
        show = timer.show,
        start = timer.start,
        complete = timer.complete,
        interval = timer.interval,
        end = timer.end,
        ago = timer.ago,
        hour = Math.floor(time / 60 / 60),
        minute = Math.floor((time % 3600) / 60),
        second = (time % 3600) % 60,
        result = "";
    if (ago) {
        way = "up";
    }
    if (end !== null) {
        end = Number(end);
        time < end ? way = "up" : way = "down";
    } else if (end === null && way) {
        if (way === "up") {
            end = time + 5;
        } else if (way === "down") {
            end = 0;
        }
    } else if (end === null && !way) {
        if (time === 0) {
            way = "up";
            end = time + 5;
            timer.way = way;
        } else {
            way = "down";
            end = 0;
            timer.way = way;
        }
    }

    if (way === "up") {
        if (time < end) {
            time += 1;
            if (interval) {
              var mt_cb_fn = new Function(["_MT", "TIME"],interval);
              mt_cb_fn(timer, {
                'hour': hour,
                'minute': minute,
                'second': second
              });
            }
        } else {
            MT.destroy(index);
            if (complete) {
              var mt_cb_fn = new Function(["_MT", "TIME"],complete);
              mt_cb_fn(timer, {
                'hour': hour,
                'minute': minute,
                'second': second
              });
            }
        }
    } else if (way === "down") {
        if (time > end) {
            time -= 1;
            if (interval) {
              var mt_cb_fn = new Function(["_MT", "TIME"],interval);
              mt_cb_fn(timer, {
                'hour': hour,
                'minute': minute,
                'second': second
              });
            }
        } else {
            MT.destroy(index);
            if (complete) {
              var mt_cb_fn = new Function(["_MT", "TIME"],complete);
              mt_cb_fn(timer, {
                'hour': hour,
                'minute': minute,
                'second': second
              });
            }
        }
    }

    if (ago) {
        if (hour >= 8064) {
            result = Math.floor(hour / 8064);
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.year, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.year, MT.conf.ago);
        } else if (hour >= 672) {
            result = Math.floor(hour / 672);
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.month, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.month, MT.conf.ago);
        } else if (hour >= 168) {
            result = Math.floor(hour / 168);
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.week, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.week, MT.conf.ago);
        } else if (hour >= 24) {
            result = Math.floor(hour / 24);
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.day, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.day, MT.conf.ago);
        } else if (hour < 24 && hour > 0) {
            result = hour;
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.hour, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.hour, MT.conf.ago);
        } else if (minute >= 1) {
            result = minute;
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.minute, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.minute, MT.conf.ago);
        } else {
            result = second;
            target.innerHTML = MT.conf.format.MTformat(result, MT.conf.second, MT.conf.ago);
            target.value = MT.conf.format.MTformat(result, MT.conf.second, MT.conf.ago);
        }

        if (timer.ago) {
            timer.ago = time;
        } else {
            timer.time = time;
        }
        return MT.working
    } else {
        if (show) {
            var values = show.split(":").map(function (p) {
                return "MT.pad(" + p + ")"
            }).join("+':'+")
            result = new Function("h, m, s", "return " + values)(hour, minute, second);
        } else {
            result = MT.pad(hour) + ":" + MT.pad(minute) + ":" + MT.pad(second);
        }

        target.innerHTML = result;
        target.value = result;
        timer.time = time;
        return MT.working
    }
}

MT.pad = function (num) {
    return ("0" + num).substr(-2)
}

MT.build = function (target) {
    MT.targets = target || MT.targets
    for (z = 0; z < MT.targets.length; z += 1) {
        MT.collect(z);
    }

    for (i = 0; i < MT.times.length; i += 1) {
        var time = MT.times[i]
        if (time.start) {
            setTimeout(time.start, 0);
        }
        MT.start[i] = MT.working(i);
        MT.work[i] = setInterval((function (i) {
            return function () {
                MT.start[i](i)
            }
        })(i), 1000);
        for (var j in time.target.attributes) {
            var attr = time.target.attributes[j]
            if (attr && attr.name && attr.name.match(/mt\-/)) {
                time.target.removeAttribute(attr.name);
            }
        }
    }
};

MT.destroy = function (index, complete) {
    if (typeof index === "string") {
        clearInterval(MT.work[MT.name[index]]);
    } else {
        clearInterval(MT.work[index]);
    }
    if (complete) {
      var timer = MT.times[MT.name[index]];
        if (timer.complete) {
            var mt_cb_fn = new Function(["_MT", "TIME"], timer.complete);
            mt_cb_fn(timer, {
              'hour' : Math.floor(timer.time / 60 / 60),
              'minute' : Math.floor((timer.time % 3600) / 60),
              'second' : (timer.time % 3600) % 60
            });
        }
    }
}

MT.conf = {
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
    ago: 'ago',
    format: '{t} {k} {a}'
}

MT.configure = function (CONF) {
  Object.assign(MT.conf, CONF);
}
