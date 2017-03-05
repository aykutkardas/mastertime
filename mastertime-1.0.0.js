/*!
 * masterTime JavaScript Library v1.0.0
 * https://worn.online/masterTime
 *
 * Author: Aykut KARDAŞ
 * Released under the MIT license
 *
 * Date: 2017-06-03T00:10Z
 */

var MT = MT || {};


MT.times = [];
MT.start = [];
MT.work  = [];
MT.name  = [];

MT.targets = function () {
    return document.querySelectorAll('*[mt-time]');
}

MT.collect = function (index) {
    var target = MT.targets()[index];
    
    MT.times.push({
        target: target,
        name: target.getAttribute("mt-name") || index,
        time: Number(target.getAttribute("mt-time")),
        way: target.getAttribute("mt-way"),
        show: target.getAttribute("mt-show"),
        start: target.getAttribute("mt-start"),
        complete: target.getAttribute("mt-complete"),
        interval: target.getAttribute("mt-interval"),
        end: target.getAttribute("mt-end")
    });
    
    MT.name[MT.times[index].name] = index;
    
    target.removeAttribute("mt-time");
    target.removeAttribute("mt-way");
    target.removeAttribute("mt-show");
    target.removeAttribute("mt-start");
    target.removeAttribute("mt-complete");
    target.removeAttribute("mt-interval");
    target.removeAttribute("mt-end");
    target.removeAttribute("mt-name");
    
    if(MT.times[index].start){
        setTimeout(MT.times[index].start, 0);
    }
}

MT.working = function (index) {
    
    var
        target      = MT.times[index].target,
        name        = MT.times[index].name,
        time        = MT.times[index].time,
        way         = MT.times[index].way,
        show        = MT.times[index].show,
        start       = MT.times[index].start,
        complete    = MT.times[index].complete,
        interval    = MT.times[index].interval,
        end         = MT.times[index].end,
        hour        = Math.floor(time / 60 / 60),
        minute      = Math.floor((time % 3600) / 60),
        second      = (time % 3600) % 60,
        result      = "";



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
            MT.times[index].way = way;
        } else {
            way = "down";
            end = 0;
            MT.times[index].way = way;
        }
    }


    if (way === "up") {
        if (time < end) {
            time += 1;
            if(interval){
                setTimeout(interval, 0);
            }
        } else {
            MT.destroy(index);
            if (complete) {
                setTimeout(complete, 0);
            }
        }
    } else if (way === "down") {
        if (time > end) {
            time -= 1;
            if(interval){
                setTimeout(interval, 0);
            }
        } else {
            MT.destroy(index);
            if (complete) {
                setTimeout(complete, 0);
            }
        }
    }

    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (second < 10) {
        second = "0" + second;
    }

    if (show) {
        show =
            show.replace("h", "hour")
            .replace("s", "second")
            .replace("m", "minute")
            .split(":");

        for (i = 0; i < show.length; i++) {
            if (show[i]) {
                (show.length - 1 == i) ? result += show[i]: result += show[i] + "+':'+";
            }
        }

        result = eval(result);
    } else {
        result = hour + ":" + minute + ":" + second;
    }

    target.innerHTML = result;
    target.value = result;
    MT.times[index].time = time;

}

MT.build = function () {
  var i;
  for (i = 0; i < MT.targets().length; i += 1) {
    MT.collect(i);
    MT.start[i] = new MT.working(i);
    MT.work[i] = setInterval('MT.start[' + i + '].constructor(' + i + ')', 1000);
  }
};

MT.destroy = function(index, complete) {
    if (typeof index === "string") {
        clearInterval(MT.work[MT.name[index]]);
    } else {
        clearInterval(MT.work[index]);
    }
    if(complete){
        if(MT.times[MT.name[index]].complete){
            setTimeout(MT.times[MT.name[index]].complete, 0);
        }
    }
}
