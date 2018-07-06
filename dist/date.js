var DateFunc = /** @class */ (function () {
    function DateFunc() {
    }
    DateFunc.prototype.dateCompletion = function (inputDate) {
        var fullDateRegexResult = this.getRegex().fullDateRegex.exec(inputDate);
        if (fullDateRegexResult)
            return fullDateRegexResult[0];
        var dateRegexResult = this.getRegex().dateRegex.exec(inputDate);
        if (dateRegexResult)
            return dateRegexResult[0] + ' 00:00:00';
        var timeRegexResult = this.getRegex().timeRegex.exec(inputDate);
        if (timeRegexResult)
            return (new Date()).toLocaleDateString() + ' ' + timeRegexResult[0];
        return false;
    };
    DateFunc.prototype.dateFormatTransform = function (inputDate) {
        if (!this.getRegex().fullDateRegex.exec(inputDate))
            return false;
        var month = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        var date, explodeDate = inputDate.split(' '), activeMonth;
        if (!explodeDate[1])
            explodeDate[1] = '';
        date = explodeDate[0].split('.');
        activeMonth = month[Number(date[1]) - 1];
        return activeMonth + " " + date[0] + ", " + date[2] + " " + explodeDate[1];
    };
    DateFunc.prototype.getTimeDiff = function (firstTime, secondTime) {
        var firstTimeMs, secondTimeMs;
        if (!firstTime)
            return false;
        firstTimeMs = (new Date(firstTime)).getTime();
        if (!secondTime)
            secondTimeMs = (new Date()).getTime();
        else
            secondTimeMs = (new Date(secondTime)).getTime();
        return firstTimeMs - secondTimeMs;
    };
    DateFunc.prototype.dateIsGreater = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime > secondTime)
            return true;
        return false;
    };
    DateFunc.prototype.dateIsLess = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime < secondTime)
            return true;
        return false;
    };
    DateFunc.prototype.dateIsEqual = function (firstTime, secondTime) {
        if (!firstTime || !secondTime)
            return false;
        var firstTimeTransform = this.dateFormatTransform(firstTime);
        if (typeof firstTimeTransform !== 'string')
            return false;
        var secondTimeTransform = this.dateFormatTransform(secondTime);
        if (typeof secondTimeTransform !== 'string')
            return false;
        var firstTimeMs = (new Date(firstTimeTransform)).getTime();
        var secondTimeMs = (new Date(secondTimeTransform)).getTime();
        if (firstTime === secondTime)
            return true;
        return false;
    };
    return DateFunc;
}());
