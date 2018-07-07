[![mastertime](https://github.com/aykutkardas/mastertime/blob/master/mt-logo.jpg?raw=true)](https://github.com/aykutkardas/mastertime/)

## Build
````html
    <div class="timer" mtStart="5"></div>

    <script>
        var MT = new Mastertime;
        MT.build('.timer').run();
    </script>
````

## Add
````html
    <div class="timer"></div>
    <script>
        var MT = new Mastertime;
        MT2.add({
            target: '.timer',
            start: 5,
            end: 0,
            config: {
                leftPad: true,
                timeFormat: 'h:m:s'
            }
        }).run();
    </script>
````
