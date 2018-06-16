/*!
 * Alpha Version
 * Mastertime JavaScript Library v1.2.0
 * Author: Aykut Kardaş
 * Github: http://github.com/aykutkardas/mastertime
 * Date: 09.08.2017
 *
 */

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

// Template Storage
MT.templates = {};

// Option Storage
MT.options = {}

// mtTime Options
MT.options.time = {};

MT.options.time["seperator"]  = ":";

MT.options.time["format"] = function(){ 
  return  "" + 
          "{h}" + MT.options.time["seperator"] + 
          "{m}" + MT.options.time["seperator"] + 
          "{s}";
};

// mtAgo Options
MT.options.ago = {
  "second" : "second",
  "minute" : "minute",
  "hour"   : "hour",
  "day"    : "day",
  "week"   : "week",
  "month"  : "month",
  "year"   : "year",
  "ago"    : "ago",
  "format" : "{t} {k} {a}"
}

// Option Configure Method
MT.configure = function(name, conf){
  if(MT.options[name]){
    Object.assign(MT.options[name], conf);
  }
}

// Methods
MT.tools.format = function(str, arg, key){
  for (var i = 0; i < arg.length; i++) {
      var keys = {
        "ago"  : ["t", "k", "a"],
        "time" : ["Y", "M", "D", "h", "m", "s"]
      }
      var currentKeys = keys[key];
      if (arg[i]) {
          str = str.replace("{" + currentKeys[i] + "}", MT.tools.pad(arg[i]));
      }
  }
  return str;
}

MT.tools.pad = function(num){
    return num < 10 || num.length < 2 ? ("0" + num) : num;
}

// Date to Time Convert Method
MT.date = function(date){

  if(date){
    var date = date.split("|"),
        now  = new Date(),
        time,
        day,
        month,
        year,
        hour,
        minute,
        second,
        mtTime,
        currentDate;

    // day.month.year|hour:minute:second
    if(date.length === 2){

      time = date[1];
      date = date[0];

      date = date.split(".");
      time = time.split(":");

      day    = date[0];
      month  = date[1] ? parseInt(date[1]) -1 : now.getMonth();
			year   = date[2] || now.getFullYear();
			
      hour   = time[0];
      minute = time[1] || "00";
      second = time[2] || "00";


    // day.month.year OR hour:minute:second
    } else {

      date = date[0];

      // hour:minute:second
      if(date.indexOf(":") > -1){

				time   = date.split(":");
				
        day    = now.getDate();
        month  = now.getMonth();
				year   = now.getFullYear();
				
        hour   = time[0];
        minute = time[1] || "00";
        second = time[2] || "00";

      // day.month.year
      } else {

				date   = date.split(".");
				
        day    = date[0];
        month  = date[1] ? parseInt(date[1])-1 : now.getMonth();
				year   = date[2] = date[2] || now.getFullYear();
				
        hour   = "00";
        minute = "00";
        second = "00";

      }

    }

    currentDate = new Date(year, month, day, hour, minute, second);
    mtTime = (now.getTime() - currentDate.getTime()) / 1000;

    // mt-time & mt-way
    if(mtTime < 0) {
      mtTime = -(mtTime);
      mtWay = "down";
    } else {
      mtWay = "up";
    }

    return {
      "time" : Math.floor(mtTime),
      "way"  : mtWay,
      "date" : currentDate
    }

  }
}

