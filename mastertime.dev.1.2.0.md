[![mastertime](http://worn.online/timeMaster/mt-logo.jpg)](http://worn.online/)

It allows you to create timers by writing very few JavaScript code.


#### install mastertime
```html
<!-- MasterTime v1.2.0 BETA -->
<script src="mastertime-1.2.0.js"></script>
```

#### Timers trigger.

```js
MT.build("*[mt-time]");
MT.build(".time");
MT.build("#time");
```
```html
<div mt-time="50"></div>
<div class="time" mt-time="50"></div>
<div id="time" mt-time="50"></div>
```

## Mastertime Attributes


### mt-ago 
##### *[new attribute]*
```html
<div mt-ago="68"></div>
output: 1 minute ago
```
```html
<div mt-ago="7400"></div>
output: 2 hour ago
```

#### Configure

Notice: *After library addition*

```html
    <script src="mastertime-1.2.0.js"></script>
    <script>
        MT.configure("ago",{
          second: 'saniye',
          minute: 'dakika',
          hour: 'saat',
          day: 'gün',
          week: 'hafta',
          month: 'ay',
          year: 'yıl',
          ago: 'önce',
          format: '<div class="post-date"><i>{t} </i> <b>{k}</b> {a}</div>'
        });
    </script>
```

##### Format {t}, {k}, {a}
Number: {t} Time value. e.g. 48 

String: {k} Time keyword. e.g. minute

String: {a} Ago keyword. e.g. ago

*Use it in an unordered and free manner.*
```js
    format: '<div class="a"><i>{t} </i> <b>{k}</b> {a}</div>'
```

#### mt-time
This feature is necessary to set up a counter. If not specified, it will not work.
Zero by default
```html
<div mt-time></div>
output: 00:00:00 #Up count
```

```html
<div mt-time="60"></div>
output: 00:00:60 #Down count
```

#### mt-end
It is meant to indicate when the timer will stop.

Zero by default if down count,
Infinite by default if up count

```html
<div mt-time="60" mt-end="21"></div>
<div mt-time="60" mt-end="120"></div>
```


#### mt-way
It is meant to indicate what direction the timer will count.

```html
<div mt-time="0" mt-way="up"></div>
<div mt-time="60" mt-way="down"></div>
```

#### mt-show

It is to specify how the timer will be displayed.

```html
<div mt-time="60" mt-show="h:m:s"></div>
output: 00:00:60
```
```html
<div mt-time="60" mt-show="m:s"></div> 
output: 00:60
```
```html
<div mt-time="60" mt-show="s"></div> 
output: 60
```

### Function Trigger "start,interval,complete"
#### Callback support "$MT"
```js
$MT = {
  ago : value,
  complete : value,
  end : value,
  interval : value,
  name : value,
  show : value,
  date : value,
  format : value,
  start : value,
  target : value,
  time : value,
  way : value
}
```

#### mt-start
It allows you to run a function/jscode when the timer starts.

```html
Example 1: 
<div mt-time="60" mt-start="console.log('timer start.');"></div>

Example 2: 
<div mt-time="10" mt-start="$MT.target.classList.add = 'animated bounce';"></div>

Example 3 (jQuery): 
<div mt-time="10" mt-start="$($MT.target).addClass('animated bounce');"></div>
```

#### mt-interval
You can run a function as long as the timer is running.

```html
Example 1: 
<div mt-time="60" mt-interval="console.log('timer interval.');"></div>

Example 2: 
<div mt-time="10" mt-interval="_MT.time < 5 ? $MT.target.style.color = 'red' : false;"></div>

Example 3 (jQuery): 
<div mt-time="10" mt-interval="_MT.time < 5 ? $($MT.target).css('color', 'red') : false;"></div>
```
#### mt-complete
You can run a function when the timer stops.

```html
Example 1: 
<div mt-time="60" mt-complete="console.log('timer complete.');"></div>

Example 2: 
<div mt-time="10" mt-complete="$MT.target.style.display = 'none';"></div>

Example 3 (jQuery): 
<div mt-time="10" mt-complete="$($MT.target).css('display', 'none');"></div>
```
#### mt-name
Your timer will give you a name. This name is a tag that timer is needed to stop from the outside.

```html
<div mt-time="60" mt-name="Test" mt-complete="console.log('Test complete')"></div>
<div mt-time="53" mt-name="Test" mt-complete="console.log('Test complete')"></div>
<div mt-time="26" mt-name="Test" mt-complete="console.log('Test complete')"></div>
```
* mt-complete will not work.
```html
<button onclick="MT.destroy('Test')"></button>
```

* mt-complete will work.
```html
<button onclick="MT.destroy('Test', true)"></button> 
```

### mt-date

D: Day
M: Month
Y: Year
h: Hour
m: Minute
s: Second

```html
<div mt-date="DD.MM.YYYY|hh:mm:ss"></div> 
<div mt-date="DD.MM.YYYY"></div> 
<div mt-date="hh:mm:ss"></div>
<div mt-date="DD.MM"></div> 
<div mt-date="DD|hh:mm"></div> 
<div mt-date="DD|hh"></div> 
<div mt-date="DD"></div> 
```

### mt-format 
```html
<div 
class="date" 
mt-date="17.06.2015" 
mt-format="<i>{Y} year</i><i>{M} month</i><i>{D} day</i><i>{h} hour</i><i>{m} minute</i><i>{s} second ago</i>"></div>

Output:
<div class="date>
    <i>2 year</i>
    <i>1 month</i>
    <i>23 day</i>
    <i>16 hour</i>
    <i>56 minute</i>
    <i>33 second ago</i>
</div>
```
### MT.templates

```js
MT.templates["dateTemplate"] = "<i>{Y} year</i><i>{M} month</i><i>{D} day</i><i>{h} hour</i><i>{m} minute</i><i>{s} second ago</i>";
```

```html
<div 
class="date" 
mt-date="17.06.2015" 
mt-format="@dateTemplate">

Output:
<div class="date">
    <i>2 year</i>
    <i>1 month</i>
    <i>23 day</i>
    <i>16 hour</i>
    <i>56 minute</i>
    <i>33 second ago</i>
</div>
```


### jQuery support
```html
<div class="time"></div>
```

```js
$(".time").mastertime({
    "mt-time" : 50,
    "mt-way" : "up",
    "mt-interval" : "console.log($MT.time)"
})
```

License
----

MIT
