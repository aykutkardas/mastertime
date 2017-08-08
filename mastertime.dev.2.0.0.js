/* Mastertime 2.0.0 Alfa Version */


// Mastertime Namespace
var MT = MT || {};

// Method Storage
MT.tools = {};

// Timer Storage
MT.timebase = [];

// Interval Target
MT.jobs = [];

// Name Storage
MT.names = {};

// Option Storage
MT.options = {}

// mtAgo Options
MT.options.ago = {
  "second": "second",
  "minute": "minute",
  "hour": "hour",
  "day": "day",
  "week": "week",
  "month": "month",
  "year": "year",
  "ago": "ago",
  "format": "{t} {k} {a}"
}

// Option Configure Method
MT.configure = function(name, conf){
  if(MT.options[name]){
    Object.assign(MT.options[name], conf);
  }
}

// Methods
MT.tools.agoTemplateFormat = function(str,arg){
  for (var i = 0; i < arg.length; i++) {
      var keys = ["t", "k", "a"];
      if (arg[i]) {
          str = str.replace("{" + keys[i] + "}", arg[i]);
      }
  }
  return str;
}
MT.tools.pad = function(num){
    return ("0" + num).substr(-2);
}

// Collect
MT.collect = function(selector){

  var elems;
  var timeBaseLength = MT.timebase.length;
  var groupIndex = timeBaseLength > 0 ? timeBaseLength : 0;
  MT.timebase[groupIndex] = [];

  if(selector.tagName){
    elems = [selector];
  } else {
    elems = document.querySelectorAll(selector);
  }

  if (elems.length > 0) {
    var newElems = [];
    for (var i = 0; i < elems.length; i++){
      if(elems[i].mtUsed !== true) {
        newElems.push(elems[i]);
      }
    }


    if(newElems.length > 0){
      for (var i = 0; i < newElems.length; i++) {
        var target = newElems[i];
        target.mtUsed = true;
        function attr(name) {
          return target.getAttribute("mt-" + name);
        }
        var timeData ={
            "target": target,
            "name": attr("name") || i,
            "time": Number(attr("time")),
            "way": attr("way"),
            "show": attr("show"),
            "start": attr("start"),
            "complete": attr("complete"),
            "interval": attr("interval"),
            "end": attr("end"),
            "ago": attr("ago")
        };

        MT.timebase[groupIndex].push(timeData);

        if(MT.names[timeData.name]){
          MT.names[timeData.name].push({"groupIndex": groupIndex, "index": i});
        } else {
          MT.names[timeData.name] = [{"groupIndex": groupIndex, "index": i}];
        }
      }
    }
  }
  return groupIndex;
}

// Build
MT.build = function(selector){
  var groupIndex = MT.collect(selector);
  MT.jobs[groupIndex] = [];
  for (var i = 0; i < MT.timebase[groupIndex].length; i++) {
    var timer = MT.timebase[groupIndex][i];
    if(timer.start){
      var tempStartFn = new Function(["$MT"], timer.start);
      tempStartFn(timer);
    }

    MT.jobs[groupIndex][i] = setInterval((function(i){
      return function () {
        MT.working(groupIndex,i);
      }
    })(i), 1000);

    for(var j in timer.target.attributes) {
      var attr = timer.target.attributes[j];
      if (attr && attr.name && attr.name.match(/mt\-/)) {
          timer.target.removeAttribute(attr.name);
      }
    }

  }
}

// Destroy
MT.destroy = function(name, complete){
  if(name){
    var timeNames = MT.names[name];
    if(timeNames.length > 0){
      for (var i = 0; i < timeNames.length; i++) {
        clearInterval(MT.jobs[timeNames[i].groupIndex][timeNames[i].index]);
        var timer = MT.timebase[timeNames[i].groupIndex][timeNames[i].index];
        if(complete === true && timer.complete) {
          var tempCompleteFn = new Function(["$MT"], timer.complete);
          tempCompleteFn(timer);
        }
      }
    }
  }
}

// Working
MT.working = function(groupIndex, index){
  var timer = MT.timebase[groupIndex][index];
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
      output,
      result,
      key,
      destroy;

      if(ago) {
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
                var tempIntervalFn = new Function(["$MT"], interval);
                tempIntervalFn(timer);
              }
          } else {
              // MT.destroy(name); //[NOTE] parametreyi izle.
              destroy = true;
              if (complete) {
                var tempCompleteFn = new Function(["$MT"], interval);
                tempCompleteFn(timer);
              }
          }
      } else if (way === "down") {
          if (time > end) {
              time -= 1;
              if (interval) {
                var tempIntervalFn = new Function(["$MT"], interval);
                tempIntervalFn(timer);
              }
          } else {
              // MT.destroy(name); //[NOTE] parametreyi izle.
              destroy = true;
              if (complete) {
                var tempCompleteFn = new Function(["$MT"], interval);
                tempCompleteFn(timer);
              }
          }
      }

      if (ago) {
        if (hour >= 8064) {
          result = Math.floor(hour / 8064);
          key = "year";
        } else if (hour >= 672) {
          result = Math.floor(hour / 672);
          key = "month";
        } else if (hour >= 168) {
          result = Math.floor(hour / 168);
          key = "week";
        } else if (hour >= 24) {
          result = Math.floor(hour / 24);
          key = "day";
        } else if (hour < 24 && hour > 0) {
          result = hour;
          key = "hour";
        } else if (minute >= 1) {
          result = minute;
          key = "minute";
        } else {
          result = second;
          key = "second";
        }

          var keyword = MT.options.ago[key];
          var ago = MT.options.ago["ago"];
          var format = MT.options.ago["format"];
          var output = MT.tools.agoTemplateFormat(format, [result, keyword, ago]);

          target.innerHTML = output;
          target.value = output;
          timer.ago = time;

          // return MT.working; //[NOTE] Kendini döndürmesi gerekli mi?

      } else {
          if (show) {
              var values = show.split(":").map(function (p) {
                  return "MT.tools.pad(" + p + ")"
              }).join("+':'+")
              output = new Function("h, m, s", "return " + values)(hour, minute, second);
          } else {
              output = MT.tools.pad(hour) + ":" + MT.tools.pad(minute) + ":" + MT.tools.pad(second);
          }

          target.innerHTML = output;
          target.value = output;
          timer.time = time;
          // return MT.working; //[NOTE] Kendini döndürmesi gerekli mi?
      }

      if(destroy) MT.destroy(name);


}

// jQuery Method
// $(selector).mastertime({attributes});
document.addEventListener("DOMContentLoaded", function() {
  if($){
    $.fn["mastertime"] = function(obj) {
      if(obj){
        this.attr(obj);
      }

      var selector = this.selector ? this.selector : this[0];
      MT.build(selector);
    }
  }
});
