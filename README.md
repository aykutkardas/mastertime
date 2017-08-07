[![mastertime](http://worn.online/timeMaster/mt-logo.jpg)](http://worn.online/)

It allows you to create timers by writing very few JavaScript code.


#### install mastertime
```html
    <!-- MasterTime v1.1.0 BETA -->
    <script src="mastertime-1.1.0.js">
</body>
```

#### Timers trigger.

```html
<body onload="MT.build()">
    ...
</body>
```

#### or


```js
window.addEventListener('load', function(){
    MT.build();
});
```


.
.
.
.
.
.


## Mastertime Attributes


### mt-ago 
##### *[new attribute]*
```html
<div mt-ago="68"></div>
```

```
output: 1 minute ago
```

```html
<div mt-ago="7400"></div>
```

```
output: 2 hour ago
```

#### Configure

Notice: *After library addition*

```html
    <script src="mastertime-1.1.0.js">
    <script>
        MT.configure({
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
```

```
output: 00:00:00 #Up count
```

```html
<div mt-time="60"></div>
```
```
output: 00:00:60 #Down count
```

#### mt-end
It is meant to indicate when the timer will stop.

Zero by default if down count,
Infinite by default if up count

```html
<div mt-time="60" mt-end="21"></div>
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
```
```
output: 00:00:60
```
```html
<div mt-time="60" mt-show="m:s"></div> 
```
```
output: 00:60
```
```html
<div mt-time="60" mt-show="s"></div> 
```
```
output: 60
```

### Function Trigger "start,interval,complete"
#### Callback support "_MT"
```js
_MT = {
    ago : value,
    complete : value,
    end : value,
    interval : value,
    name : value,
    show : value,
    start : value,
    target : value,
    time : value,
    way : value
}
```

#### mt-start
It allows you to run a function/jscode when the timer starts.

```html
Example 1: <div mt-time="60" mt-start="console.log('timer start.');"></div>
Example 2: <div mt-time="10" mt-start="_MT.target.classList.add = 'animated bounce';"></div>
Example 3: <div mt-time="10" mt-start="$(_MT.target).addClass('animated bounce');"></div>
```

#### mt-interval
You can run a function as long as the timer is running.

```html
Example 1: <div mt-time="60" mt-interval="console.log('timer interval.');"></div>
Example 2: <div mt-time="10" mt-interval="_MT.time < 5 ? _MT.target.style.color = 'red' : false;"></div>
Example 3: <div mt-time="10" mt-interval="_MT.time < 5 ? $(_MT.target).css('color', 'red') : false;"></div>
```
#### mt-complete
You can run a function when the timer stops.

```html
Example 1: <div mt-time="60" mt-complete="console.log('timer complete.');"></div>
Example 2: <div mt-time="10" mt-complete="_MT.target.style.display = 'none';"></div>
Example 3: <div mt-time="10" mt-complete="$(_MT.target).css('display', 'none');"></div>
```
#### mt-name
Your timer will give you a name. This name is a tag that timer is needed to stop from the outside.

```html
<div mt-time="60" mt-name="visitTimer" mt-complete="console.log('visit timer complete')"></div>
```
* mt-complete will not work.
```html
<button onclick="MT.destroy('visitTimer')"></button>
```

* mt-complete will work.
```html
<button onclick="MT.destroy('visitTimer', true)"></button> 
```

License
----

MIT