// Collect
MT.collect = function(selector){

  var elems;
  var timeBaseLength = MT.timebase.length;
  var groupIndex = timeBaseLength > 0 ? timeBaseLength : 0;
  MT.timebase[groupIndex] = [];

  // Checks if the element is DOM.
  elems = selector.tagName ? [selector] : document.querySelectorAll(selector);

  // Filter what is not used by MT.
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

        var mtDate = MT.date(attr("date")) || {};
        var timeData = {
            "target"  : target,
            "name"    : attr("name") || i,
            "time"    : mtDate.time || Number(attr("time")),
            "way"     : mtDate.way || attr("way"),
            "date"    : attr("date"),
            "format"  : attr("format"),
            "show"    : attr("show"),
            "start"   : attr("start"),
            "complete": attr("complete"),
            "interval": attr("interval"),
            "end"     : attr("end"),
            "ago"     : attr("ago")
        };

        MT.timebase[groupIndex].push(timeData);

        var nameData = {
          "groupIndex": groupIndex,
          "index": i
        };

        MT.names[timeData.name] ? MT.names[timeData.name].push(nameData) : [nameData];
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

    MT.working(groupIndex,i);
    MT.jobs[groupIndex][i] = setInterval((function(i){
      return function () {
        MT.working(groupIndex,i);
      }
    })(i), 1000);

    // Clear MT attributes
    var attributes =  timer.target.attributes;

    for(var j = 0; j < attributes.length; j++) {
      if(attributes[j].name && attributes[j].name.indexOf("mt-") === 0){
        timer.target.removeAttribute(attributes[j].name);
        j-=1;
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

        var groupIndex = timeNames[i].groupIndex;
        var index = timeNames[i].index;

        clearInterval(MT.jobs[groupIndex][index]);
        var timer = MT.timebase[groupIndex][index];

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

  var timer    = MT.timebase[groupIndex][index];
  var target   = timer.target,
      name     = timer.name,
      time     = timer.ago ? Number(timer.ago) : timer.time,
      way      = timer.way,
      date     = timer.date,
      format   = timer.format,
      show     = timer.show,
      start    = timer.start,
      complete = timer.complete,
      interval = timer.interval,
      end      = timer.end,
      ago      = timer.ago,
      year     = Math.floor((time / 31556925.96))              || "0",
      month    = Math.floor((time % 31556925.96) / 2629743.83) || "0",
      day      = Math.floor((time % 2629743.83) / 86400)       || "0",
      hour     = Math.floor((time % 86400) / 3600)             || "0",
      minute   = Math.floor((time % 3600) / 60)                || "0",
      second   = Math.floor((time % 3600) % 60)                || "0",
      output;

      if (format && format.indexOf("@") === 0) {
        format = MT.templates[format.substr(1)];
      }

      if (ago) {
        way = "up";
      }

      if (end !== null) {

          end = Number(end);
          way = time < end ? "up" : "down";

      } else if (end === null && way) {

          if (way === "up") end = time + 5;
          else if (way === "down") end = 0;

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
              clearInterval(MT.jobs[groupIndex][index]);
              if (complete) {
                var tempCompleteFn = new Function(["$MT"], complete);
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
              clearInterval(MT.jobs[groupIndex][index]);
              if (complete) {
                var tempCompleteFn = new Function(["$MT"], complete);
                tempCompleteFn(timer);
              }
          }
      }

      if (ago) {

        var result, key;

        if (year > 0) {
          result = year;
          key = "year";
        } else if (month > 0) {
          result = month;
          key = "month";
        } else if (day > 6) {
          result = day / 7;
          key = "week";
        } else if (day > 0) {
          result = day;
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
          var ago     = MT.options.ago["ago"];
          var format  = MT.options.ago["format"];
          var output  = MT.tools.format(format, [result, keyword, ago], "ago");

          target.innerHTML = output;
          target.value     = output;
          timer.ago        = time;


      } else {

          if (format) output = MT.tools.format(format, [year, month, day, hour, minute, second], "time");
          else        output = MT.tools.format(MT.options.time["format"](), [year, month, day, hour, minute, second],  "time");

          target.innerHTML = output;
          target.value     = output;
          timer.time       = time;
      }
}

// jQuery Method
// $(selector).mastertime({attributes});
document.addEventListener("DOMContentLoaded", function() {

	if(typeof $ === "object" && typeof $.init === "object"){

		$.fn.mastertime = function(obj) {

			if(obj) this.attr(obj);
			
			var selector = this.selector ? this.selector : this[0];
			MT.build(selector);

		}

	}

});
