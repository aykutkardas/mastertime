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

MT.targets = document.querySelectorAll('*[mt-time]');

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
    end: attr("end")
  });

  MT.name[MT.times[index].name] = index;
  
}

MT.working = function (index) {
  
  var timer   = MT.times[index]
  var target  = timer.target,
  name        = timer.name,
  time        = timer.time,
  way         = timer.way,
  show        = timer.show,
  start       = timer.start,
  complete    = timer.complete,
  interval    = timer.interval,
  end         = timer.end,
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
      if (interval){
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
      if (interval){
        setTimeout(interval, 0);
      }
    } else {
      MT.destroy(index);
      if (complete) {
        setTimeout(complete, 0);
      }
    }
  }
  
  if (show) {
    var values = show.split(":").map(function (p) { return "MT.pad(" + p + ")" }).join("+':'+")
    result = new Function("h, m, s", "return " + values)(hour, minute, second);
  } else {
    result = MT.pad(hour) + ":" + MT.pad(minute) + ":" + MT.pad(second);
  }
  
  target.innerHTML = result;
  target.value = result;
  timer.time = time;
  return MT.working
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
