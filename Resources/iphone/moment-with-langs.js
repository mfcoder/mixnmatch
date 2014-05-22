(function(undefined) {
    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false
        };
    }
    function padToken(func, count) {
        return function(a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function(a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }
    function Language() {}
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + 1e3 * seconds + 6e4 * minutes + 36e5 * hours;
        this._days = +days + 7 * weeks;
        this._months = +months + 12 * years;
        this._data = {};
        this._bubble();
    }
    function extend(a, b) {
        for (var i in b) b.hasOwnProperty(i) && (a[i] = b[i]);
        b.hasOwnProperty("toString") && (a.toString = b.toString);
        b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf);
        return a;
    }
    function cloneMoment(m) {
        var i, result = {};
        for (i in m) m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i) && (result[i] = m[i]);
        return result;
    }
    function absRound(number) {
        return 0 > number ? Math.ceil(number) : Math.floor(number);
    }
    function leftZeroFill(number, targetLength, forceSign) {
        var output = "" + Math.abs(number), sign = number >= 0;
        while (targetLength > output.length) output = "0" + output;
        return (sign ? forceSign ? "+" : "" : "-") + output;
    }
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var minutes, hours, milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
        milliseconds && mom._d.setTime(+mom._d + milliseconds * isAdding);
        if (days || months) {
            minutes = mom.minute();
            hours = mom.hour();
        }
        days && mom.date(mom.date() + days * isAdding);
        months && mom.month(mom.month() + months * isAdding);
        milliseconds && !ignoreUpdateOffset && moment.updateOffset(mom);
        if (days || months) {
            mom.minute(minutes);
            mom.hour(hours);
        }
    }
    function isArray(input) {
        return "[object Array]" === Object.prototype.toString.call(input);
    }
    function isDate(input) {
        return "[object Date]" === Object.prototype.toString.call(input) || input instanceof Date;
    }
    function compareArrays(array1, array2, dontConvert) {
        var i, len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0;
        for (i = 0; len > i; i++) (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) && diffs++;
        return diffs + lengthDiff;
    }
    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedProp, prop, normalizedInput = {};
        for (prop in inputObject) if (inputObject.hasOwnProperty(prop)) {
            normalizedProp = normalizeUnits(prop);
            normalizedProp && (normalizedInput[normalizedProp] = inputObject[prop]);
        }
        return normalizedInput;
    }
    function makeList(field) {
        var count, setter;
        if (0 === field.indexOf("week")) {
            count = 7;
            setter = "day";
        } else {
            if (0 !== field.indexOf("month")) return;
            count = 12;
            setter = "month";
        }
        moment[field] = function(format, index) {
            var i, getter, method = moment.fn._lang[field], results = [];
            if ("number" == typeof format) {
                index = format;
                format = undefined;
            }
            getter = function(i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || "");
            };
            if (null != index) return getter(index);
            for (i = 0; count > i; i++) results.push(getter(i));
            return results;
        };
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        0 !== coercedNumber && isFinite(coercedNumber) && (value = coercedNumber >= 0 ? Math.floor(coercedNumber) : Math.ceil(coercedNumber));
        return value;
    }
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return 0 === year % 4 && 0 !== year % 100 || 0 === year % 400;
    }
    function checkOverflow(m) {
        var overflow;
        if (m._a && -2 === m._pf.overflow) {
            overflow = 0 > m._a[MONTH] || m._a[MONTH] > 11 ? MONTH : 1 > m._a[DATE] || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : 0 > m._a[HOUR] || m._a[HOUR] > 23 ? HOUR : 0 > m._a[MINUTE] || m._a[MINUTE] > 59 ? MINUTE : 0 > m._a[SECOND] || m._a[SECOND] > 59 ? SECOND : 0 > m._a[MILLISECOND] || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
            m._pf._overflowDayOfYear && (YEAR > overflow || overflow > DATE) && (overflow = DATE);
            m._pf.overflow = overflow;
        }
    }
    function isValid(m) {
        if (null == m._isValid) {
            m._isValid = !isNaN(m._d.getTime()) && 0 > m._pf.overflow && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
            m._strict && (m._isValid = m._isValid && 0 === m._pf.charsLeftOver && 0 === m._pf.unusedTokens.length);
        }
        return m._isValid;
    }
    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
    }
    function loadLang(key, values) {
        values.abbr = key;
        languages[key] || (languages[key] = new Language());
        languages[key].set(values);
        return languages[key];
    }
    function unloadLang(key) {
        delete languages[key];
    }
    function getLangDefinition(key) {
        var j, lang, next, split, i = 0, get = function(k) {
            if (!languages[k] && hasModule) try {
                require("./lang/" + k);
            } catch (e) {}
            return languages[k];
        };
        if (!key) return moment.fn._lang;
        if (!isArray(key)) {
            lang = get(key);
            if (lang) return lang;
            key = [ key ];
        }
        while (key.length > i) {
            split = normalizeLanguage(key[i]).split("-");
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split("-") : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join("-"));
                if (lang) return lang;
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) break;
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }
    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) return input.replace(/^\[|\]$/g, "");
        return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format) {
        var i, length, array = format.match(formattingTokens);
        for (i = 0, length = array.length; length > i; i++) array[i] = formatTokenFunctions[array[i]] ? formatTokenFunctions[array[i]] : removeFormattingTokens(array[i]);
        return function(mom) {
            var output = "";
            for (i = 0; length > i; i++) output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            return output;
        };
    }
    function formatMoment(m, format) {
        if (!m.isValid()) return m.lang().invalidDate();
        format = expandFormat(format, m.lang());
        formatFunctions[format] || (formatFunctions[format] = makeFormatFunction(format));
        return formatFunctions[format](m);
    }
    function expandFormat(format, lang) {
        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }
        var i = 5;
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
          case "DDDD":
            return parseTokenThreeDigits;

          case "YYYY":
          case "GGGG":
          case "gggg":
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;

          case "Y":
          case "G":
          case "g":
            return parseTokenSignedNumber;

          case "YYYYYY":
          case "YYYYY":
          case "GGGGG":
          case "ggggg":
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;

          case "S":
            if (strict) return parseTokenOneDigit;

          case "SS":
            if (strict) return parseTokenTwoDigits;

          case "SSS":
            if (strict) return parseTokenThreeDigits;

          case "DDD":
            return parseTokenOneToThreeDigits;

          case "MMM":
          case "MMMM":
          case "dd":
          case "ddd":
          case "dddd":
            return parseTokenWord;

          case "a":
          case "A":
            return getLangDefinition(config._l)._meridiemParse;

          case "X":
            return parseTokenTimestampMs;

          case "Z":
          case "ZZ":
            return parseTokenTimezone;

          case "T":
            return parseTokenT;

          case "SSSS":
            return parseTokenDigits;

          case "MM":
          case "DD":
          case "YY":
          case "GG":
          case "gg":
          case "HH":
          case "hh":
          case "mm":
          case "ss":
          case "ww":
          case "WW":
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;

          case "M":
          case "D":
          case "d":
          case "H":
          case "h":
          case "m":
          case "s":
          case "w":
          case "W":
          case "e":
          case "E":
            return parseTokenOneOrTwoDigits;

          default:
            a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
            return a;
        }
    }
    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ], minutes = +(60 * parts[1]) + toInt(parts[2]);
        return "+" === parts[0] ? -minutes : minutes;
    }
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;
        switch (token) {
          case "M":
          case "MM":
            null != input && (datePartArray[MONTH] = toInt(input) - 1);
            break;

          case "MMM":
          case "MMMM":
            a = getLangDefinition(config._l).monthsParse(input);
            null != a ? datePartArray[MONTH] = a : config._pf.invalidMonth = input;
            break;

          case "D":
          case "DD":
            null != input && (datePartArray[DATE] = toInt(input));
            break;

          case "DDD":
          case "DDDD":
            null != input && (config._dayOfYear = toInt(input));
            break;

          case "YY":
            datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
            break;

          case "YYYY":
          case "YYYYY":
          case "YYYYYY":
            datePartArray[YEAR] = toInt(input);
            break;

          case "a":
          case "A":
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;

          case "H":
          case "HH":
          case "h":
          case "hh":
            datePartArray[HOUR] = toInt(input);
            break;

          case "m":
          case "mm":
            datePartArray[MINUTE] = toInt(input);
            break;

          case "s":
          case "ss":
            datePartArray[SECOND] = toInt(input);
            break;

          case "S":
          case "SS":
          case "SSS":
          case "SSSS":
            datePartArray[MILLISECOND] = toInt(1e3 * ("0." + input));
            break;

          case "X":
            config._d = new Date(1e3 * parseFloat(input));
            break;

          case "Z":
          case "ZZ":
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;

          case "w":
          case "ww":
          case "W":
          case "WW":
          case "d":
          case "dd":
          case "ddd":
          case "dddd":
          case "e":
          case "E":
            token = token.substr(0, 1);

          case "gg":
          case "gggg":
          case "GG":
          case "GGGG":
          case "GGGGG":
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = input;
            }
        }
    }
    function dateFromConfig(config) {
        var i, date, currentDate, yearToUse, fixYear, w, temp, lang, weekday, week, input = [];
        if (config._d) return;
        currentDate = currentDateArray(config);
        if (config._w && null == config._a[DATE] && null == config._a[MONTH]) {
            fixYear = function(val) {
                var int_val = parseInt(val, 10);
                return val ? 3 > val.length ? int_val > 68 ? 1900 + int_val : 2e3 + int_val : int_val : null == config._a[YEAR] ? moment().weekYear() : config._a[YEAR];
            };
            w = config._w;
            if (null != w.GG || null != w.W || null != w.E) temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1); else {
                lang = getLangDefinition(config._l);
                weekday = null != w.d ? parseWeekday(w.d, lang) : null != w.e ? parseInt(w.e, 10) + lang._week.dow : 0;
                week = parseInt(w.w, 10) || 1;
                null != w.d && lang._week.dow > weekday && week++;
                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
            }
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
        if (config._dayOfYear) {
            yearToUse = null == config._a[YEAR] ? currentDate[YEAR] : config._a[YEAR];
            config._dayOfYear > daysInYear(yearToUse) && (config._pf._overflowDayOfYear = true);
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; 3 > i && null == config._a[i]; ++i) config._a[i] = input[i] = currentDate[i];
        for (;7 > i; i++) config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    }
    function dateFromObject(config) {
        var normalizedInput;
        if (config._d) return;
        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ];
        dateFromConfig(config);
    }
    function currentDateArray(config) {
        var now = new Date();
        return config._useUTC ? [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ] : [ now.getFullYear(), now.getMonth(), now.getDate() ];
    }
    function makeDateFromStringAndFormat(config) {
        config._a = [];
        config._pf.empty = true;
        var i, parsedInput, tokens, token, skipped, lang = getLangDefinition(config._l), string = "" + config._i, stringLength = string.length, totalParsedInputLength = 0;
        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
        for (i = 0; tokens.length > i; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                skipped.length > 0 && config._pf.unusedInput.push(skipped);
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                parsedInput ? config._pf.empty = false : config._pf.unusedTokens.push(token);
                addTimeToArrayFromToken(token, parsedInput, config);
            } else config._strict && !parsedInput && config._pf.unusedTokens.push(token);
        }
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        string.length > 0 && config._pf.unusedInput.push(string);
        config._isPm && 12 > config._a[HOUR] && (config._a[HOUR] += 12);
        false === config._isPm && 12 === config._a[HOUR] && (config._a[HOUR] = 0);
        dateFromConfig(config);
        checkOverflow(config);
    }
    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function makeDateFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (0 === config._f.length) {
            config._pf.invalidFormat = true;
            config._d = new Date(0/0);
            return;
        }
        for (i = 0; config._f.length > i; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig)) continue;
            currentScore += tempConfig._pf.charsLeftOver;
            currentScore += 10 * tempConfig._pf.unusedTokens.length;
            tempConfig._pf.score = currentScore;
            if (null == scoreToBeat || scoreToBeat > currentScore) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }
    function makeDateFromString(config) {
        var i, l, string = config._i, match = isoRegex.exec(string);
        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; l > i; i++) if (isoDates[i][1].exec(string)) {
                config._f = isoDates[i][0] + (match[6] || " ");
                break;
            }
            for (i = 0, l = isoTimes.length; l > i; i++) if (isoTimes[i][1].exec(string)) {
                config._f += isoTimes[i][0];
                break;
            }
            string.match(parseTokenTimezone) && (config._f += "Z");
            makeDateFromStringAndFormat(config);
        } else config._d = new Date(string);
    }
    function makeDateFromInput(config) {
        var input = config._i, matched = aspNetJsonRegex.exec(input);
        if (input === undefined) config._d = new Date(); else if (matched) config._d = new Date(+matched[1]); else if ("string" == typeof input) makeDateFromString(config); else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else isDate(input) ? config._d = new Date(+input) : "object" == typeof input ? dateFromObject(config) : config._d = new Date(input);
    }
    function makeDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        1970 > y && date.setFullYear(y);
        return date;
    }
    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        1970 > y && date.setUTCFullYear(y);
        return date;
    }
    function parseWeekday(input, language) {
        if ("string" == typeof input) if (isNaN(input)) {
            input = language.weekdaysParse(input);
            if ("number" != typeof input) return null;
        } else input = parseInt(input, 10);
        return input;
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1e3), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = 45 > seconds && [ "s", seconds ] || 1 === minutes && [ "m" ] || 45 > minutes && [ "mm", minutes ] || 1 === hours && [ "h" ] || 22 > hours && [ "hh", hours ] || 1 === days && [ "d" ] || 25 >= days && [ "dd", days ] || 45 >= days && [ "M" ] || 345 > days && [ "MM", round(days / 30) ] || 1 === years && [ "y" ] || [ "yy", years ];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var adjustedMoment, end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();
        daysToDayOfWeek > end && (daysToDayOfWeek -= 7);
        end - 7 > daysToDayOfWeek && (daysToDayOfWeek += 7);
        adjustedMoment = moment(mom).add("d", daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var daysToAdd, dayOfYear, d = makeUTCDate(year, 0, 1).getUTCDay();
        weekday = null != weekday ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (firstDayOfWeek > d ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }
    function makeMoment(config) {
        var input = config._i, format = config._f;
        if (null === input) return moment.invalid({
            nullInput: true
        });
        "string" == typeof input && (config._i = input = getLangDefinition().preparse(input));
        if (moment.isMoment(input)) {
            config = cloneMoment(input);
            config._d = new Date(+input._d);
        } else format ? isArray(format) ? makeDateFromStringAndArray(config) : makeDateFromStringAndFormat(config) : makeDateFromInput(config);
        return new Moment(config);
    }
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + "s"] = function(input) {
            var utc = this._isUTC ? "UTC" : "";
            if (null != input) {
                this._d["set" + utc + key](input);
                moment.updateOffset(this);
                return this;
            }
            return this._d["get" + utc + key]();
        };
    }
    function makeDurationGetter(name) {
        moment.duration.fn[name] = function() {
            return this._data[name];
        };
    }
    function makeDurationAsGetter(name, factor) {
        moment.duration.fn["as" + name] = function() {
            return +this / factor;
        };
    }
    function makeGlobal(deprecate) {
        var warned = false, local_moment = moment;
        if ("undefined" != typeof ender) return;
        if (deprecate) {
            global.moment = function() {
                if (!warned && console && console.warn) {
                    warned = true;
                    console.warn("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.");
                }
                return local_moment.apply(null, arguments);
            };
            extend(global.moment, local_moment);
        } else global["moment"] = moment;
    }
    var moment, i, VERSION = "2.5.1", global = this, round = Math.round, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
        _isAMomentObject: null,
        _i: null,
        _f: null,
        _l: null,
        _strict: null,
        _isUTC: null,
        _offset: null,
        _pf: null,
        _lang: null
    }, hasModule = "undefined" != typeof module && module.exports && "undefined" != typeof require, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = "YYYY-MM-DDTHH:mm:ssZ", isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ], isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), unitMillisecondFactors = {
        Milliseconds: 1,
        Seconds: 1e3,
        Minutes: 6e4,
        Hours: 36e5,
        Days: 864e5,
        Months: 2592e6,
        Years: 31536e6
    }, unitAliases = {
        ms: "millisecond",
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
        D: "date",
        w: "week",
        W: "isoWeek",
        M: "month",
        y: "year",
        DDD: "dayOfYear",
        e: "weekday",
        E: "isoWeekday",
        gg: "weekYear",
        GG: "isoWeekYear"
    }, camelFunctions = {
        dayofyear: "dayOfYear",
        isoweekday: "isoWeekday",
        isoweek: "isoWeek",
        weekyear: "weekYear",
        isoweekyear: "isoWeekYear"
    }, formatFunctions = {}, ordinalizeTokens = "DDD w W M D d".split(" "), paddedTokens = "M D H h m s w W".split(" "), formatTokenFunctions = {
        M: function() {
            return this.month() + 1;
        },
        MMM: function(format) {
            return this.lang().monthsShort(this, format);
        },
        MMMM: function(format) {
            return this.lang().months(this, format);
        },
        D: function() {
            return this.date();
        },
        DDD: function() {
            return this.dayOfYear();
        },
        d: function() {
            return this.day();
        },
        dd: function(format) {
            return this.lang().weekdaysMin(this, format);
        },
        ddd: function(format) {
            return this.lang().weekdaysShort(this, format);
        },
        dddd: function(format) {
            return this.lang().weekdays(this, format);
        },
        w: function() {
            return this.week();
        },
        W: function() {
            return this.isoWeek();
        },
        YY: function() {
            return leftZeroFill(this.year() % 100, 2);
        },
        YYYY: function() {
            return leftZeroFill(this.year(), 4);
        },
        YYYYY: function() {
            return leftZeroFill(this.year(), 5);
        },
        YYYYYY: function() {
            var y = this.year(), sign = y >= 0 ? "+" : "-";
            return sign + leftZeroFill(Math.abs(y), 6);
        },
        gg: function() {
            return leftZeroFill(this.weekYear() % 100, 2);
        },
        gggg: function() {
            return leftZeroFill(this.weekYear(), 4);
        },
        ggggg: function() {
            return leftZeroFill(this.weekYear(), 5);
        },
        GG: function() {
            return leftZeroFill(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 4);
        },
        GGGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 5);
        },
        e: function() {
            return this.weekday();
        },
        E: function() {
            return this.isoWeekday();
        },
        a: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), true);
        },
        A: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), false);
        },
        H: function() {
            return this.hours();
        },
        h: function() {
            return this.hours() % 12 || 12;
        },
        m: function() {
            return this.minutes();
        },
        s: function() {
            return this.seconds();
        },
        S: function() {
            return toInt(this.milliseconds() / 100);
        },
        SS: function() {
            return leftZeroFill(toInt(this.milliseconds() / 10), 2);
        },
        SSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        SSSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        Z: function() {
            var a = -this.zone(), b = "+";
            if (0 > a) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
        },
        ZZ: function() {
            var a = -this.zone(), b = "+";
            if (0 > a) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
        },
        z: function() {
            return this.zoneAbbr();
        },
        zz: function() {
            return this.zoneName();
        },
        X: function() {
            return this.unix();
        },
        Q: function() {
            return this.quarter();
        }
    }, lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ];
    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
    extend(Language.prototype, {
        set: function(config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                "function" == typeof prop ? this[i] = prop : this["_" + i] = prop;
            }
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(m) {
            return this._months[m.month()];
        },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(m) {
            return this._monthsShort[m.month()];
        },
        monthsParse: function(monthName) {
            var i, mom, regex;
            this._monthsParse || (this._monthsParse = []);
            for (i = 0; 12 > i; i++) {
                if (!this._monthsParse[i]) {
                    mom = moment.utc([ 2e3, i ]);
                    regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
                    this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._monthsParse[i].test(monthName)) return i;
            }
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(m) {
            return this._weekdays[m.day()];
        },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(m) {
            return this._weekdaysShort[m.day()];
        },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(m) {
            return this._weekdaysMin[m.day()];
        },
        weekdaysParse: function(weekdayName) {
            var i, mom, regex;
            this._weekdaysParse || (this._weekdaysParse = []);
            for (i = 0; 7 > i; i++) {
                if (!this._weekdaysParse[i]) {
                    mom = moment([ 2e3, 1 ]).day(i);
                    regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
                    this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._weekdaysParse[i].test(weekdayName)) return i;
            }
        },
        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function(key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },
        isPM: function(input) {
            return "p" === (input + "").toLowerCase().charAt(0);
        },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(hours, minutes, isLower) {
            return hours > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
        },
        _calendar: {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
        },
        calendar: function(key, mom) {
            var output = this._calendar[key];
            return "function" == typeof output ? output.apply(mom) : output;
        },
        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return "function" == typeof output ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
        },
        pastFuture: function(diff, output) {
            var format = this._relativeTime[diff > 0 ? "future" : "past"];
            return "function" == typeof format ? format(output) : format.replace(/%s/i, output);
        },
        ordinal: function(number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal: "%d",
        preparse: function(string) {
            return string;
        },
        postformat: function(string) {
            return string;
        },
        week: function(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week: {
            dow: 0,
            doy: 6
        },
        _invalidDate: "Invalid date",
        invalidDate: function() {
            return this._invalidDate;
        }
    });
    moment = function(input, format, lang, strict) {
        var c;
        if ("boolean" == typeof lang) {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();
        return makeMoment(c);
    };
    moment.utc = function(input, format, lang, strict) {
        var c;
        if ("boolean" == typeof lang) {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();
        return makeMoment(c).utc();
    };
    moment.unix = function(input) {
        return moment(1e3 * input);
    };
    moment.duration = function(input, key) {
        var sign, ret, parseIso, duration = input, match = null;
        if (moment.isDuration(input)) duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
        }; else if ("number" == typeof input) {
            duration = {};
            key ? duration[key] = input : duration.milliseconds = input;
        } else if (!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            if (!!(match = isoDurationRegex.exec(input))) {
                sign = "-" === match[1] ? -1 : 1;
                parseIso = function(inp) {
                    var res = inp && parseFloat(inp.replace(",", "."));
                    return (isNaN(res) ? 0 : res) * sign;
                };
                duration = {
                    y: parseIso(match[2]),
                    M: parseIso(match[3]),
                    d: parseIso(match[4]),
                    h: parseIso(match[5]),
                    m: parseIso(match[6]),
                    s: parseIso(match[7]),
                    w: parseIso(match[8])
                };
            }
        } else {
            sign = "-" === match[1] ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        }
        ret = new Duration(duration);
        moment.isDuration(input) && input.hasOwnProperty("_lang") && (ret._lang = input._lang);
        return ret;
    };
    moment.version = VERSION;
    moment.defaultFormat = isoFormat;
    moment.updateOffset = function() {};
    moment.lang = function(key, values) {
        var r;
        if (!key) return moment.fn._lang._abbr;
        if (values) loadLang(normalizeLanguage(key), values); else if (null === values) {
            unloadLang(key);
            key = "en";
        } else languages[key] || getLangDefinition(key);
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };
    moment.langData = function(key) {
        key && key._lang && key._lang._abbr && (key = key._lang._abbr);
        return getLangDefinition(key);
    };
    moment.isMoment = function(obj) {
        return obj instanceof Moment || null != obj && obj.hasOwnProperty("_isAMomentObject");
    };
    moment.isDuration = function(obj) {
        return obj instanceof Duration;
    };
    for (i = lists.length - 1; i >= 0; --i) makeList(lists[i]);
    moment.normalizeUnits = function(units) {
        return normalizeUnits(units);
    };
    moment.invalid = function(flags) {
        var m = moment.utc(0/0);
        null != flags ? extend(m._pf, flags) : m._pf.userInvalidated = true;
        return m;
    };
    moment.parseZone = function(input) {
        return moment(input).parseZone();
    };
    extend(moment.fn = Moment.prototype, {
        clone: function() {
            return moment(this);
        },
        valueOf: function() {
            return +this._d + 6e4 * (this._offset || 0);
        },
        unix: function() {
            return Math.floor(+this / 1e3);
        },
        toString: function() {
            return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },
        toDate: function() {
            return this._offset ? new Date(+this) : this._d;
        },
        toISOString: function() {
            var m = moment(this).utc();
            return m.year() > 0 && 9999 >= m.year() ? formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
        },
        toArray: function() {
            var m = this;
            return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
        },
        isValid: function() {
            return isValid(this);
        },
        isDSTShifted: function() {
            if (this._a) return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            return false;
        },
        parsingFlags: function() {
            return extend({}, this._pf);
        },
        invalidAt: function() {
            return this._pf.overflow;
        },
        utc: function() {
            return this.zone(0);
        },
        local: function() {
            this.zone(0);
            this._isUTC = false;
            return this;
        },
        format: function(inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur;
            dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val);
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },
        subtract: function(input, val) {
            var dur;
            dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val);
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },
        diff: function(input, units, asFloat) {
            var diff, output, that = makeAs(input, this), zoneDiff = 6e4 * (this.zone() - that.zone());
            units = normalizeUnits(units);
            if ("year" === units || "month" === units) {
                diff = 432e5 * (this.daysInMonth() + that.daysInMonth());
                output = 12 * (this.year() - that.year()) + (this.month() - that.month());
                output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff;
                output -= 6e4 * (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) / diff;
                "year" === units && (output /= 12);
            } else {
                diff = this - that;
                output = "second" === units ? diff / 1e3 : "minute" === units ? diff / 6e4 : "hour" === units ? diff / 36e5 : "day" === units ? (diff - zoneDiff) / 864e5 : "week" === units ? (diff - zoneDiff) / 6048e5 : diff;
            }
            return asFloat ? output : absRound(output);
        },
        from: function(time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },
        fromNow: function(withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },
        calendar: function() {
            var sod = makeAs(moment(), this).startOf("day"), diff = this.diff(sod, "days", true), format = -6 > diff ? "sameElse" : -1 > diff ? "lastWeek" : 0 > diff ? "lastDay" : 1 > diff ? "sameDay" : 2 > diff ? "nextDay" : 7 > diff ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(format, this));
        },
        isLeapYear: function() {
            return isLeapYear(this.year());
        },
        isDST: function() {
            return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
        },
        day: function(input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (null != input) {
                input = parseWeekday(input, this.lang());
                return this.add({
                    d: input - day
                });
            }
            return day;
        },
        month: function(input) {
            var dayOfMonth, utc = this._isUTC ? "UTC" : "";
            if (null != input) {
                if ("string" == typeof input) {
                    input = this.lang().monthsParse(input);
                    if ("number" != typeof input) return this;
                }
                dayOfMonth = this.date();
                this.date(1);
                this._d["set" + utc + "Month"](input);
                this.date(Math.min(dayOfMonth, this.daysInMonth()));
                moment.updateOffset(this);
                return this;
            }
            return this._d["get" + utc + "Month"]();
        },
        startOf: function(units) {
            units = normalizeUnits(units);
            switch (units) {
              case "year":
                this.month(0);

              case "month":
                this.date(1);

              case "week":
              case "isoWeek":
              case "day":
                this.hours(0);

              case "hour":
                this.minutes(0);

              case "minute":
                this.seconds(0);

              case "second":
                this.milliseconds(0);
            }
            "week" === units ? this.weekday(0) : "isoWeek" === units && this.isoWeekday(1);
            return this;
        },
        endOf: function(units) {
            units = normalizeUnits(units);
            return this.startOf(units).add("isoWeek" === units ? "week" : units, 1).subtract("ms", 1);
        },
        isAfter: function(input, units) {
            units = "undefined" != typeof units ? units : "millisecond";
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },
        isBefore: function(input, units) {
            units = "undefined" != typeof units ? units : "millisecond";
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },
        isSame: function(input, units) {
            units = units || "ms";
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },
        min: function(other) {
            other = moment.apply(null, arguments);
            return this > other ? this : other;
        },
        max: function(other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },
        zone: function(input) {
            var offset = this._offset || 0;
            if (null == input) return this._isUTC ? offset : this._d.getTimezoneOffset();
            "string" == typeof input && (input = timezoneMinutesFromString(input));
            16 > Math.abs(input) && (input = 60 * input);
            this._offset = input;
            this._isUTC = true;
            offset !== input && addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, true);
            return this;
        },
        zoneAbbr: function() {
            return this._isUTC ? "UTC" : "";
        },
        zoneName: function() {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },
        parseZone: function() {
            this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i);
            return this;
        },
        hasAlignedHourOffset: function(input) {
            input = input ? moment(input).zone() : 0;
            return 0 === (this.zone() - input) % 60;
        },
        daysInMonth: function() {
            return daysInMonth(this.year(), this.month());
        },
        dayOfYear: function(input) {
            var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
            return null == input ? dayOfYear : this.add("d", input - dayOfYear);
        },
        quarter: function() {
            return Math.ceil((this.month() + 1) / 3);
        },
        weekYear: function(input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return null == input ? year : this.add("y", input - year);
        },
        isoWeekYear: function(input) {
            var year = weekOfYear(this, 1, 4).year;
            return null == input ? year : this.add("y", input - year);
        },
        week: function(input) {
            var week = this.lang().week(this);
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        isoWeek: function(input) {
            var week = weekOfYear(this, 1, 4).week;
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        weekday: function(input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return null == input ? weekday : this.add("d", input - weekday);
        },
        isoWeekday: function(input) {
            return null == input ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units]();
        },
        set: function(units, value) {
            units = normalizeUnits(units);
            "function" == typeof this[units] && this[units](value);
            return this;
        },
        lang: function(key) {
            if (key === undefined) return this._lang;
            this._lang = getLangDefinition(key);
            return this;
        }
    });
    for (i = 0; proxyGettersAndSetters.length > i; i++) makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ""), proxyGettersAndSetters[i]);
    makeGetterAndSetter("year", "FullYear");
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.toJSON = moment.fn.toISOString;
    extend(moment.duration.fn = Duration.prototype, {
        _bubble: function() {
            var seconds, minutes, hours, years, milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data;
            data.milliseconds = milliseconds % 1e3;
            seconds = absRound(milliseconds / 1e3);
            data.seconds = seconds % 60;
            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;
            hours = absRound(minutes / 60);
            data.hours = hours % 24;
            days += absRound(hours / 24);
            data.days = days % 30;
            months += absRound(days / 30);
            data.months = months % 12;
            years = absRound(months / 12);
            data.years = years;
        },
        weeks: function() {
            return absRound(this.days() / 7);
        },
        valueOf: function() {
            return this._milliseconds + 864e5 * this._days + 2592e6 * (this._months % 12) + 31536e6 * toInt(this._months / 12);
        },
        humanize: function(withSuffix) {
            var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
            withSuffix && (output = this.lang().pastFuture(difference, output));
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;
            this._bubble();
            return this;
        },
        subtract: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;
            this._bubble();
            return this;
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + "s"]();
        },
        as: function(units) {
            units = normalizeUnits(units);
            return this["as" + units.charAt(0).toUpperCase() + units.slice(1) + "s"]();
        },
        lang: moment.fn.lang,
        toIsoString: function() {
            var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
            if (!this.asSeconds()) return "P0D";
            return (0 > this.asSeconds() ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "");
        }
    });
    for (i in unitMillisecondFactors) if (unitMillisecondFactors.hasOwnProperty(i)) {
        makeDurationAsGetter(i, unitMillisecondFactors[i]);
        makeDurationGetter(i.toLowerCase());
    }
    makeDurationAsGetter("Weeks", 6048e5);
    moment.duration.fn.asMonths = function() {
        return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years();
    };
    moment.lang("en", {
        ordinal: function(number) {
            var b = number % 10, output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
            return number + output;
        }
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ar-ma", {
            months: "ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±".split("_"),
            monthsShort: "ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±".split("_"),
            weekdays: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥ØªÙ†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
            weekdaysShort: "Ø§Ø­Ø¯_Ø§ØªÙ†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª".split("_"),
            weekdaysMin: "Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                nextDay: "[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                nextWeek: "dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                lastDay: "[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                lastWeek: "dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "ÙÙŠ %s",
                past: "Ù…Ù†Ø° %s",
                s: "Ø«ÙˆØ§Ù†",
                m: "Ø¯Ù‚ÙŠÙ‚Ø©",
                mm: "%d Ø¯Ù‚Ø§Ø¦Ù‚",
                h: "Ø³Ø§Ø¹Ø©",
                hh: "%d Ø³Ø§Ø¹Ø§Øª",
                d: "ÙŠÙˆÙ…",
                dd: "%d Ø£ÙŠØ§Ù…",
                M: "Ø´Ù‡Ø±",
                MM: "%d Ø£Ø´Ù‡Ø±",
                y: "Ø³Ù†Ø©",
                yy: "%d Ø³Ù†ÙˆØ§Øª"
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ar", {
            months: "ÙŠÙ†Ø§ÙŠØ±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_ÙØ¨Ø±Ø§ÙŠØ±/ Ø´Ø¨Ø§Ø·_Ù…Ø§Ø±Ø³/ Ø¢Ø°Ø§Ø±_Ø£Ø¨Ø±ÙŠÙ„/ Ù†ÙŠØ³Ø§Ù†_Ù…Ø§ÙŠÙˆ/ Ø£ÙŠØ§Ø±_ÙŠÙˆÙ†ÙŠÙˆ/ Ø­Ø²ÙŠØ±Ø§Ù†_ÙŠÙˆÙ„ÙŠÙˆ/ ØªÙ…ÙˆØ²_Ø£ØºØ³Ø·Ø³/ Ø¢Ø¨_Ø³Ø¨ØªÙ…Ø¨Ø±/ Ø£ÙŠÙ„ÙˆÙ„_Ø£ÙƒØªÙˆØ¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø£ÙˆÙ„_Ù†ÙˆÙÙ…Ø¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_Ø¯ÙŠØ³Ù…Ø¨Ø±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„".split("_"),
            monthsShort: "ÙŠÙ†Ø§ÙŠØ±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_ÙØ¨Ø±Ø§ÙŠØ±/ Ø´Ø¨Ø§Ø·_Ù…Ø§Ø±Ø³/ Ø¢Ø°Ø§Ø±_Ø£Ø¨Ø±ÙŠÙ„/ Ù†ÙŠØ³Ø§Ù†_Ù…Ø§ÙŠÙˆ/ Ø£ÙŠØ§Ø±_ÙŠÙˆÙ†ÙŠÙˆ/ Ø­Ø²ÙŠØ±Ø§Ù†_ÙŠÙˆÙ„ÙŠÙˆ/ ØªÙ…ÙˆØ²_Ø£ØºØ³Ø·Ø³/ Ø¢Ø¨_Ø³Ø¨ØªÙ…Ø¨Ø±/ Ø£ÙŠÙ„ÙˆÙ„_Ø£ÙƒØªÙˆØ¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø£ÙˆÙ„_Ù†ÙˆÙÙ…Ø¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_Ø¯ÙŠØ³Ù…Ø¨Ø±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„".split("_"),
            weekdays: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
            weekdaysShort: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
            weekdaysMin: "Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Ø§Ù„ÙŠÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                nextDay: "[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                nextWeek: "dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                lastDay: "[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                lastWeek: "dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "ÙÙŠ %s",
                past: "Ù…Ù†Ø° %s",
                s: "Ø«ÙˆØ§Ù†",
                m: "Ø¯Ù‚ÙŠÙ‚Ø©",
                mm: "%d Ø¯Ù‚Ø§Ø¦Ù‚",
                h: "Ø³Ø§Ø¹Ø©",
                hh: "%d Ø³Ø§Ø¹Ø§Øª",
                d: "ÙŠÙˆÙ…",
                dd: "%d Ø£ÙŠØ§Ù…",
                M: "Ø´Ù‡Ø±",
                MM: "%d Ø£Ø´Ù‡Ø±",
                y: "Ø³Ù†Ø©",
                yy: "%d Ø³Ù†ÙˆØ§Øª"
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("bg", {
            months: "ÑÐ½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸".split("_"),
            monthsShort: "ÑÐ½Ñ€_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº".split("_"),
            weekdays: "Ð½ÐµÐ´ÐµÐ»Ñ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÑÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÑŠÑ€Ñ‚ÑŠÐº_Ð¿ÐµÑ‚ÑŠÐº_ÑÑŠÐ±Ð¾Ñ‚Ð°".split("_"),
            weekdaysShort: "Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ñ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÑŠÐ±".split("_"),
            weekdaysMin: "Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "D.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Ð”Ð½ÐµÑ Ð²] LT",
                nextDay: "[Ð£Ñ‚Ñ€Ðµ Ð²] LT",
                nextWeek: "dddd [Ð²] LT",
                lastDay: "[Ð’Ñ‡ÐµÑ€Ð° Ð²] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                      case 6:
                        return "[Ð’ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ð»Ð°Ñ‚Ð°] dddd [Ð²] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[Ð’ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ð»Ð¸Ñ] dddd [Ð²] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "ÑÐ»ÐµÐ´ %s",
                past: "Ð¿Ñ€ÐµÐ´Ð¸ %s",
                s: "Ð½ÑÐºÐ¾Ð»ÐºÐ¾ ÑÐµÐºÑƒÐ½Ð´Ð¸",
                m: "Ð¼Ð¸Ð½ÑƒÑ‚Ð°",
                mm: "%d Ð¼Ð¸Ð½ÑƒÑ‚Ð¸",
                h: "Ñ‡Ð°Ñ",
                hh: "%d Ñ‡Ð°ÑÐ°",
                d: "Ð´ÐµÐ½",
                dd: "%d Ð´Ð½Ð¸",
                M: "Ð¼ÐµÑÐµÑ†",
                MM: "%d Ð¼ÐµÑÐµÑ†Ð°",
                y: "Ð³Ð¾Ð´Ð¸Ð½Ð°",
                yy: "%d Ð³Ð¾Ð´Ð¸Ð½Ð¸"
            },
            ordinal: function(number) {
                var lastDigit = number % 10, last2Digits = number % 100;
                return 0 === number ? number + "-ÐµÐ²" : 0 === last2Digits ? number + "-ÐµÐ½" : last2Digits > 10 && 20 > last2Digits ? number + "-Ñ‚Ð¸" : 1 === lastDigit ? number + "-Ð²Ð¸" : 2 === lastDigit ? number + "-Ñ€Ð¸" : 7 === lastDigit || 8 === lastDigit ? number + "-Ð¼Ð¸" : number + "-Ñ‚Ð¸";
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function relativeTimeWithMutation(number, withoutSuffix, key) {
            var format = {
                mm: "munutenn",
                MM: "miz",
                dd: "devezh"
            };
            return number + " " + mutation(format[key], number);
        }
        function specialMutationForYears(number) {
            switch (lastNumber(number)) {
              case 1:
              case 3:
              case 4:
              case 5:
              case 9:
                return number + " bloaz";

              default:
                return number + " vloaz";
            }
        }
        function lastNumber(number) {
            if (number > 9) return lastNumber(number % 10);
            return number;
        }
        function mutation(text, number) {
            if (2 === number) return softMutation(text);
            return text;
        }
        function softMutation(text) {
            var mutationTable = {
                m: "v",
                b: "v",
                d: "z"
            };
            if (mutationTable[text.charAt(0)] === undefined) return text;
            return mutationTable[text.charAt(0)] + text.substring(1);
        }
        return moment.lang("br", {
            months: "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split("_"),
            monthsShort: "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split("_"),
            weekdays: "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split("_"),
            weekdaysShort: "Sul_Lun_Meu_Mer_Yao_Gwe_Sad".split("_"),
            weekdaysMin: "Su_Lu_Me_Mer_Ya_Gw_Sa".split("_"),
            longDateFormat: {
                LT: "h[e]mm A",
                L: "DD/MM/YYYY",
                LL: "D [a viz] MMMM YYYY",
                LLL: "D [a viz] MMMM YYYY LT",
                LLLL: "dddd, D [a viz] MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Hiziv da] LT",
                nextDay: "[Warc'hoazh da] LT",
                nextWeek: "dddd [da] LT",
                lastDay: "[Dec'h da] LT",
                lastWeek: "dddd [paset da] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "a-benn %s",
                past: "%s 'zo",
                s: "un nebeud segondennoÃ¹",
                m: "ur vunutenn",
                mm: relativeTimeWithMutation,
                h: "un eur",
                hh: "%d eur",
                d: "un devezh",
                dd: relativeTimeWithMutation,
                M: "ur miz",
                MM: relativeTimeWithMutation,
                y: "ur bloaz",
                yy: specialMutationForYears
            },
            ordinal: function(number) {
                var output = 1 === number ? "aÃ±" : "vet";
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "jedna minuta" : "jedne minute";

              case "mm":
                result += 1 === number ? "minuta" : 2 === number || 3 === number || 4 === number ? "minute" : "minuta";
                return result;

              case "h":
                return withoutSuffix ? "jedan sat" : "jednog sata";

              case "hh":
                result += 1 === number ? "sat" : 2 === number || 3 === number || 4 === number ? "sata" : "sati";
                return result;

              case "dd":
                result += 1 === number ? "dan" : "dana";
                return result;

              case "MM":
                result += 1 === number ? "mjesec" : 2 === number || 3 === number || 4 === number ? "mjeseca" : "mjeseci";
                return result;

              case "yy":
                result += 1 === number ? "godina" : 2 === number || 3 === number || 4 === number ? "godine" : "godina";
                return result;
            }
        }
        return moment.lang("bs", {
            months: "januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar".split("_"),
            monthsShort: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
            weekdays: "nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota".split("_"),
            weekdaysShort: "ned._pon._uto._sri._Äet._pet._sub.".split("_"),
            weekdaysMin: "ne_po_ut_sr_Äe_pe_su".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[danas u] LT",
                nextDay: "[sutra u] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[u] [nedjelju] [u] LT";

                      case 3:
                        return "[u] [srijedu] [u] LT";

                      case 6:
                        return "[u] [subotu] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[u] dddd [u] LT";
                    }
                },
                lastDay: "[juÄer u] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                        return "[proÅ¡lu] dddd [u] LT";

                      case 6:
                        return "[proÅ¡le] [subote] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[proÅ¡li] dddd [u] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "prije %s",
                s: "par sekundi",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "dan",
                dd: translate,
                M: "mjesec",
                MM: translate,
                y: "godinu",
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ca", {
            months: "gener_febrer_marÃ§_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre".split("_"),
            monthsShort: "gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.".split("_"),
            weekdays: "diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte".split("_"),
            weekdaysShort: "dg._dl._dt._dc._dj._dv._ds.".split("_"),
            weekdaysMin: "Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: function() {
                    return "[avui a " + (1 !== this.hours() ? "les" : "la") + "] LT";
                },
                nextDay: function() {
                    return "[demÃ  a " + (1 !== this.hours() ? "les" : "la") + "] LT";
                },
                nextWeek: function() {
                    return "dddd [a " + (1 !== this.hours() ? "les" : "la") + "] LT";
                },
                lastDay: function() {
                    return "[ahir a " + (1 !== this.hours() ? "les" : "la") + "] LT";
                },
                lastWeek: function() {
                    return "[el] dddd [passat a " + (1 !== this.hours() ? "les" : "la") + "] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "en %s",
                past: "fa %s",
                s: "uns segons",
                m: "un minut",
                mm: "%d minuts",
                h: "una hora",
                hh: "%d hores",
                d: "un dia",
                dd: "%d dies",
                M: "un mes",
                MM: "%d mesos",
                y: "un any",
                yy: "%d anys"
            },
            ordinal: "%dÂº",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(n) {
            return n > 1 && 5 > n && 1 !== ~~(n / 10);
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "pÃ¡r vteÅ™in" : "pÃ¡r vteÅ™inami";

              case "m":
                return withoutSuffix ? "minuta" : isFuture ? "minutu" : "minutou";

              case "mm":
                return withoutSuffix || isFuture ? result + (plural(number) ? "minuty" : "minut") : result + "minutami";

              case "h":
                return withoutSuffix ? "hodina" : isFuture ? "hodinu" : "hodinou";

              case "hh":
                return withoutSuffix || isFuture ? result + (plural(number) ? "hodiny" : "hodin") : result + "hodinami";

              case "d":
                return withoutSuffix || isFuture ? "den" : "dnem";

              case "dd":
                return withoutSuffix || isFuture ? result + (plural(number) ? "dny" : "dnÃ­") : result + "dny";

              case "M":
                return withoutSuffix || isFuture ? "mÄ›sÃ­c" : "mÄ›sÃ­cem";

              case "MM":
                return withoutSuffix || isFuture ? result + (plural(number) ? "mÄ›sÃ­ce" : "mÄ›sÃ­cÅ¯") : result + "mÄ›sÃ­ci";

              case "y":
                return withoutSuffix || isFuture ? "rok" : "rokem";

              case "yy":
                return withoutSuffix || isFuture ? result + (plural(number) ? "roky" : "let") : result + "lety";
            }
        }
        var months = "leden_Ãºnor_bÅ™ezen_duben_kvÄ›ten_Äerven_Äervenec_srpen_zÃ¡Å™Ã­_Å™Ã­jen_listopad_prosinec".split("_"), monthsShort = "led_Ãºno_bÅ™e_dub_kvÄ›_Ävn_Ävc_srp_zÃ¡Å™_Å™Ã­j_lis_pro".split("_");
        return moment.lang("cs", {
            months: months,
            monthsShort: monthsShort,
            monthsParse: function(months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; 12 > i; i++) _monthsParse[i] = new RegExp("^" + months[i] + "$|^" + monthsShort[i] + "$", "i");
                return _monthsParse;
            }(months, monthsShort),
            weekdays: "nedÄ›le_pondÄ›lÃ­_ÃºterÃ½_stÅ™eda_Ätvrtek_pÃ¡tek_sobota".split("_"),
            weekdaysShort: "ne_po_Ãºt_st_Ät_pÃ¡_so".split("_"),
            weekdaysMin: "ne_po_Ãºt_st_Ät_pÃ¡_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[dnes v] LT",
                nextDay: "[zÃ­tra v] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v nedÄ›li v] LT";

                      case 1:
                      case 2:
                        return "[v] dddd [v] LT";

                      case 3:
                        return "[ve stÅ™edu v] LT";

                      case 4:
                        return "[ve Ätvrtek v] LT";

                      case 5:
                        return "[v pÃ¡tek v] LT";

                      case 6:
                        return "[v sobotu v] LT";
                    }
                },
                lastDay: "[vÄera v] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[minulou nedÄ›li v] LT";

                      case 1:
                      case 2:
                        return "[minulÃ©] dddd [v] LT";

                      case 3:
                        return "[minulou stÅ™edu v] LT";

                      case 4:
                      case 5:
                        return "[minulÃ½] dddd [v] LT";

                      case 6:
                        return "[minulou sobotu v] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "pÅ™ed %s",
                s: translate,
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("cv", {
            months: "ÐºÄƒÑ€Ð»Ð°Ñ‡_Ð½Ð°Ñ€ÄƒÑ_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ã§Ä•Ñ€Ñ‚Ð¼Ðµ_ÑƒÑ‚Äƒ_Ã§ÑƒÑ€Ð»Ð°_Ð°Ð²ÄƒÐ½_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°ÑˆÑ‚Ð°Ð²".split("_"),
            monthsShort: "ÐºÄƒÑ€_Ð½Ð°Ñ€_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ã§Ä•Ñ€_ÑƒÑ‚Äƒ_Ã§ÑƒÑ€_Ð°Ð²_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°Ñˆ".split("_"),
            weekdays: "Ð²Ñ‹Ñ€ÑÐ°Ñ€Ð½Ð¸ÐºÑƒÐ½_Ñ‚ÑƒÐ½Ñ‚Ð¸ÐºÑƒÐ½_Ñ‹Ñ‚Ð»Ð°Ñ€Ð¸ÐºÑƒÐ½_ÑŽÐ½ÐºÑƒÐ½_ÐºÄ•Ã§Ð½ÐµÑ€Ð½Ð¸ÐºÑƒÐ½_ÑÑ€Ð½ÐµÐºÑƒÐ½_ÑˆÄƒÐ¼Ð°Ñ‚ÐºÑƒÐ½".split("_"),
            weekdaysShort: "Ð²Ñ‹Ñ€_Ñ‚ÑƒÐ½_Ñ‹Ñ‚Ð»_ÑŽÐ½_ÐºÄ•Ã§_ÑÑ€Ð½_ÑˆÄƒÐ¼".split("_"),
            weekdaysMin: "Ð²Ñ€_Ñ‚Ð½_Ñ‹Ñ‚_ÑŽÐ½_ÐºÃ§_ÑÑ€_ÑˆÐ¼".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD-MM-YYYY",
                LL: "YYYY [Ã§ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹ÄƒÑ…Ä•Ð½] D[-Ð¼Ä•ÑˆÄ•]",
                LLL: "YYYY [Ã§ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹ÄƒÑ…Ä•Ð½] D[-Ð¼Ä•ÑˆÄ•], LT",
                LLLL: "dddd, YYYY [Ã§ÑƒÐ»Ñ…Ð¸] MMMM [ÑƒÐ¹ÄƒÑ…Ä•Ð½] D[-Ð¼Ä•ÑˆÄ•], LT"
            },
            calendar: {
                sameDay: "[ÐŸÐ°ÑÐ½] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]",
                nextDay: "[Ð«Ñ€Ð°Ð½] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]",
                lastDay: "[Ä”Ð½ÐµÑ€] LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]",
                nextWeek: "[Ã‡Ð¸Ñ‚ÐµÑ] dddd LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]",
                lastWeek: "[Ð˜Ñ€Ñ‚Ð½Ä•] dddd LT [ÑÐµÑ…ÐµÑ‚Ñ€Ðµ]",
                sameElse: "L"
            },
            relativeTime: {
                future: function(output) {
                    var affix = /ÑÐµÑ…ÐµÑ‚$/i.exec(output) ? "Ñ€ÐµÐ½" : /Ã§ÑƒÐ»$/i.exec(output) ? "Ñ‚Ð°Ð½" : "Ñ€Ð°Ð½";
                    return output + affix;
                },
                past: "%s ÐºÐ°ÑÐ»Ð»Ð°",
                s: "Ð¿Ä•Ñ€-Ð¸Ðº Ã§ÐµÐºÐºÑƒÐ½Ñ‚",
                m: "Ð¿Ä•Ñ€ Ð¼Ð¸Ð½ÑƒÑ‚",
                mm: "%d Ð¼Ð¸Ð½ÑƒÑ‚",
                h: "Ð¿Ä•Ñ€ ÑÐµÑ…ÐµÑ‚",
                hh: "%d ÑÐµÑ…ÐµÑ‚",
                d: "Ð¿Ä•Ñ€ ÐºÑƒÐ½",
                dd: "%d ÐºÑƒÐ½",
                M: "Ð¿Ä•Ñ€ ÑƒÐ¹ÄƒÑ…",
                MM: "%d ÑƒÐ¹ÄƒÑ…",
                y: "Ð¿Ä•Ñ€ Ã§ÑƒÐ»",
                yy: "%d Ã§ÑƒÐ»"
            },
            ordinal: "%d-Ð¼Ä•Ñˆ",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("cy", {
            months: "Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr".split("_"),
            monthsShort: "Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag".split("_"),
            weekdays: "Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn".split("_"),
            weekdaysShort: "Sul_Llun_Maw_Mer_Iau_Gwe_Sad".split("_"),
            weekdaysMin: "Su_Ll_Ma_Me_Ia_Gw_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Heddiw am] LT",
                nextDay: "[Yfory am] LT",
                nextWeek: "dddd [am] LT",
                lastDay: "[Ddoe am] LT",
                lastWeek: "dddd [diwethaf am] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "mewn %s",
                past: "%s yn Ã l",
                s: "ychydig eiliadau",
                m: "munud",
                mm: "%d munud",
                h: "awr",
                hh: "%d awr",
                d: "diwrnod",
                dd: "%d diwrnod",
                M: "mis",
                MM: "%d mis",
                y: "blwyddyn",
                yy: "%d flynedd"
            },
            ordinal: function(number) {
                var b = number, output = "", lookup = [ "", "af", "il", "ydd", "ydd", "ed", "ed", "ed", "fed", "fed", "fed", "eg", "fed", "eg", "eg", "fed", "eg", "eg", "fed", "eg", "fed" ];
                b > 20 ? output = 40 === b || 50 === b || 60 === b || 80 === b || 100 === b ? "fed" : "ain" : b > 0 && (output = lookup[b]);
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("da", {
            months: "januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),
            monthsShort: "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
            weekdays: "sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag".split("_"),
            weekdaysShort: "sÃ¸n_man_tir_ons_tor_fre_lÃ¸r".split("_"),
            weekdaysMin: "sÃ¸_ma_ti_on_to_fr_lÃ¸".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D. MMMM, YYYY LT"
            },
            calendar: {
                sameDay: "[I dag kl.] LT",
                nextDay: "[I morgen kl.] LT",
                nextWeek: "dddd [kl.] LT",
                lastDay: "[I gÃ¥r kl.] LT",
                lastWeek: "[sidste] dddd [kl] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "om %s",
                past: "%s siden",
                s: "fÃ¥ sekunder",
                m: "et minut",
                mm: "%d minutter",
                h: "en time",
                hh: "%d timer",
                d: "en dag",
                dd: "%d dage",
                M: "en mÃ¥ned",
                MM: "%d mÃ¥neder",
                y: "et Ã¥r",
                yy: "%d Ã¥r"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function processRelativeTime(number, withoutSuffix, key) {
            var format = {
                m: [ "eine Minute", "einer Minute" ],
                h: [ "eine Stunde", "einer Stunde" ],
                d: [ "ein Tag", "einem Tag" ],
                dd: [ number + " Tage", number + " Tagen" ],
                M: [ "ein Monat", "einem Monat" ],
                MM: [ number + " Monate", number + " Monaten" ],
                y: [ "ein Jahr", "einem Jahr" ],
                yy: [ number + " Jahre", number + " Jahren" ]
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }
        return moment.lang("de", {
            months: "Januar_Februar_MÃ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
            monthsShort: "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
            weekdays: "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
            weekdaysShort: "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
            weekdaysMin: "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "H:mm [Uhr]",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Heute um] LT",
                sameElse: "L",
                nextDay: "[Morgen um] LT",
                nextWeek: "dddd [um] LT",
                lastDay: "[Gestern um] LT",
                lastWeek: "[letzten] dddd [um] LT"
            },
            relativeTime: {
                future: "in %s",
                past: "vor %s",
                s: "ein paar Sekunden",
                m: processRelativeTime,
                mm: "%d Minuten",
                h: processRelativeTime,
                hh: "%d Stunden",
                d: processRelativeTime,
                dd: processRelativeTime,
                M: processRelativeTime,
                MM: processRelativeTime,
                y: processRelativeTime,
                yy: processRelativeTime
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("el", {
            monthsNominativeEl: "Î™Î±Î½Î¿Ï…Î¬ÏÎ¹Î¿Ï‚_Î¦ÎµÎ²ÏÎ¿Ï…Î¬ÏÎ¹Î¿Ï‚_ÎœÎ¬ÏÏ„Î¹Î¿Ï‚_Î‘Ï€ÏÎ¯Î»Î¹Î¿Ï‚_ÎœÎ¬Î¹Î¿Ï‚_Î™Î¿ÏÎ½Î¹Î¿Ï‚_Î™Î¿ÏÎ»Î¹Î¿Ï‚_Î‘ÏÎ³Î¿Ï…ÏƒÏ„Î¿Ï‚_Î£ÎµÏ€Ï„Î­Î¼Î²ÏÎ¹Î¿Ï‚_ÎŸÎºÏ„ÏŽÎ²ÏÎ¹Î¿Ï‚_ÎÎ¿Î­Î¼Î²ÏÎ¹Î¿Ï‚_Î”ÎµÎºÎ­Î¼Î²ÏÎ¹Î¿Ï‚".split("_"),
            monthsGenitiveEl: "Î™Î±Î½Î¿Ï…Î±ÏÎ¯Î¿Ï…_Î¦ÎµÎ²ÏÎ¿Ï…Î±ÏÎ¯Î¿Ï…_ÎœÎ±ÏÏ„Î¯Î¿Ï…_Î‘Ï€ÏÎ¹Î»Î¯Î¿Ï…_ÎœÎ±ÎÎ¿Ï…_Î™Î¿Ï…Î½Î¯Î¿Ï…_Î™Î¿Ï…Î»Î¯Î¿Ï…_Î‘Ï…Î³Î¿ÏÏƒÏ„Î¿Ï…_Î£ÎµÏ€Ï„ÎµÎ¼Î²ÏÎ¯Î¿Ï…_ÎŸÎºÏ„Ï‰Î²ÏÎ¯Î¿Ï…_ÎÎ¿ÎµÎ¼Î²ÏÎ¯Î¿Ï…_Î”ÎµÎºÎµÎ¼Î²ÏÎ¯Î¿Ï…".split("_"),
            months: function(momentToFormat, format) {
                return /D/.test(format.substring(0, format.indexOf("MMMM"))) ? this._monthsGenitiveEl[momentToFormat.month()] : this._monthsNominativeEl[momentToFormat.month()];
            },
            monthsShort: "Î™Î±Î½_Î¦ÎµÎ²_ÎœÎ±Ï_Î‘Ï€Ï_ÎœÎ±ÏŠ_Î™Î¿Ï…Î½_Î™Î¿Ï…Î»_Î‘Ï…Î³_Î£ÎµÏ€_ÎŸÎºÏ„_ÎÎ¿Îµ_Î”ÎµÎº".split("_"),
            weekdays: "ÎšÏ…ÏÎ¹Î±ÎºÎ®_Î”ÎµÏ…Ï„Î­ÏÎ±_Î¤ÏÎ¯Ï„Î·_Î¤ÎµÏ„Î¬ÏÏ„Î·_Î Î­Î¼Ï€Ï„Î·_Î Î±ÏÎ±ÏƒÎºÎµÏ…Î®_Î£Î¬Î²Î²Î±Ï„Î¿".split("_"),
            weekdaysShort: "ÎšÏ…Ï_Î”ÎµÏ…_Î¤ÏÎ¹_Î¤ÎµÏ„_Î ÎµÎ¼_Î Î±Ï_Î£Î±Î²".split("_"),
            weekdaysMin: "ÎšÏ…_Î”Îµ_Î¤Ï_Î¤Îµ_Î Îµ_Î Î±_Î£Î±".split("_"),
            meridiem: function(hours, minutes, isLower) {
                return hours > 11 ? isLower ? "Î¼Î¼" : "ÎœÎœ" : isLower ? "Ï€Î¼" : "Î Îœ";
            },
            longDateFormat: {
                LT: "h:mm A",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendarEl: {
                sameDay: "[Î£Î®Î¼ÎµÏÎ± {}] LT",
                nextDay: "[Î‘ÏÏÎ¹Î¿ {}] LT",
                nextWeek: "dddd [{}] LT",
                lastDay: "[Î§Î¸ÎµÏ‚ {}] LT",
                lastWeek: "[Ï„Î·Î½ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î·] dddd [{}] LT",
                sameElse: "L"
            },
            calendar: function(key, mom) {
                var output = this._calendarEl[key], hours = mom && mom.hours();
                return output.replace("{}", 1 === hours % 12 ? "ÏƒÏ„Î·" : "ÏƒÏ„Î¹Ï‚");
            },
            relativeTime: {
                future: "ÏƒÎµ %s",
                past: "%s Ï€ÏÎ¹Î½",
                s: "Î´ÎµÏ…Ï„ÎµÏÏŒÎ»ÎµÏ€Ï„Î±",
                m: "Î­Î½Î± Î»ÎµÏ€Ï„ÏŒ",
                mm: "%d Î»ÎµÏ€Ï„Î¬",
                h: "Î¼Î¯Î± ÏŽÏÎ±",
                hh: "%d ÏŽÏÎµÏ‚",
                d: "Î¼Î¯Î± Î¼Î­ÏÎ±",
                dd: "%d Î¼Î­ÏÎµÏ‚",
                M: "Î­Î½Î±Ï‚ Î¼Î®Î½Î±Ï‚",
                MM: "%d Î¼Î®Î½ÎµÏ‚",
                y: "Î­Î½Î±Ï‚ Ï‡ÏÏŒÎ½Î¿Ï‚",
                yy: "%d Ï‡ÏÏŒÎ½Î¹Î±"
            },
            ordinal: function(number) {
                return number + "Î·";
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("en-au", {
            months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
            monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
            weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
            weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
            weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "h:mm A",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Today at] LT",
                nextDay: "[Tomorrow at] LT",
                nextWeek: "dddd [at] LT",
                lastDay: "[Yesterday at] LT",
                lastWeek: "[Last] dddd [at] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "in %s",
                past: "%s ago",
                s: "a few seconds",
                m: "a minute",
                mm: "%d minutes",
                h: "an hour",
                hh: "%d hours",
                d: "a day",
                dd: "%d days",
                M: "a month",
                MM: "%d months",
                y: "a year",
                yy: "%d years"
            },
            ordinal: function(number) {
                var b = number % 10, output = 1 === ~~(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("en-ca", {
            months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
            monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
            weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
            weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
            weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "h:mm A",
                L: "YYYY-MM-DD",
                LL: "D MMMM, YYYY",
                LLL: "D MMMM, YYYY LT",
                LLLL: "dddd, D MMMM, YYYY LT"
            },
            calendar: {
                sameDay: "[Today at] LT",
                nextDay: "[Tomorrow at] LT",
                nextWeek: "dddd [at] LT",
                lastDay: "[Yesterday at] LT",
                lastWeek: "[Last] dddd [at] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "in %s",
                past: "%s ago",
                s: "a few seconds",
                m: "a minute",
                mm: "%d minutes",
                h: "an hour",
                hh: "%d hours",
                d: "a day",
                dd: "%d days",
                M: "a month",
                MM: "%d months",
                y: "a year",
                yy: "%d years"
            },
            ordinal: function(number) {
                var b = number % 10, output = 1 === ~~(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
                return number + output;
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("en-gb", {
            months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
            monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
            weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
            weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
            weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Today at] LT",
                nextDay: "[Tomorrow at] LT",
                nextWeek: "dddd [at] LT",
                lastDay: "[Yesterday at] LT",
                lastWeek: "[Last] dddd [at] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "in %s",
                past: "%s ago",
                s: "a few seconds",
                m: "a minute",
                mm: "%d minutes",
                h: "an hour",
                hh: "%d hours",
                d: "a day",
                dd: "%d days",
                M: "a month",
                MM: "%d months",
                y: "a year",
                yy: "%d years"
            },
            ordinal: function(number) {
                var b = number % 10, output = 1 === ~~(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("eo", {
            months: "januaro_februaro_marto_aprilo_majo_junio_julio_aÅ­gusto_septembro_oktobro_novembro_decembro".split("_"),
            monthsShort: "jan_feb_mar_apr_maj_jun_jul_aÅ­g_sep_okt_nov_dec".split("_"),
            weekdays: "DimanÄ‰o_Lundo_Mardo_Merkredo_Ä´aÅ­do_Vendredo_Sabato".split("_"),
            weekdaysShort: "Dim_Lun_Mard_Merk_Ä´aÅ­_Ven_Sab".split("_"),
            weekdaysMin: "Di_Lu_Ma_Me_Ä´a_Ve_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "YYYY-MM-DD",
                LL: "D[-an de] MMMM, YYYY",
                LLL: "D[-an de] MMMM, YYYY LT",
                LLLL: "dddd, [la] D[-an de] MMMM, YYYY LT"
            },
            meridiem: function(hours, minutes, isLower) {
                return hours > 11 ? isLower ? "p.t.m." : "P.T.M." : isLower ? "a.t.m." : "A.T.M.";
            },
            calendar: {
                sameDay: "[HodiaÅ­ je] LT",
                nextDay: "[MorgaÅ­ je] LT",
                nextWeek: "dddd [je] LT",
                lastDay: "[HieraÅ­ je] LT",
                lastWeek: "[pasinta] dddd [je] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "je %s",
                past: "antaÅ­ %s",
                s: "sekundoj",
                m: "minuto",
                mm: "%d minutoj",
                h: "horo",
                hh: "%d horoj",
                d: "tago",
                dd: "%d tagoj",
                M: "monato",
                MM: "%d monatoj",
                y: "jaro",
                yy: "%d jaroj"
            },
            ordinal: "%da",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("es", {
            months: "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
            monthsShort: "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
            weekdays: "domingo_lunes_martes_miÃ©rcoles_jueves_viernes_sÃ¡bado".split("_"),
            weekdaysShort: "dom._lun._mar._miÃ©._jue._vie._sÃ¡b.".split("_"),
            weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_SÃ¡".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD/MM/YYYY",
                LL: "D [de] MMMM [de] YYYY",
                LLL: "D [de] MMMM [de] YYYY LT",
                LLLL: "dddd, D [de] MMMM [de] YYYY LT"
            },
            calendar: {
                sameDay: function() {
                    return "[hoy a la" + (1 !== this.hours() ? "s" : "") + "] LT";
                },
                nextDay: function() {
                    return "[maÃ±ana a la" + (1 !== this.hours() ? "s" : "") + "] LT";
                },
                nextWeek: function() {
                    return "dddd [a la" + (1 !== this.hours() ? "s" : "") + "] LT";
                },
                lastDay: function() {
                    return "[ayer a la" + (1 !== this.hours() ? "s" : "") + "] LT";
                },
                lastWeek: function() {
                    return "[el] dddd [pasado a la" + (1 !== this.hours() ? "s" : "") + "] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "en %s",
                past: "hace %s",
                s: "unos segundos",
                m: "un minuto",
                mm: "%d minutos",
                h: "una hora",
                hh: "%d horas",
                d: "un dÃ­a",
                dd: "%d dÃ­as",
                M: "un mes",
                MM: "%d meses",
                y: "un aÃ±o",
                yy: "%d aÃ±os"
            },
            ordinal: "%dÂº",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                s: [ "mÃµne sekundi", "mÃµni sekund", "paar sekundit" ],
                m: [ "Ã¼he minuti", "Ã¼ks minut" ],
                mm: [ number + " minuti", number + " minutit" ],
                h: [ "Ã¼he tunni", "tund aega", "Ã¼ks tund" ],
                hh: [ number + " tunni", number + " tundi" ],
                d: [ "Ã¼he pÃ¤eva", "Ã¼ks pÃ¤ev" ],
                M: [ "kuu aja", "kuu aega", "Ã¼ks kuu" ],
                MM: [ number + " kuu", number + " kuud" ],
                y: [ "Ã¼he aasta", "aasta", "Ã¼ks aasta" ],
                yy: [ number + " aasta", number + " aastat" ]
            };
            if (withoutSuffix) return format[key][2] ? format[key][2] : format[key][1];
            return isFuture ? format[key][0] : format[key][1];
        }
        return moment.lang("et", {
            months: "jaanuar_veebruar_mÃ¤rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),
            monthsShort: "jaan_veebr_mÃ¤rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),
            weekdays: "pÃ¼hapÃ¤ev_esmaspÃ¤ev_teisipÃ¤ev_kolmapÃ¤ev_neljapÃ¤ev_reede_laupÃ¤ev".split("_"),
            weekdaysShort: "P_E_T_K_N_R_L".split("_"),
            weekdaysMin: "P_E_T_K_N_R_L".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[TÃ¤na,] LT",
                nextDay: "[Homme,] LT",
                nextWeek: "[JÃ¤rgmine] dddd LT",
                lastDay: "[Eile,] LT",
                lastWeek: "[Eelmine] dddd LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s pÃ¤rast",
                past: "%s tagasi",
                s: processRelativeTime,
                m: processRelativeTime,
                mm: processRelativeTime,
                h: processRelativeTime,
                hh: processRelativeTime,
                d: processRelativeTime,
                dd: "%d pÃ¤eva",
                M: processRelativeTime,
                MM: processRelativeTime,
                y: processRelativeTime,
                yy: processRelativeTime
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("eu", {
            months: "urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua".split("_"),
            monthsShort: "urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.".split("_"),
            weekdays: "igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata".split("_"),
            weekdaysShort: "ig._al._ar._az._og._ol._lr.".split("_"),
            weekdaysMin: "ig_al_ar_az_og_ol_lr".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "YYYY-MM-DD",
                LL: "YYYY[ko] MMMM[ren] D[a]",
                LLL: "YYYY[ko] MMMM[ren] D[a] LT",
                LLLL: "dddd, YYYY[ko] MMMM[ren] D[a] LT",
                l: "YYYY-M-D",
                ll: "YYYY[ko] MMM D[a]",
                lll: "YYYY[ko] MMM D[a] LT",
                llll: "ddd, YYYY[ko] MMM D[a] LT"
            },
            calendar: {
                sameDay: "[gaur] LT[etan]",
                nextDay: "[bihar] LT[etan]",
                nextWeek: "dddd LT[etan]",
                lastDay: "[atzo] LT[etan]",
                lastWeek: "[aurreko] dddd LT[etan]",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s barru",
                past: "duela %s",
                s: "segundo batzuk",
                m: "minutu bat",
                mm: "%d minutu",
                h: "ordu bat",
                hh: "%d ordu",
                d: "egun bat",
                dd: "%d egun",
                M: "hilabete bat",
                MM: "%d hilabete",
                y: "urte bat",
                yy: "%d urte"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var symbolMap = {
            "1": "Û±",
            "2": "Û²",
            "3": "Û³",
            "4": "Û´",
            "5": "Ûµ",
            "6": "Û¶",
            "7": "Û·",
            "8": "Û¸",
            "9": "Û¹",
            "0": "Û°"
        }, numberMap = {
            "Û±": "1",
            "Û²": "2",
            "Û³": "3",
            "Û´": "4",
            "Ûµ": "5",
            "Û¶": "6",
            "Û·": "7",
            "Û¸": "8",
            "Û¹": "9",
            "Û°": "0"
        };
        return moment.lang("fa", {
            months: "Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±".split("_"),
            monthsShort: "Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±".split("_"),
            weekdays: "ÛŒÚ©‌Ø´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡‌Ø´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬‌Ø´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡".split("_"),
            weekdaysShort: "ÛŒÚ©‌Ø´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡‌Ø´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬‌Ø´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡".split("_"),
            weekdaysMin: "ÛŒ_Ø¯_Ø³_Ú†_Ù¾_Ø¬_Ø´".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            meridiem: function(hour) {
                return 12 > hour ? "Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±" : "Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±";
            },
            calendar: {
                sameDay: "[Ø§Ù…Ø±ÙˆØ² Ø³Ø§Ø¹Øª] LT",
                nextDay: "[ÙØ±Ø¯Ø§ Ø³Ø§Ø¹Øª] LT",
                nextWeek: "dddd [Ø³Ø§Ø¹Øª] LT",
                lastDay: "[Ø¯ÛŒØ±ÙˆØ² Ø³Ø§Ø¹Øª] LT",
                lastWeek: "dddd [Ù¾ÛŒØ´] [Ø³Ø§Ø¹Øª] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "Ø¯Ø± %s",
                past: "%s Ù¾ÛŒØ´",
                s: "Ú†Ù†Ø¯ÛŒÙ† Ø«Ø§Ù†ÛŒÙ‡",
                m: "ÛŒÚ© Ø¯Ù‚ÛŒÙ‚Ù‡",
                mm: "%d Ø¯Ù‚ÛŒÙ‚Ù‡",
                h: "ÛŒÚ© Ø³Ø§Ø¹Øª",
                hh: "%d Ø³Ø§Ø¹Øª",
                d: "ÛŒÚ© Ø±ÙˆØ²",
                dd: "%d Ø±ÙˆØ²",
                M: "ÛŒÚ© Ù…Ø§Ù‡",
                MM: "%d Ù…Ø§Ù‡",
                y: "ÛŒÚ© Ø³Ø§Ù„",
                yy: "%d Ø³Ø§Ù„"
            },
            preparse: function(string) {
                return string.replace(/[Û°-Û¹]/g, function(match) {
                    return numberMap[match];
                }).replace(/ØŒ/g, ",");
            },
            postformat: function(string) {
                return string.replace(/\d/g, function(match) {
                    return symbolMap[match];
                }).replace(/,/g, "ØŒ");
            },
            ordinal: "%dÙ…",
            week: {
                dow: 6,
                doy: 12
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key, isFuture) {
            var result = "";
            switch (key) {
              case "s":
                return isFuture ? "muutaman sekunnin" : "muutama sekunti";

              case "m":
                return isFuture ? "minuutin" : "minuutti";

              case "mm":
                result = isFuture ? "minuutin" : "minuuttia";
                break;

              case "h":
                return isFuture ? "tunnin" : "tunti";

              case "hh":
                result = isFuture ? "tunnin" : "tuntia";
                break;

              case "d":
                return isFuture ? "pÃ¤ivÃ¤n" : "pÃ¤ivÃ¤";

              case "dd":
                result = isFuture ? "pÃ¤ivÃ¤n" : "pÃ¤ivÃ¤Ã¤";
                break;

              case "M":
                return isFuture ? "kuukauden" : "kuukausi";

              case "MM":
                result = isFuture ? "kuukauden" : "kuukautta";
                break;

              case "y":
                return isFuture ? "vuoden" : "vuosi";

              case "yy":
                result = isFuture ? "vuoden" : "vuotta";
            }
            result = verbal_number(number, isFuture) + " " + result;
            return result;
        }
        function verbal_number(number, isFuture) {
            return 10 > number ? isFuture ? numbers_future[number] : numbers_past[number] : number;
        }
        var numbers_past = "nolla yksi kaksi kolme neljÃ¤ viisi kuusi seitsemÃ¤n kahdeksan yhdeksÃ¤n".split(" "), numbers_future = [ "nolla", "yhden", "kahden", "kolmen", "neljÃ¤n", "viiden", "kuuden", numbers_past[7], numbers_past[8], numbers_past[9] ];
        return moment.lang("fi", {
            months: "tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesÃ¤kuu_heinÃ¤kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),
            monthsShort: "tammi_helmi_maalis_huhti_touko_kesÃ¤_heinÃ¤_elo_syys_loka_marras_joulu".split("_"),
            weekdays: "sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),
            weekdaysShort: "su_ma_ti_ke_to_pe_la".split("_"),
            weekdaysMin: "su_ma_ti_ke_to_pe_la".split("_"),
            longDateFormat: {
                LT: "HH.mm",
                L: "DD.MM.YYYY",
                LL: "Do MMMM[ta] YYYY",
                LLL: "Do MMMM[ta] YYYY, [klo] LT",
                LLLL: "dddd, Do MMMM[ta] YYYY, [klo] LT",
                l: "D.M.YYYY",
                ll: "Do MMM YYYY",
                lll: "Do MMM YYYY, [klo] LT",
                llll: "ddd, Do MMM YYYY, [klo] LT"
            },
            calendar: {
                sameDay: "[tÃ¤nÃ¤Ã¤n] [klo] LT",
                nextDay: "[huomenna] [klo] LT",
                nextWeek: "dddd [klo] LT",
                lastDay: "[eilen] [klo] LT",
                lastWeek: "[viime] dddd[na] [klo] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s pÃ¤Ã¤stÃ¤",
                past: "%s sitten",
                s: translate,
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("fo", {
            months: "januar_februar_mars_aprÃ­l_mai_juni_juli_august_september_oktober_november_desember".split("_"),
            monthsShort: "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
            weekdays: "sunnudagur_mÃ¡nadagur_tÃ½sdagur_mikudagur_hÃ³sdagur_frÃ­ggjadagur_leygardagur".split("_"),
            weekdaysShort: "sun_mÃ¡n_tÃ½s_mik_hÃ³s_frÃ­_ley".split("_"),
            weekdaysMin: "su_mÃ¡_tÃ½_mi_hÃ³_fr_le".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D. MMMM, YYYY LT"
            },
            calendar: {
                sameDay: "[Ã dag kl.] LT",
                nextDay: "[Ã morgin kl.] LT",
                nextWeek: "dddd [kl.] LT",
                lastDay: "[Ã gjÃ¡r kl.] LT",
                lastWeek: "[sÃ­Ã°stu] dddd [kl] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "um %s",
                past: "%s sÃ­Ã°ani",
                s: "fÃ¡ sekund",
                m: "ein minutt",
                mm: "%d minuttir",
                h: "ein tÃ­mi",
                hh: "%d tÃ­mar",
                d: "ein dagur",
                dd: "%d dagar",
                M: "ein mÃ¡naÃ°i",
                MM: "%d mÃ¡naÃ°ir",
                y: "eitt Ã¡r",
                yy: "%d Ã¡r"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("fr-ca", {
            months: "janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre".split("_"),
            monthsShort: "janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.".split("_"),
            weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
            weekdaysShort: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
            weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "YYYY-MM-DD",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Aujourd'hui Ã ] LT",
                nextDay: "[Demain Ã ] LT",
                nextWeek: "dddd [Ã ] LT",
                lastDay: "[Hier Ã ] LT",
                lastWeek: "dddd [dernier Ã ] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "dans %s",
                past: "il y a %s",
                s: "quelques secondes",
                m: "une minute",
                mm: "%d minutes",
                h: "une heure",
                hh: "%d heures",
                d: "un jour",
                dd: "%d jours",
                M: "un mois",
                MM: "%d mois",
                y: "un an",
                yy: "%d ans"
            },
            ordinal: function(number) {
                return number + (1 === number ? "er" : "");
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("fr", {
            months: "janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre".split("_"),
            monthsShort: "janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.".split("_"),
            weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
            weekdaysShort: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
            weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Aujourd'hui Ã ] LT",
                nextDay: "[Demain Ã ] LT",
                nextWeek: "dddd [Ã ] LT",
                lastDay: "[Hier Ã ] LT",
                lastWeek: "dddd [dernier Ã ] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "dans %s",
                past: "il y a %s",
                s: "quelques secondes",
                m: "une minute",
                mm: "%d minutes",
                h: "une heure",
                hh: "%d heures",
                d: "un jour",
                dd: "%d jours",
                M: "un mois",
                MM: "%d mois",
                y: "un an",
                yy: "%d ans"
            },
            ordinal: function(number) {
                return number + (1 === number ? "er" : "");
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("gl", {
            months: "Xaneiro_Febreiro_Marzo_Abril_Maio_XuÃ±o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro".split("_"),
            monthsShort: "Xan._Feb._Mar._Abr._Mai._XuÃ±._Xul._Ago._Set._Out._Nov._Dec.".split("_"),
            weekdays: "Domingo_Luns_Martes_MÃ©rcores_Xoves_Venres_SÃ¡bado".split("_"),
            weekdaysShort: "Dom._Lun._Mar._MÃ©r._Xov._Ven._SÃ¡b.".split("_"),
            weekdaysMin: "Do_Lu_Ma_MÃ©_Xo_Ve_SÃ¡".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: function() {
                    return "[hoxe " + (1 !== this.hours() ? "Ã¡s" : "Ã¡") + "] LT";
                },
                nextDay: function() {
                    return "[maÃ±Ã¡ " + (1 !== this.hours() ? "Ã¡s" : "Ã¡") + "] LT";
                },
                nextWeek: function() {
                    return "dddd [" + (1 !== this.hours() ? "Ã¡s" : "a") + "] LT";
                },
                lastDay: function() {
                    return "[onte " + (1 !== this.hours() ? "Ã¡" : "a") + "] LT";
                },
                lastWeek: function() {
                    return "[o] dddd [pasado " + (1 !== this.hours() ? "Ã¡s" : "a") + "] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: function(str) {
                    if ("uns segundos" === str) return "nuns segundos";
                    return "en " + str;
                },
                past: "hai %s",
                s: "uns segundos",
                m: "un minuto",
                mm: "%d minutos",
                h: "unha hora",
                hh: "%d horas",
                d: "un dÃ­a",
                dd: "%d dÃ­as",
                M: "un mes",
                MM: "%d meses",
                y: "un ano",
                yy: "%d anos"
            },
            ordinal: "%dÂº",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("he", {
            months: "×™× ×•××¨_×¤×‘×¨×•××¨_×ž×¨×¥_××¤×¨×™×œ_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×•×¡×˜_×¡×¤×˜×ž×‘×¨_××•×§×˜×•×‘×¨_× ×•×‘×ž×‘×¨_×“×¦×ž×‘×¨".split("_"),
            monthsShort: "×™× ×•×³_×¤×‘×¨×³_×ž×¨×¥_××¤×¨×³_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×³_×¡×¤×˜×³_××•×§×³_× ×•×‘×³_×“×¦×ž×³".split("_"),
            weekdays: "×¨××©×•×Ÿ_×©× ×™_×©×œ×™×©×™_×¨×‘×™×¢×™_×—×ž×™×©×™_×©×™×©×™_×©×‘×ª".split("_"),
            weekdaysShort: "××³_×‘×³_×’×³_×“×³_×”×³_×•×³_×©×³".split("_"),
            weekdaysMin: "×_×‘_×’_×“_×”_×•_×©".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D [×‘]MMMM YYYY",
                LLL: "D [×‘]MMMM YYYY LT",
                LLLL: "dddd, D [×‘]MMMM YYYY LT",
                l: "D/M/YYYY",
                ll: "D MMM YYYY",
                lll: "D MMM YYYY LT",
                llll: "ddd, D MMM YYYY LT"
            },
            calendar: {
                sameDay: "[×”×™×•× ×‘Ö¾]LT",
                nextDay: "[×ž×—×¨ ×‘Ö¾]LT",
                nextWeek: "dddd [×‘×©×¢×”] LT",
                lastDay: "[××ª×ž×•×œ ×‘Ö¾]LT",
                lastWeek: "[×‘×™×•×] dddd [×”××—×¨×•×Ÿ ×‘×©×¢×”] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "×‘×¢×•×“ %s",
                past: "×œ×¤× ×™ %s",
                s: "×ž×¡×¤×¨ ×©× ×™×•×ª",
                m: "×“×§×”",
                mm: "%d ×“×§×•×ª",
                h: "×©×¢×”",
                hh: function(number) {
                    if (2 === number) return "×©×¢×ª×™×™×";
                    return number + " ×©×¢×•×ª";
                },
                d: "×™×•×",
                dd: function(number) {
                    if (2 === number) return "×™×•×ž×™×™×";
                    return number + " ×™×ž×™×";
                },
                M: "×—×•×“×©",
                MM: function(number) {
                    if (2 === number) return "×—×•×“×©×™×™×";
                    return number + " ×—×•×“×©×™×";
                },
                y: "×©× ×”",
                yy: function(number) {
                    if (2 === number) return "×©× ×ª×™×™×";
                    return number + " ×©× ×™×";
                }
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var symbolMap = {
            "1": "à¥§",
            "2": "à¥¨",
            "3": "à¥©",
            "4": "à¥ª",
            "5": "à¥«",
            "6": "à¥¬",
            "7": "à¥­",
            "8": "à¥®",
            "9": "à¥¯",
            "0": "à¥¦"
        }, numberMap = {
            "à¥§": "1",
            "à¥¨": "2",
            "à¥©": "3",
            "à¥ª": "4",
            "à¥«": "5",
            "à¥¬": "6",
            "à¥­": "7",
            "à¥®": "8",
            "à¥¯": "9",
            "à¥¦": "0"
        };
        return moment.lang("hi", {
            months: "à¤œà¤¨à¤µà¤°à¥€_à¤«à¤¼à¤°à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆà¤²_à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤¸à¥à¤¤_à¤¸à¤¿à¤¤à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°_à¤¨à¤µà¤®à¥à¤¬à¤°_à¤¦à¤¿à¤¸à¤®à¥à¤¬à¤°".split("_"),
            monthsShort: "à¤œà¤¨._à¤«à¤¼à¤°._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆ._à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²._à¤…à¤—._à¤¸à¤¿à¤¤._à¤…à¤•à¥à¤Ÿà¥‚._à¤¨à¤µ._à¤¦à¤¿à¤¸.".split("_"),
            weekdays: "à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤²à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°".split("_"),
            weekdaysShort: "à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤²_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿".split("_"),
            weekdaysMin: "à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶".split("_"),
            longDateFormat: {
                LT: "A h:mm à¤¬à¤œà¥‡",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, LT",
                LLLL: "dddd, D MMMM YYYY, LT"
            },
            calendar: {
                sameDay: "[à¤†à¤œ] LT",
                nextDay: "[à¤•à¤²] LT",
                nextWeek: "dddd, LT",
                lastDay: "[à¤•à¤²] LT",
                lastWeek: "[à¤ªà¤¿à¤›à¤²à¥‡] dddd, LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s à¤®à¥‡à¤‚",
                past: "%s à¤ªà¤¹à¤²à¥‡",
                s: "à¤•à¥à¤› à¤¹à¥€ à¤•à¥à¤·à¤£",
                m: "à¤à¤• à¤®à¤¿à¤¨à¤Ÿ",
                mm: "%d à¤®à¤¿à¤¨à¤Ÿ",
                h: "à¤à¤• à¤˜à¤‚à¤Ÿà¤¾",
                hh: "%d à¤˜à¤‚à¤Ÿà¥‡",
                d: "à¤à¤• à¤¦à¤¿à¤¨",
                dd: "%d à¤¦à¤¿à¤¨",
                M: "à¤à¤• à¤®à¤¹à¥€à¤¨à¥‡",
                MM: "%d à¤®à¤¹à¥€à¤¨à¥‡",
                y: "à¤à¤• à¤µà¤°à¥à¤·",
                yy: "%d à¤µà¤°à¥à¤·"
            },
            preparse: function(string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function(match) {
                    return numberMap[match];
                });
            },
            postformat: function(string) {
                return string.replace(/\d/g, function(match) {
                    return symbolMap[match];
                });
            },
            meridiem: function(hour) {
                return 4 > hour ? "à¤°à¤¾à¤¤" : 10 > hour ? "à¤¸à¥à¤¬à¤¹" : 17 > hour ? "à¤¦à¥‹à¤ªà¤¹à¤°" : 20 > hour ? "à¤¶à¤¾à¤®" : "à¤°à¤¾à¤¤";
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "jedna minuta" : "jedne minute";

              case "mm":
                result += 1 === number ? "minuta" : 2 === number || 3 === number || 4 === number ? "minute" : "minuta";
                return result;

              case "h":
                return withoutSuffix ? "jedan sat" : "jednog sata";

              case "hh":
                result += 1 === number ? "sat" : 2 === number || 3 === number || 4 === number ? "sata" : "sati";
                return result;

              case "dd":
                result += 1 === number ? "dan" : "dana";
                return result;

              case "MM":
                result += 1 === number ? "mjesec" : 2 === number || 3 === number || 4 === number ? "mjeseca" : "mjeseci";
                return result;

              case "yy":
                result += 1 === number ? "godina" : 2 === number || 3 === number || 4 === number ? "godine" : "godina";
                return result;
            }
        }
        return moment.lang("hr", {
            months: "sjeÄanj_veljaÄa_oÅ¾ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),
            monthsShort: "sje._vel._oÅ¾u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),
            weekdays: "nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota".split("_"),
            weekdaysShort: "ned._pon._uto._sri._Äet._pet._sub.".split("_"),
            weekdaysMin: "ne_po_ut_sr_Äe_pe_su".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[danas u] LT",
                nextDay: "[sutra u] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[u] [nedjelju] [u] LT";

                      case 3:
                        return "[u] [srijedu] [u] LT";

                      case 6:
                        return "[u] [subotu] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[u] dddd [u] LT";
                    }
                },
                lastDay: "[juÄer u] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                        return "[proÅ¡lu] dddd [u] LT";

                      case 6:
                        return "[proÅ¡le] [subote] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[proÅ¡li] dddd [u] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "prije %s",
                s: "par sekundi",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "dan",
                dd: translate,
                M: "mjesec",
                MM: translate,
                y: "godinu",
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key, isFuture) {
            var num = number;
            switch (key) {
              case "s":
                return isFuture || withoutSuffix ? "nÃ©hÃ¡ny mÃ¡sodperc" : "nÃ©hÃ¡ny mÃ¡sodperce";

              case "m":
                return "egy" + (isFuture || withoutSuffix ? " perc" : " perce");

              case "mm":
                return num + (isFuture || withoutSuffix ? " perc" : " perce");

              case "h":
                return "egy" + (isFuture || withoutSuffix ? " Ã³ra" : " Ã³rÃ¡ja");

              case "hh":
                return num + (isFuture || withoutSuffix ? " Ã³ra" : " Ã³rÃ¡ja");

              case "d":
                return "egy" + (isFuture || withoutSuffix ? " nap" : " napja");

              case "dd":
                return num + (isFuture || withoutSuffix ? " nap" : " napja");

              case "M":
                return "egy" + (isFuture || withoutSuffix ? " hÃ³nap" : " hÃ³napja");

              case "MM":
                return num + (isFuture || withoutSuffix ? " hÃ³nap" : " hÃ³napja");

              case "y":
                return "egy" + (isFuture || withoutSuffix ? " Ã©v" : " Ã©ve");

              case "yy":
                return num + (isFuture || withoutSuffix ? " Ã©v" : " Ã©ve");
            }
            return "";
        }
        function week(isFuture) {
            return (isFuture ? "" : "[mÃºlt] ") + "[" + weekEndings[this.day()] + "] LT[-kor]";
        }
        var weekEndings = "vasÃ¡rnap hÃ©tfÅ‘n kedden szerdÃ¡n csÃ¼tÃ¶rtÃ¶kÃ¶n pÃ©nteken szombaton".split(" ");
        return moment.lang("hu", {
            months: "januÃ¡r_februÃ¡r_mÃ¡rcius_Ã¡prilis_mÃ¡jus_jÃºnius_jÃºlius_augusztus_szeptember_oktÃ³ber_november_december".split("_"),
            monthsShort: "jan_feb_mÃ¡rc_Ã¡pr_mÃ¡j_jÃºn_jÃºl_aug_szept_okt_nov_dec".split("_"),
            weekdays: "vasÃ¡rnap_hÃ©tfÅ‘_kedd_szerda_csÃ¼tÃ¶rtÃ¶k_pÃ©ntek_szombat".split("_"),
            weekdaysShort: "vas_hÃ©t_kedd_sze_csÃ¼t_pÃ©n_szo".split("_"),
            weekdaysMin: "v_h_k_sze_cs_p_szo".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "YYYY.MM.DD.",
                LL: "YYYY. MMMM D.",
                LLL: "YYYY. MMMM D., LT",
                LLLL: "YYYY. MMMM D., dddd LT"
            },
            calendar: {
                sameDay: "[ma] LT[-kor]",
                nextDay: "[holnap] LT[-kor]",
                nextWeek: function() {
                    return week.call(this, true);
                },
                lastDay: "[tegnap] LT[-kor]",
                lastWeek: function() {
                    return week.call(this, false);
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "%s mÃºlva",
                past: "%s",
                s: translate,
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function monthsCaseReplace(m, format) {
            var months = {
                nominative: "Õ°Õ¸Ö‚Õ¶Õ¾Õ¡Ö€_ÖƒÕ¥Õ¿Ö€Õ¾Õ¡Ö€_Õ´Õ¡Ö€Õ¿_Õ¡ÕºÖ€Õ«Õ¬_Õ´Õ¡ÕµÕ«Õ½_Õ°Õ¸Ö‚Õ¶Õ«Õ½_Õ°Õ¸Ö‚Õ¬Õ«Õ½_Ö…Õ£Õ¸Õ½Õ¿Õ¸Õ½_Õ½Õ¥ÕºÕ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ°Õ¸Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ¶Õ¸ÕµÕ¥Õ´Õ¢Õ¥Ö€_Õ¤Õ¥Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€".split("_"),
                accusative: "Õ°Õ¸Ö‚Õ¶Õ¾Õ¡Ö€Õ«_ÖƒÕ¥Õ¿Ö€Õ¾Õ¡Ö€Õ«_Õ´Õ¡Ö€Õ¿Õ«_Õ¡ÕºÖ€Õ«Õ¬Õ«_Õ´Õ¡ÕµÕ«Õ½Õ«_Õ°Õ¸Ö‚Õ¶Õ«Õ½Õ«_Õ°Õ¸Ö‚Õ¬Õ«Õ½Õ«_Ö…Õ£Õ¸Õ½Õ¿Õ¸Õ½Õ«_Õ½Õ¥ÕºÕ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«_Õ°Õ¸Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«_Õ¶Õ¸ÕµÕ¥Õ´Õ¢Õ¥Ö€Õ«_Õ¤Õ¥Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€Õ«".split("_")
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative";
            return months[nounCase][m.month()];
        }
        function monthsShortCaseReplace(m) {
            var monthsShort = "Õ°Õ¶Õ¾_ÖƒÕ¿Ö€_Õ´Ö€Õ¿_Õ¡ÕºÖ€_Õ´ÕµÕ½_Õ°Õ¶Õ½_Õ°Õ¬Õ½_Ö…Õ£Õ½_Õ½ÕºÕ¿_Õ°Õ¯Õ¿_Õ¶Õ´Õ¢_Õ¤Õ¯Õ¿".split("_");
            return monthsShort[m.month()];
        }
        function weekdaysCaseReplace(m) {
            var weekdays = "Õ¯Õ«Ö€Õ¡Õ¯Õ«_Õ¥Ö€Õ¯Õ¸Ö‚Õ·Õ¡Õ¢Õ©Õ«_Õ¥Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ¹Õ¸Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ°Õ«Õ¶Õ£Õ·Õ¡Õ¢Õ©Õ«_Õ¸Ö‚Ö€Õ¢Õ¡Õ©_Õ·Õ¡Õ¢Õ¡Õ©".split("_");
            return weekdays[m.day()];
        }
        return moment.lang("hy-am", {
            months: monthsCaseReplace,
            monthsShort: monthsShortCaseReplace,
            weekdays: weekdaysCaseReplace,
            weekdaysShort: "Õ¯Ö€Õ¯_Õ¥Ö€Õ¯_Õ¥Ö€Ö„_Õ¹Ö€Ö„_Õ°Õ¶Õ£_Õ¸Ö‚Ö€Õ¢_Õ·Õ¢Õ©".split("_"),
            weekdaysMin: "Õ¯Ö€Õ¯_Õ¥Ö€Õ¯_Õ¥Ö€Ö„_Õ¹Ö€Ö„_Õ°Õ¶Õ£_Õ¸Ö‚Ö€Õ¢_Õ·Õ¢Õ©".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY Õ©.",
                LLL: "D MMMM YYYY Õ©., LT",
                LLLL: "dddd, D MMMM YYYY Õ©., LT"
            },
            calendar: {
                sameDay: "[Õ¡ÕµÕ½Ö…Ö€] LT",
                nextDay: "[Õ¾Õ¡Õ²Õ¨] LT",
                lastDay: "[Õ¥Ö€Õ¥Õ¯] LT",
                nextWeek: function() {
                    return "dddd [Ö…Ö€Õ¨ ÕªÕ¡Õ´Õ¨] LT";
                },
                lastWeek: function() {
                    return "[Õ¡Õ¶ÖÕ¡Õ®] dddd [Ö…Ö€Õ¨ ÕªÕ¡Õ´Õ¨] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "%s Õ°Õ¥Õ¿Õ¸",
                past: "%s Õ¡Õ¼Õ¡Õ»",
                s: "Õ´Õ« Ö„Õ¡Õ¶Õ« Õ¾Õ¡ÕµÖ€Õ¯ÕµÕ¡Õ¶",
                m: "Ö€Õ¸ÕºÕ¥",
                mm: "%d Ö€Õ¸ÕºÕ¥",
                h: "ÕªÕ¡Õ´",
                hh: "%d ÕªÕ¡Õ´",
                d: "Ö…Ö€",
                dd: "%d Ö…Ö€",
                M: "Õ¡Õ´Õ«Õ½",
                MM: "%d Õ¡Õ´Õ«Õ½",
                y: "Õ¿Õ¡Ö€Õ«",
                yy: "%d Õ¿Õ¡Ö€Õ«"
            },
            meridiem: function(hour) {
                return 4 > hour ? "Õ£Õ«Õ·Õ¥Ö€Õ¾Õ¡" : 12 > hour ? "Õ¡Õ¼Õ¡Õ¾Õ¸Õ¿Õ¾Õ¡" : 17 > hour ? "ÖÕ¥Ö€Õ¥Õ¯Õ¾Õ¡" : "Õ¥Ö€Õ¥Õ¯Õ¸ÕµÕ¡Õ¶";
            },
            ordinal: function(number, period) {
                switch (period) {
                  case "DDD":
                  case "w":
                  case "W":
                  case "DDDo":
                    if (1 === number) return number + "-Õ«Õ¶";
                    return number + "-Ö€Õ¤";

                  default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("id", {
            months: "Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember".split("_"),
            monthsShort: "Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des".split("_"),
            weekdays: "Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu".split("_"),
            weekdaysShort: "Min_Sen_Sel_Rab_Kam_Jum_Sab".split("_"),
            weekdaysMin: "Mg_Sn_Sl_Rb_Km_Jm_Sb".split("_"),
            longDateFormat: {
                LT: "HH.mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY [pukul] LT",
                LLLL: "dddd, D MMMM YYYY [pukul] LT"
            },
            meridiem: function(hours) {
                return 11 > hours ? "pagi" : 15 > hours ? "siang" : 19 > hours ? "sore" : "malam";
            },
            calendar: {
                sameDay: "[Hari ini pukul] LT",
                nextDay: "[Besok pukul] LT",
                nextWeek: "dddd [pukul] LT",
                lastDay: "[Kemarin pukul] LT",
                lastWeek: "dddd [lalu pukul] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "dalam %s",
                past: "%s yang lalu",
                s: "beberapa detik",
                m: "semenit",
                mm: "%d menit",
                h: "sejam",
                hh: "%d jam",
                d: "sehari",
                dd: "%d hari",
                M: "sebulan",
                MM: "%d bulan",
                y: "setahun",
                yy: "%d tahun"
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(n) {
            if (11 === n % 100) return true;
            if (1 === n % 10) return false;
            return true;
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "nokkrar sekÃºndur" : "nokkrum sekÃºndum";

              case "m":
                return withoutSuffix ? "mÃ­nÃºta" : "mÃ­nÃºtu";

              case "mm":
                if (plural(number)) return result + (withoutSuffix || isFuture ? "mÃ­nÃºtur" : "mÃ­nÃºtum");
                if (withoutSuffix) return result + "mÃ­nÃºta";
                return result + "mÃ­nÃºtu";

              case "hh":
                if (plural(number)) return result + (withoutSuffix || isFuture ? "klukkustundir" : "klukkustundum");
                return result + "klukkustund";

              case "d":
                if (withoutSuffix) return "dagur";
                return isFuture ? "dag" : "degi";

              case "dd":
                if (plural(number)) {
                    if (withoutSuffix) return result + "dagar";
                    return result + (isFuture ? "daga" : "dÃ¶gum");
                }
                if (withoutSuffix) return result + "dagur";
                return result + (isFuture ? "dag" : "degi");

              case "M":
                if (withoutSuffix) return "mÃ¡nuÃ°ur";
                return isFuture ? "mÃ¡nuÃ°" : "mÃ¡nuÃ°i";

              case "MM":
                if (plural(number)) {
                    if (withoutSuffix) return result + "mÃ¡nuÃ°ir";
                    return result + (isFuture ? "mÃ¡nuÃ°i" : "mÃ¡nuÃ°um");
                }
                if (withoutSuffix) return result + "mÃ¡nuÃ°ur";
                return result + (isFuture ? "mÃ¡nuÃ°" : "mÃ¡nuÃ°i");

              case "y":
                return withoutSuffix || isFuture ? "Ã¡r" : "Ã¡ri";

              case "yy":
                if (plural(number)) return result + (withoutSuffix || isFuture ? "Ã¡r" : "Ã¡rum");
                return result + (withoutSuffix || isFuture ? "Ã¡r" : "Ã¡ri");
            }
        }
        return moment.lang("is", {
            months: "janÃºar_febrÃºar_mars_aprÃ­l_maÃ­_jÃºnÃ­_jÃºlÃ­_Ã¡gÃºst_september_oktÃ³ber_nÃ³vember_desember".split("_"),
            monthsShort: "jan_feb_mar_apr_maÃ­_jÃºn_jÃºl_Ã¡gÃº_sep_okt_nÃ³v_des".split("_"),
            weekdays: "sunnudagur_mÃ¡nudagur_Ã¾riÃ°judagur_miÃ°vikudagur_fimmtudagur_fÃ¶studagur_laugardagur".split("_"),
            weekdaysShort: "sun_mÃ¡n_Ã¾ri_miÃ°_fim_fÃ¶s_lau".split("_"),
            weekdaysMin: "Su_MÃ¡_Ãžr_Mi_Fi_FÃ¶_La".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD/MM/YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY [kl.] LT",
                LLLL: "dddd, D. MMMM YYYY [kl.] LT"
            },
            calendar: {
                sameDay: "[Ã­ dag kl.] LT",
                nextDay: "[Ã¡ morgun kl.] LT",
                nextWeek: "dddd [kl.] LT",
                lastDay: "[Ã­ gÃ¦r kl.] LT",
                lastWeek: "[sÃ­Ã°asta] dddd [kl.] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "eftir %s",
                past: "fyrir %s sÃ­Ã°an",
                s: translate,
                m: translate,
                mm: translate,
                h: "klukkustund",
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("it", {
            months: "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
            monthsShort: "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
            weekdays: "Domenica_LunedÃ¬_MartedÃ¬_MercoledÃ¬_GiovedÃ¬_VenerdÃ¬_Sabato".split("_"),
            weekdaysShort: "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
            weekdaysMin: "D_L_Ma_Me_G_V_S".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Oggi alle] LT",
                nextDay: "[Domani alle] LT",
                nextWeek: "dddd [alle] LT",
                lastDay: "[Ieri alle] LT",
                lastWeek: "[lo scorso] dddd [alle] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: function(s) {
                    return (/^[0-9].+$/.test(s) ? "tra" : "in") + " " + s;
                },
                past: "%s fa",
                s: "alcuni secondi",
                m: "un minuto",
                mm: "%d minuti",
                h: "un'ora",
                hh: "%d ore",
                d: "un giorno",
                dd: "%d giorni",
                M: "un mese",
                MM: "%d mesi",
                y: "un anno",
                yy: "%d anni"
            },
            ordinal: "%dÂº",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ja", {
            months: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
            monthsShort: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
            weekdays: "æ—¥æ›œæ—¥_æœˆæ›œæ—¥_ç«æ›œæ—¥_æ°´æ›œæ—¥_æœ¨æ›œæ—¥_é‡‘æ›œæ—¥_åœŸæ›œæ—¥".split("_"),
            weekdaysShort: "æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ".split("_"),
            weekdaysMin: "æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ".split("_"),
            longDateFormat: {
                LT: "Ahæ™‚måˆ†",
                L: "YYYY/MM/DD",
                LL: "YYYYå¹´MæœˆDæ—¥",
                LLL: "YYYYå¹´MæœˆDæ—¥LT",
                LLLL: "YYYYå¹´MæœˆDæ—¥LT dddd"
            },
            meridiem: function(hour) {
                return 12 > hour ? "åˆå‰" : "åˆå¾Œ";
            },
            calendar: {
                sameDay: "[ä»Šæ—¥] LT",
                nextDay: "[æ˜Žæ—¥] LT",
                nextWeek: "[æ¥é€±]dddd LT",
                lastDay: "[æ˜¨æ—¥] LT",
                lastWeek: "[å‰é€±]dddd LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%så¾Œ",
                past: "%så‰",
                s: "æ•°ç§’",
                m: "1åˆ†",
                mm: "%dåˆ†",
                h: "1æ™‚é–“",
                hh: "%dæ™‚é–“",
                d: "1æ—¥",
                dd: "%dæ—¥",
                M: "1ãƒ¶æœˆ",
                MM: "%dãƒ¶æœˆ",
                y: "1å¹´",
                yy: "%då¹´"
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function monthsCaseReplace(m, format) {
            var months = {
                nominative: "áƒ˜áƒáƒœáƒ•áƒáƒ áƒ˜_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒšáƒ˜_áƒ›áƒáƒ áƒ¢áƒ˜_áƒáƒžáƒ áƒ˜áƒšáƒ˜_áƒ›áƒáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒšáƒ˜áƒ¡áƒ˜_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ˜_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜".split("_"),
                accusative: "áƒ˜áƒáƒœáƒ•áƒáƒ áƒ¡_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒšáƒ¡_áƒ›áƒáƒ áƒ¢áƒ¡_áƒáƒžáƒ áƒ˜áƒšáƒ˜áƒ¡_áƒ›áƒáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒšáƒ˜áƒ¡áƒ¡_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ¡_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ¡_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡".split("_")
            }, nounCase = /D[oD] *MMMM?/.test(format) ? "accusative" : "nominative";
            return months[nounCase][m.month()];
        }
        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                nominative: "áƒ™áƒ•áƒ˜áƒ áƒ_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒžáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ˜_áƒ¨áƒáƒ‘áƒáƒ—áƒ˜".split("_"),
                accusative: "áƒ™áƒ•áƒ˜áƒ áƒáƒ¡_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒžáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ¡_áƒ¨áƒáƒ‘áƒáƒ—áƒ¡".split("_")
            }, nounCase = /(áƒ¬áƒ˜áƒœáƒ|áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’)/.test(format) ? "accusative" : "nominative";
            return weekdays[nounCase][m.day()];
        }
        return moment.lang("ka", {
            months: monthsCaseReplace,
            monthsShort: "áƒ˜áƒáƒœ_áƒ—áƒ”áƒ‘_áƒ›áƒáƒ _áƒáƒžáƒ _áƒ›áƒáƒ˜_áƒ˜áƒ•áƒœ_áƒ˜áƒ•áƒš_áƒáƒ’áƒ•_áƒ¡áƒ”áƒ¥_áƒáƒ¥áƒ¢_áƒœáƒáƒ”_áƒ“áƒ”áƒ™".split("_"),
            weekdays: weekdaysCaseReplace,
            weekdaysShort: "áƒ™áƒ•áƒ˜_áƒáƒ áƒ¨_áƒ¡áƒáƒ›_áƒáƒ—áƒ®_áƒ®áƒ£áƒ—_áƒžáƒáƒ _áƒ¨áƒáƒ‘".split("_"),
            weekdaysMin: "áƒ™áƒ•_áƒáƒ _áƒ¡áƒ_áƒáƒ—_áƒ®áƒ£_áƒžáƒ_áƒ¨áƒ".split("_"),
            longDateFormat: {
                LT: "h:mm A",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[áƒ“áƒ¦áƒ”áƒ¡] LT[-áƒ–áƒ”]",
                nextDay: "[áƒ®áƒ•áƒáƒš] LT[-áƒ–áƒ”]",
                lastDay: "[áƒ’áƒ£áƒ¨áƒ˜áƒœ] LT[-áƒ–áƒ”]",
                nextWeek: "[áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’] dddd LT[-áƒ–áƒ”]",
                lastWeek: "[áƒ¬áƒ˜áƒœáƒ] dddd LT-áƒ–áƒ”",
                sameElse: "L"
            },
            relativeTime: {
                future: function(s) {
                    return /(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ¬áƒ”áƒšáƒ˜)/.test(s) ? s.replace(/áƒ˜$/, "áƒ¨áƒ˜") : s + "áƒ¨áƒ˜";
                },
                past: function(s) {
                    if (/(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ“áƒ¦áƒ”|áƒ—áƒ•áƒ”)/.test(s)) return s.replace(/(áƒ˜|áƒ”)$/, "áƒ˜áƒ¡ áƒ¬áƒ˜áƒœ");
                    if (/áƒ¬áƒ”áƒšáƒ˜/.test(s)) return s.replace(/áƒ¬áƒ”áƒšáƒ˜$/, "áƒ¬áƒšáƒ˜áƒ¡ áƒ¬áƒ˜áƒœ");
                },
                s: "áƒ áƒáƒ›áƒ“áƒ”áƒœáƒ˜áƒ›áƒ” áƒ¬áƒáƒ›áƒ˜",
                m: "áƒ¬áƒ£áƒ—áƒ˜",
                mm: "%d áƒ¬áƒ£áƒ—áƒ˜",
                h: "áƒ¡áƒáƒáƒ—áƒ˜",
                hh: "%d áƒ¡áƒáƒáƒ—áƒ˜",
                d: "áƒ“áƒ¦áƒ”",
                dd: "%d áƒ“áƒ¦áƒ”",
                M: "áƒ—áƒ•áƒ”",
                MM: "%d áƒ—áƒ•áƒ”",
                y: "áƒ¬áƒ”áƒšáƒ˜",
                yy: "%d áƒ¬áƒ”áƒšáƒ˜"
            },
            ordinal: function(number) {
                if (0 === number) return number;
                if (1 === number) return number + "-áƒšáƒ˜";
                if (20 > number || 100 >= number && 0 === number % 20 || 0 === number % 100) return "áƒ›áƒ”-" + number;
                return number + "-áƒ”";
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ko", {
            months: "1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”".split("_"),
            monthsShort: "1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”".split("_"),
            weekdays: "ì¼ìš”ì¼_ì›”ìš”ì¼_í™”ìš”ì¼_ìˆ˜ìš”ì¼_ëª©ìš”ì¼_ê¸ˆìš”ì¼_í† ìš”ì¼".split("_"),
            weekdaysShort: "ì¼_ì›”_í™”_ìˆ˜_ëª©_ê¸ˆ_í† ".split("_"),
            weekdaysMin: "ì¼_ì›”_í™”_ìˆ˜_ëª©_ê¸ˆ_í† ".split("_"),
            longDateFormat: {
                LT: "A hì‹œ mmë¶„",
                L: "YYYY.MM.DD",
                LL: "YYYYë…„ MMMM Dì¼",
                LLL: "YYYYë…„ MMMM Dì¼ LT",
                LLLL: "YYYYë…„ MMMM Dì¼ dddd LT"
            },
            meridiem: function(hour) {
                return 12 > hour ? "ì˜¤ì „" : "ì˜¤í›„";
            },
            calendar: {
                sameDay: "ì˜¤ëŠ˜ LT",
                nextDay: "ë‚´ì¼ LT",
                nextWeek: "dddd LT",
                lastDay: "ì–´ì œ LT",
                lastWeek: "ì§€ë‚œì£¼ dddd LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s í›„",
                past: "%s ì „",
                s: "ëª‡ì´ˆ",
                ss: "%dì´ˆ",
                m: "ì¼ë¶„",
                mm: "%dë¶„",
                h: "í•œì‹œê°„",
                hh: "%dì‹œê°„",
                d: "í•˜ë£¨",
                dd: "%dì¼",
                M: "í•œë‹¬",
                MM: "%dë‹¬",
                y: "ì¼ë…„",
                yy: "%dë…„"
            },
            ordinal: "%dì¼",
            meridiemParse: /(ì˜¤ì „|ì˜¤í›„)/,
            isPM: function(token) {
                return "ì˜¤í›„" === token;
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function processRelativeTime(number, withoutSuffix, key) {
            var format = {
                m: [ "eng Minutt", "enger Minutt" ],
                h: [ "eng Stonn", "enger Stonn" ],
                d: [ "een Dag", "engem Dag" ],
                dd: [ number + " Deeg", number + " Deeg" ],
                M: [ "ee Mount", "engem Mount" ],
                MM: [ number + " MÃ©int", number + " MÃ©int" ],
                y: [ "ee Joer", "engem Joer" ],
                yy: [ number + " Joer", number + " Joer" ]
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }
        function processFutureTime(string) {
            var number = string.substr(0, string.indexOf(" "));
            if (eifelerRegelAppliesToNumber(number)) return "a " + string;
            return "an " + string;
        }
        function processPastTime(string) {
            var number = string.substr(0, string.indexOf(" "));
            if (eifelerRegelAppliesToNumber(number)) return "viru " + string;
            return "virun " + string;
        }
        function processLastWeek() {
            var weekday = this.format("d");
            if (eifelerRegelAppliesToWeekday(weekday)) return "[Leschte] dddd [um] LT";
            return "[Leschten] dddd [um] LT";
        }
        function eifelerRegelAppliesToWeekday(weekday) {
            weekday = parseInt(weekday, 10);
            switch (weekday) {
              case 0:
              case 1:
              case 3:
              case 5:
              case 6:
                return true;

              default:
                return false;
            }
        }
        function eifelerRegelAppliesToNumber(number) {
            number = parseInt(number, 10);
            if (isNaN(number)) return false;
            if (0 > number) return true;
            if (10 > number) {
                if (number >= 4 && 7 >= number) return true;
                return false;
            }
            if (100 > number) {
                var lastDigit = number % 10, firstDigit = number / 10;
                if (0 === lastDigit) return eifelerRegelAppliesToNumber(firstDigit);
                return eifelerRegelAppliesToNumber(lastDigit);
            }
            if (1e4 > number) {
                while (number >= 10) number /= 10;
                return eifelerRegelAppliesToNumber(number);
            }
            number /= 1e3;
            return eifelerRegelAppliesToNumber(number);
        }
        return moment.lang("lb", {
            months: "Januar_Februar_MÃ¤erz_AbrÃ«ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
            monthsShort: "Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
            weekdays: "Sonndeg_MÃ©indeg_DÃ«nschdeg_MÃ«ttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),
            weekdaysShort: "So._MÃ©._DÃ«._MÃ«._Do._Fr._Sa.".split("_"),
            weekdaysMin: "So_MÃ©_DÃ«_MÃ«_Do_Fr_Sa".split("_"),
            longDateFormat: {
                LT: "H:mm [Auer]",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Haut um] LT",
                sameElse: "L",
                nextDay: "[Muer um] LT",
                nextWeek: "dddd [um] LT",
                lastDay: "[GÃ«schter um] LT",
                lastWeek: processLastWeek
            },
            relativeTime: {
                future: processFutureTime,
                past: processPastTime,
                s: "e puer Sekonnen",
                m: processRelativeTime,
                mm: "%d Minutten",
                h: processRelativeTime,
                hh: "%d Stonnen",
                d: processRelativeTime,
                dd: processRelativeTime,
                M: processRelativeTime,
                MM: processRelativeTime,
                y: processRelativeTime,
                yy: processRelativeTime
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translateSeconds(number, withoutSuffix, key, isFuture) {
            return withoutSuffix ? "kelios sekundÄ—s" : isFuture ? "keliÅ³ sekundÅ¾iÅ³" : "kelias sekundes";
        }
        function translateSingular(number, withoutSuffix, key, isFuture) {
            return withoutSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
        }
        function special(number) {
            return 0 === number % 10 || number > 10 && 20 > number;
        }
        function forms(key) {
            return units[key].split("_");
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            return 1 === number ? result + translateSingular(number, withoutSuffix, key[0], isFuture) : withoutSuffix ? result + (special(number) ? forms(key)[1] : forms(key)[0]) : isFuture ? result + forms(key)[1] : result + (special(number) ? forms(key)[1] : forms(key)[2]);
        }
        function relativeWeekDay(moment, format) {
            var nominative = -1 === format.indexOf("dddd LT"), weekDay = weekDays[moment.weekday()];
            return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + "Ä¯";
        }
        var units = {
            m: "minutÄ—_minutÄ—s_minutÄ™",
            mm: "minutÄ—s_minuÄiÅ³_minutes",
            h: "valanda_valandos_valandÄ…",
            hh: "valandos_valandÅ³_valandas",
            d: "diena_dienos_dienÄ…",
            dd: "dienos_dienÅ³_dienas",
            M: "mÄ—nuo_mÄ—nesio_mÄ—nesÄ¯",
            MM: "mÄ—nesiai_mÄ—nesiÅ³_mÄ—nesius",
            y: "metai_metÅ³_metus",
            yy: "metai_metÅ³_metus"
        }, weekDays = "pirmadienis_antradienis_treÄiadienis_ketvirtadienis_penktadienis_Å¡eÅ¡tadienis_sekmadienis".split("_");
        return moment.lang("lt", {
            months: "sausio_vasario_kovo_balandÅ¾io_geguÅ¾Ä—s_birÅ¾Ä—lio_liepos_rugpjÅ«Äio_rugsÄ—jo_spalio_lapkriÄio_gruodÅ¾io".split("_"),
            monthsShort: "sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),
            weekdays: relativeWeekDay,
            weekdaysShort: "Sek_Pir_Ant_Tre_Ket_Pen_Å eÅ¡".split("_"),
            weekdaysMin: "S_P_A_T_K_Pn_Å ".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "YYYY-MM-DD",
                LL: "YYYY [m.] MMMM D [d.]",
                LLL: "YYYY [m.] MMMM D [d.], LT [val.]",
                LLLL: "YYYY [m.] MMMM D [d.], dddd, LT [val.]",
                l: "YYYY-MM-DD",
                ll: "YYYY [m.] MMMM D [d.]",
                lll: "YYYY [m.] MMMM D [d.], LT [val.]",
                llll: "YYYY [m.] MMMM D [d.], ddd, LT [val.]"
            },
            calendar: {
                sameDay: "[Å iandien] LT",
                nextDay: "[Rytoj] LT",
                nextWeek: "dddd LT",
                lastDay: "[Vakar] LT",
                lastWeek: "[PraÄ—jusÄ¯] dddd LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "po %s",
                past: "prieÅ¡ %s",
                s: translateSeconds,
                m: translateSingular,
                mm: translate,
                h: translateSingular,
                hh: translate,
                d: translateSingular,
                dd: translate,
                M: translateSingular,
                MM: translate,
                y: translateSingular,
                yy: translate
            },
            ordinal: function(number) {
                return number + "-oji";
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function format(word, number, withoutSuffix) {
            var forms = word.split("_");
            return withoutSuffix ? 1 === number % 10 && 11 !== number ? forms[2] : forms[3] : 1 === number % 10 && 11 !== number ? forms[0] : forms[1];
        }
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            return number + " " + format(units[key], number, withoutSuffix);
        }
        var units = {
            mm: "minÅ«ti_minÅ«tes_minÅ«te_minÅ«tes",
            hh: "stundu_stundas_stunda_stundas",
            dd: "dienu_dienas_diena_dienas",
            MM: "mÄ“nesi_mÄ“neÅ¡us_mÄ“nesis_mÄ“neÅ¡i",
            yy: "gadu_gadus_gads_gadi"
        };
        return moment.lang("lv", {
            months: "janvÄris_februÄris_marts_aprÄ«lis_maijs_jÅ«nijs_jÅ«lijs_augusts_septembris_oktobris_novembris_decembris".split("_"),
            monthsShort: "jan_feb_mar_apr_mai_jÅ«n_jÅ«l_aug_sep_okt_nov_dec".split("_"),
            weekdays: "svÄ“tdiena_pirmdiena_otrdiena_treÅ¡diena_ceturtdiena_piektdiena_sestdiena".split("_"),
            weekdaysShort: "Sv_P_O_T_C_Pk_S".split("_"),
            weekdaysMin: "Sv_P_O_T_C_Pk_S".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "YYYY. [gada] D. MMMM",
                LLL: "YYYY. [gada] D. MMMM, LT",
                LLLL: "YYYY. [gada] D. MMMM, dddd, LT"
            },
            calendar: {
                sameDay: "[Å odien pulksten] LT",
                nextDay: "[RÄ«t pulksten] LT",
                nextWeek: "dddd [pulksten] LT",
                lastDay: "[Vakar pulksten] LT",
                lastWeek: "[PagÄjuÅ¡Ä] dddd [pulksten] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s vÄ“lÄk",
                past: "%s agrÄk",
                s: "daÅ¾as sekundes",
                m: "minÅ«ti",
                mm: relativeTimeWithPlural,
                h: "stundu",
                hh: relativeTimeWithPlural,
                d: "dienu",
                dd: relativeTimeWithPlural,
                M: "mÄ“nesi",
                MM: relativeTimeWithPlural,
                y: "gadu",
                yy: relativeTimeWithPlural
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("mk", {
            months: "Ñ˜Ð°Ð½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½Ð¸_Ñ˜ÑƒÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸".split("_"),
            monthsShort: "Ñ˜Ð°Ð½_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½_Ñ˜ÑƒÐ»_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº".split("_"),
            weekdays: "Ð½ÐµÐ´ÐµÐ»Ð°_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚Ð¾Ðº_Ð¿ÐµÑ‚Ð¾Ðº_ÑÐ°Ð±Ð¾Ñ‚Ð°".split("_"),
            weekdaysShort: "Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ðµ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÐ°Ð±".split("_"),
            weekdaysMin: "Ð½e_Ð¿o_Ð²Ñ‚_ÑÑ€_Ñ‡Ðµ_Ð¿Ðµ_Ña".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "D.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Ð”ÐµÐ½ÐµÑ Ð²Ð¾] LT",
                nextDay: "[Ð£Ñ‚Ñ€Ðµ Ð²Ð¾] LT",
                nextWeek: "dddd [Ð²Ð¾] LT",
                lastDay: "[Ð’Ñ‡ÐµÑ€Ð° Ð²Ð¾] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                      case 6:
                        return "[Ð’Ð¾ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ñ‚Ð°Ñ‚Ð°] dddd [Ð²Ð¾] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[Ð’Ð¾ Ð¸Ð·Ð¼Ð¸Ð½Ð°Ñ‚Ð¸Ð¾Ñ‚] dddd [Ð²Ð¾] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "Ð¿Ð¾ÑÐ»Ðµ %s",
                past: "Ð¿Ñ€ÐµÐ´ %s",
                s: "Ð½ÐµÐºÐ¾Ð»ÐºÑƒ ÑÐµÐºÑƒÐ½Ð´Ð¸",
                m: "Ð¼Ð¸Ð½ÑƒÑ‚Ð°",
                mm: "%d Ð¼Ð¸Ð½ÑƒÑ‚Ð¸",
                h: "Ñ‡Ð°Ñ",
                hh: "%d Ñ‡Ð°ÑÐ°",
                d: "Ð´ÐµÐ½",
                dd: "%d Ð´ÐµÐ½Ð°",
                M: "Ð¼ÐµÑÐµÑ†",
                MM: "%d Ð¼ÐµÑÐµÑ†Ð¸",
                y: "Ð³Ð¾Ð´Ð¸Ð½Ð°",
                yy: "%d Ð³Ð¾Ð´Ð¸Ð½Ð¸"
            },
            ordinal: function(number) {
                var lastDigit = number % 10, last2Digits = number % 100;
                return 0 === number ? number + "-ÐµÐ²" : 0 === last2Digits ? number + "-ÐµÐ½" : last2Digits > 10 && 20 > last2Digits ? number + "-Ñ‚Ð¸" : 1 === lastDigit ? number + "-Ð²Ð¸" : 2 === lastDigit ? number + "-Ñ€Ð¸" : 7 === lastDigit || 8 === lastDigit ? number + "-Ð¼Ð¸" : number + "-Ñ‚Ð¸";
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ml", {
            months: "à´œà´¨àµà´µà´°à´¿_à´«àµ†à´¬àµà´°àµà´µà´°à´¿_à´®à´¾àµ¼à´šàµà´šàµ_à´à´ªàµà´°à´¿àµ½_à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ_à´“à´—à´¸àµà´±àµà´±àµ_à´¸àµ†à´ªàµà´±àµà´±à´‚à´¬àµ¼_à´’à´•àµà´Ÿàµ‹à´¬àµ¼_à´¨à´µà´‚à´¬àµ¼_à´¡à´¿à´¸à´‚à´¬àµ¼".split("_"),
            monthsShort: "à´œà´¨àµ._à´«àµ†à´¬àµà´°àµ._à´®à´¾àµ¼._à´à´ªàµà´°à´¿._à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ._à´“à´—._à´¸àµ†à´ªàµà´±àµà´±._à´’à´•àµà´Ÿàµ‹._à´¨à´µà´‚._à´¡à´¿à´¸à´‚.".split("_"),
            weekdays: "à´žà´¾à´¯à´±à´¾à´´àµà´š_à´¤à´¿à´™àµà´•à´³à´¾à´´àµà´š_à´šàµŠà´µàµà´µà´¾à´´àµà´š_à´¬àµà´§à´¨à´¾à´´àµà´š_à´µàµà´¯à´¾à´´à´¾à´´àµà´š_à´µàµ†à´³àµà´³à´¿à´¯à´¾à´´àµà´š_à´¶à´¨à´¿à´¯à´¾à´´àµà´š".split("_"),
            weekdaysShort: "à´žà´¾à´¯àµ¼_à´¤à´¿à´™àµà´•àµ¾_à´šàµŠà´µàµà´µ_à´¬àµà´§àµ»_à´µàµà´¯à´¾à´´à´‚_à´µàµ†à´³àµà´³à´¿_à´¶à´¨à´¿".split("_"),
            weekdaysMin: "à´žà´¾_à´¤à´¿_à´šàµŠ_à´¬àµ_à´µàµà´¯à´¾_à´µàµ†_à´¶".split("_"),
            longDateFormat: {
                LT: "A h:mm -à´¨àµ",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, LT",
                LLLL: "dddd, D MMMM YYYY, LT"
            },
            calendar: {
                sameDay: "[à´‡à´¨àµà´¨àµ] LT",
                nextDay: "[à´¨à´¾à´³àµ†] LT",
                nextWeek: "dddd, LT",
                lastDay: "[à´‡à´¨àµà´¨à´²àµ†] LT",
                lastWeek: "[à´•à´´à´¿à´žàµà´ž] dddd, LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s à´•à´´à´¿à´žàµà´žàµ",
                past: "%s à´®àµàµ»à´ªàµ",
                s: "à´…àµ½à´ª à´¨à´¿à´®à´¿à´·à´™àµà´™àµ¾",
                m: "à´’à´°àµ à´®à´¿à´¨à´¿à´±àµà´±àµ",
                mm: "%d à´®à´¿à´¨à´¿à´±àµà´±àµ",
                h: "à´’à´°àµ à´®à´£à´¿à´•àµà´•àµ‚àµ¼",
                hh: "%d à´®à´£à´¿à´•àµà´•àµ‚àµ¼",
                d: "à´’à´°àµ à´¦à´¿à´µà´¸à´‚",
                dd: "%d à´¦à´¿à´µà´¸à´‚",
                M: "à´’à´°àµ à´®à´¾à´¸à´‚",
                MM: "%d à´®à´¾à´¸à´‚",
                y: "à´’à´°àµ à´µàµ¼à´·à´‚",
                yy: "%d à´µàµ¼à´·à´‚"
            },
            meridiem: function(hour) {
                return 4 > hour ? "à´°à´¾à´¤àµà´°à´¿" : 12 > hour ? "à´°à´¾à´µà´¿à´²àµ†" : 17 > hour ? "à´‰à´šàµà´š à´•à´´à´¿à´žàµà´žàµ" : 20 > hour ? "à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚" : "à´°à´¾à´¤àµà´°à´¿";
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var symbolMap = {
            "1": "à¥§",
            "2": "à¥¨",
            "3": "à¥©",
            "4": "à¥ª",
            "5": "à¥«",
            "6": "à¥¬",
            "7": "à¥­",
            "8": "à¥®",
            "9": "à¥¯",
            "0": "à¥¦"
        }, numberMap = {
            "à¥§": "1",
            "à¥¨": "2",
            "à¥©": "3",
            "à¥ª": "4",
            "à¥«": "5",
            "à¥¬": "6",
            "à¥­": "7",
            "à¥®": "8",
            "à¥¯": "9",
            "à¥¦": "0"
        };
        return moment.lang("mr", {
            months: "à¤œà¤¾à¤¨à¥‡à¤µà¤¾à¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤¾à¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤à¤ªà¥à¤°à¤¿à¤²_à¤®à¥‡_à¤œà¥‚à¤¨_à¤œà¥à¤²à¥ˆ_à¤‘à¤—à¤¸à¥à¤Ÿ_à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚à¤¬à¤°_à¤‘à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤‚à¤¬à¤°".split("_"),
            monthsShort: "à¤œà¤¾à¤¨à¥‡._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š._à¤à¤ªà¥à¤°à¤¿._à¤®à¥‡._à¤œà¥‚à¤¨._à¤œà¥à¤²à¥ˆ._à¤‘à¤—._à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚._à¤‘à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚._à¤¡à¤¿à¤¸à¥‡à¤‚.".split("_"),
            weekdays: "à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤³à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°".split("_"),
            weekdaysShort: "à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤³_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿".split("_"),
            weekdaysMin: "à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶".split("_"),
            longDateFormat: {
                LT: "A h:mm à¤µà¤¾à¤œà¤¤à¤¾",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, LT",
                LLLL: "dddd, D MMMM YYYY, LT"
            },
            calendar: {
                sameDay: "[à¤†à¤œ] LT",
                nextDay: "[à¤‰à¤¦à¥à¤¯à¤¾] LT",
                nextWeek: "dddd, LT",
                lastDay: "[à¤•à¤¾à¤²] LT",
                lastWeek: "[à¤®à¤¾à¤—à¥€à¤²] dddd, LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s à¤¨à¤‚à¤¤à¤°",
                past: "%s à¤ªà¥‚à¤°à¥à¤µà¥€",
                s: "à¤¸à¥‡à¤•à¤‚à¤¦",
                m: "à¤à¤• à¤®à¤¿à¤¨à¤¿à¤Ÿ",
                mm: "%d à¤®à¤¿à¤¨à¤¿à¤Ÿà¥‡",
                h: "à¤à¤• à¤¤à¤¾à¤¸",
                hh: "%d à¤¤à¤¾à¤¸",
                d: "à¤à¤• à¤¦à¤¿à¤µà¤¸",
                dd: "%d à¤¦à¤¿à¤µà¤¸",
                M: "à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾",
                MM: "%d à¤®à¤¹à¤¿à¤¨à¥‡",
                y: "à¤à¤• à¤µà¤°à¥à¤·",
                yy: "%d à¤µà¤°à¥à¤·à¥‡"
            },
            preparse: function(string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function(match) {
                    return numberMap[match];
                });
            },
            postformat: function(string) {
                return string.replace(/\d/g, function(match) {
                    return symbolMap[match];
                });
            },
            meridiem: function(hour) {
                return 4 > hour ? "à¤°à¤¾à¤¤à¥à¤°à¥€" : 10 > hour ? "à¤¸à¤•à¤¾à¤³à¥€" : 17 > hour ? "à¤¦à¥à¤ªà¤¾à¤°à¥€" : 20 > hour ? "à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€" : "à¤°à¤¾à¤¤à¥à¤°à¥€";
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ms-my", {
            months: "Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember".split("_"),
            monthsShort: "Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis".split("_"),
            weekdays: "Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu".split("_"),
            weekdaysShort: "Ahd_Isn_Sel_Rab_Kha_Jum_Sab".split("_"),
            weekdaysMin: "Ah_Is_Sl_Rb_Km_Jm_Sb".split("_"),
            longDateFormat: {
                LT: "HH.mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY [pukul] LT",
                LLLL: "dddd, D MMMM YYYY [pukul] LT"
            },
            meridiem: function(hours) {
                return 11 > hours ? "pagi" : 15 > hours ? "tengahari" : 19 > hours ? "petang" : "malam";
            },
            calendar: {
                sameDay: "[Hari ini pukul] LT",
                nextDay: "[Esok pukul] LT",
                nextWeek: "dddd [pukul] LT",
                lastDay: "[Kelmarin pukul] LT",
                lastWeek: "dddd [lepas pukul] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "dalam %s",
                past: "%s yang lepas",
                s: "beberapa saat",
                m: "seminit",
                mm: "%d minit",
                h: "sejam",
                hh: "%d jam",
                d: "sehari",
                dd: "%d hari",
                M: "sebulan",
                MM: "%d bulan",
                y: "setahun",
                yy: "%d tahun"
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("nb", {
            months: "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
            monthsShort: "jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),
            weekdays: "sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag".split("_"),
            weekdaysShort: "sÃ¸._ma._ti._on._to._fr._lÃ¸.".split("_"),
            weekdaysMin: "sÃ¸_ma_ti_on_to_fr_lÃ¸".split("_"),
            longDateFormat: {
                LT: "H.mm",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY [kl.] LT",
                LLLL: "dddd D. MMMM YYYY [kl.] LT"
            },
            calendar: {
                sameDay: "[i dag kl.] LT",
                nextDay: "[i morgen kl.] LT",
                nextWeek: "dddd [kl.] LT",
                lastDay: "[i gÃ¥r kl.] LT",
                lastWeek: "[forrige] dddd [kl.] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "om %s",
                past: "for %s siden",
                s: "noen sekunder",
                m: "ett minutt",
                mm: "%d minutter",
                h: "en time",
                hh: "%d timer",
                d: "en dag",
                dd: "%d dager",
                M: "en mÃ¥ned",
                MM: "%d mÃ¥neder",
                y: "ett Ã¥r",
                yy: "%d Ã¥r"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var symbolMap = {
            "1": "à¥§",
            "2": "à¥¨",
            "3": "à¥©",
            "4": "à¥ª",
            "5": "à¥«",
            "6": "à¥¬",
            "7": "à¥­",
            "8": "à¥®",
            "9": "à¥¯",
            "0": "à¥¦"
        }, numberMap = {
            "à¥§": "1",
            "à¥¨": "2",
            "à¥©": "3",
            "à¥ª": "4",
            "à¥«": "5",
            "à¥¬": "6",
            "à¥­": "7",
            "à¥®": "8",
            "à¥¯": "9",
            "à¥¦": "0"
        };
        return moment.lang("ne", {
            months: "à¤œà¤¨à¤µà¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿à¤²_à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤·à¥à¤Ÿ_à¤¸à¥‡à¤ªà¥à¤Ÿà¥‡à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤­à¥‡à¤®à¥à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤®à¥à¤¬à¤°".split("_"),
            monthsShort: "à¤œà¤¨._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿._à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ._à¤…à¤—._à¤¸à¥‡à¤ªà¥à¤Ÿ._à¤…à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤­à¥‡._à¤¡à¤¿à¤¸à¥‡.".split("_"),
            weekdays: "à¤†à¤‡à¤¤à¤¬à¤¾à¤°_à¤¸à¥‹à¤®à¤¬à¤¾à¤°_à¤®à¤™à¥à¤—à¤²à¤¬à¤¾à¤°_à¤¬à¥à¤§à¤¬à¤¾à¤°_à¤¬à¤¿à¤¹à¤¿à¤¬à¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤¬à¤¾à¤°_à¤¶à¤¨à¤¿à¤¬à¤¾à¤°".split("_"),
            weekdaysShort: "à¤†à¤‡à¤¤._à¤¸à¥‹à¤®._à¤®à¤™à¥à¤—à¤²._à¤¬à¥à¤§._à¤¬à¤¿à¤¹à¤¿._à¤¶à¥à¤•à¥à¤°._à¤¶à¤¨à¤¿.".split("_"),
            weekdaysMin: "à¤†à¤‡._à¤¸à¥‹._à¤®à¤™à¥_à¤¬à¥._à¤¬à¤¿._à¤¶à¥._à¤¶.".split("_"),
            longDateFormat: {
                LT: "Aà¤•à¥‹ h:mm à¤¬à¤œà¥‡",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, LT",
                LLLL: "dddd, D MMMM YYYY, LT"
            },
            preparse: function(string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function(match) {
                    return numberMap[match];
                });
            },
            postformat: function(string) {
                return string.replace(/\d/g, function(match) {
                    return symbolMap[match];
                });
            },
            meridiem: function(hour) {
                return 3 > hour ? "à¤°à¤¾à¤¤à¥€" : 10 > hour ? "à¤¬à¤¿à¤¹à¤¾à¤¨" : 15 > hour ? "à¤¦à¤¿à¤‰à¤à¤¸à¥‹" : 18 > hour ? "à¤¬à¥‡à¤²à¥à¤•à¤¾" : 20 > hour ? "à¤¸à¤¾à¤à¤" : "à¤°à¤¾à¤¤à¥€";
            },
            calendar: {
                sameDay: "[à¤†à¤œ] LT",
                nextDay: "[à¤­à¥‹à¤²à¥€] LT",
                nextWeek: "[à¤†à¤‰à¤à¤¦à¥‹] dddd[,] LT",
                lastDay: "[à¤¹à¤¿à¤œà¥‹] LT",
                lastWeek: "[à¤—à¤à¤•à¥‹] dddd[,] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%sà¤®à¤¾",
                past: "%s à¤…à¤—à¤¾à¤¡à¥€",
                s: "à¤•à¥‡à¤¹à¥€ à¤¸à¤®à¤¯",
                m: "à¤à¤• à¤®à¤¿à¤¨à¥‡à¤Ÿ",
                mm: "%d à¤®à¤¿à¤¨à¥‡à¤Ÿ",
                h: "à¤à¤• à¤˜à¤£à¥à¤Ÿà¤¾",
                hh: "%d à¤˜à¤£à¥à¤Ÿà¤¾",
                d: "à¤à¤• à¤¦à¤¿à¤¨",
                dd: "%d à¤¦à¤¿à¤¨",
                M: "à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾",
                MM: "%d à¤®à¤¹à¤¿à¤¨à¤¾",
                y: "à¤à¤• à¤¬à¤°à¥à¤·",
                yy: "%d à¤¬à¤°à¥à¤·"
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var monthsShortWithDots = "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_"), monthsShortWithoutDots = "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_");
        return moment.lang("nl", {
            months: "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
            monthsShort: function(m, format) {
                return /-MMM-/.test(format) ? monthsShortWithoutDots[m.month()] : monthsShortWithDots[m.month()];
            },
            weekdays: "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
            weekdaysShort: "zo._ma._di._wo._do._vr._za.".split("_"),
            weekdaysMin: "Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD-MM-YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[vandaag om] LT",
                nextDay: "[morgen om] LT",
                nextWeek: "dddd [om] LT",
                lastDay: "[gisteren om] LT",
                lastWeek: "[afgelopen] dddd [om] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "over %s",
                past: "%s geleden",
                s: "een paar seconden",
                m: "Ã©Ã©n minuut",
                mm: "%d minuten",
                h: "Ã©Ã©n uur",
                hh: "%d uur",
                d: "Ã©Ã©n dag",
                dd: "%d dagen",
                M: "Ã©Ã©n maand",
                MM: "%d maanden",
                y: "Ã©Ã©n jaar",
                yy: "%d jaar"
            },
            ordinal: function(number) {
                return number + (1 === number || 8 === number || number >= 20 ? "ste" : "de");
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("nn", {
            months: "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
            monthsShort: "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
            weekdays: "sundag_mÃ¥ndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),
            weekdaysShort: "sun_mÃ¥n_tys_ons_tor_fre_lau".split("_"),
            weekdaysMin: "su_mÃ¥_ty_on_to_fr_lÃ¸".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[I dag klokka] LT",
                nextDay: "[I morgon klokka] LT",
                nextWeek: "dddd [klokka] LT",
                lastDay: "[I gÃ¥r klokka] LT",
                lastWeek: "[FÃ¸regÃ¥ende] dddd [klokka] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "om %s",
                past: "for %s siden",
                s: "noen sekund",
                m: "ett minutt",
                mm: "%d minutt",
                h: "en time",
                hh: "%d timar",
                d: "en dag",
                dd: "%d dagar",
                M: "en mÃ¥nad",
                MM: "%d mÃ¥nader",
                y: "ett Ã¥r",
                yy: "%d Ã¥r"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(n) {
            return 5 > n % 10 && n % 10 > 1 && 1 !== ~~(n / 10) % 10;
        }
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "minuta" : "minutÄ™";

              case "mm":
                return result + (plural(number) ? "minuty" : "minut");

              case "h":
                return withoutSuffix ? "godzina" : "godzinÄ™";

              case "hh":
                return result + (plural(number) ? "godziny" : "godzin");

              case "MM":
                return result + (plural(number) ? "miesiÄ…ce" : "miesiÄ™cy");

              case "yy":
                return result + (plural(number) ? "lata" : "lat");
            }
        }
        var monthsNominative = "styczeÅ„_luty_marzec_kwiecieÅ„_maj_czerwiec_lipiec_sierpieÅ„_wrzesieÅ„_paÅºdziernik_listopad_grudzieÅ„".split("_"), monthsSubjective = "stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrzeÅ›nia_paÅºdziernika_listopada_grudnia".split("_");
        return moment.lang("pl", {
            months: function(momentToFormat, format) {
                return /D MMMM/.test(format) ? monthsSubjective[momentToFormat.month()] : monthsNominative[momentToFormat.month()];
            },
            monthsShort: "sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paÅº_lis_gru".split("_"),
            weekdays: "niedziela_poniedziaÅ‚ek_wtorek_Å›roda_czwartek_piÄ…tek_sobota".split("_"),
            weekdaysShort: "nie_pon_wt_Å›r_czw_pt_sb".split("_"),
            weekdaysMin: "N_Pn_Wt_Åšr_Cz_Pt_So".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[DziÅ› o] LT",
                nextDay: "[Jutro o] LT",
                nextWeek: "[W] dddd [o] LT",
                lastDay: "[Wczoraj o] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[W zeszÅ‚Ä… niedzielÄ™ o] LT";

                      case 3:
                        return "[W zeszÅ‚Ä… Å›rodÄ™ o] LT";

                      case 6:
                        return "[W zeszÅ‚Ä… sobotÄ™ o] LT";

                      default:
                        return "[W zeszÅ‚y] dddd [o] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "%s temu",
                s: "kilka sekund",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "1 dzieÅ„",
                dd: "%d dni",
                M: "miesiÄ…c",
                MM: translate,
                y: "rok",
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("pt-br", {
            months: "Janeiro_Fevereiro_MarÃ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
            monthsShort: "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
            weekdays: "Domingo_Segunda-feira_TerÃ§a-feira_Quarta-feira_Quinta-feira_Sexta-feira_SÃ¡bado".split("_"),
            weekdaysShort: "Dom_Seg_Ter_Qua_Qui_Sex_SÃ¡b".split("_"),
            weekdaysMin: "Dom_2Âª_3Âª_4Âª_5Âª_6Âª_SÃ¡b".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D [de] MMMM [de] YYYY",
                LLL: "D [de] MMMM [de] YYYY LT",
                LLLL: "dddd, D [de] MMMM [de] YYYY LT"
            },
            calendar: {
                sameDay: "[Hoje Ã s] LT",
                nextDay: "[AmanhÃ£ Ã s] LT",
                nextWeek: "dddd [Ã s] LT",
                lastDay: "[Ontem Ã s] LT",
                lastWeek: function() {
                    return 0 === this.day() || 6 === this.day() ? "[Ãšltimo] dddd [Ã s] LT" : "[Ãšltima] dddd [Ã s] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "em %s",
                past: "%s atrÃ¡s",
                s: "segundos",
                m: "um minuto",
                mm: "%d minutos",
                h: "uma hora",
                hh: "%d horas",
                d: "um dia",
                dd: "%d dias",
                M: "um mÃªs",
                MM: "%d meses",
                y: "um ano",
                yy: "%d anos"
            },
            ordinal: "%dÂº"
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("pt", {
            months: "Janeiro_Fevereiro_MarÃ§o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
            monthsShort: "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
            weekdays: "Domingo_Segunda-feira_TerÃ§a-feira_Quarta-feira_Quinta-feira_Sexta-feira_SÃ¡bado".split("_"),
            weekdaysShort: "Dom_Seg_Ter_Qua_Qui_Sex_SÃ¡b".split("_"),
            weekdaysMin: "Dom_2Âª_3Âª_4Âª_5Âª_6Âª_SÃ¡b".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D [de] MMMM [de] YYYY",
                LLL: "D [de] MMMM [de] YYYY LT",
                LLLL: "dddd, D [de] MMMM [de] YYYY LT"
            },
            calendar: {
                sameDay: "[Hoje Ã s] LT",
                nextDay: "[AmanhÃ£ Ã s] LT",
                nextWeek: "dddd [Ã s] LT",
                lastDay: "[Ontem Ã s] LT",
                lastWeek: function() {
                    return 0 === this.day() || 6 === this.day() ? "[Ãšltimo] dddd [Ã s] LT" : "[Ãšltima] dddd [Ã s] LT";
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "em %s",
                past: "%s atrÃ¡s",
                s: "segundos",
                m: "um minuto",
                mm: "%d minutos",
                h: "uma hora",
                hh: "%d horas",
                d: "um dia",
                dd: "%d dias",
                M: "um mÃªs",
                MM: "%d meses",
                y: "um ano",
                yy: "%d anos"
            },
            ordinal: "%dÂº",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                mm: "minute",
                hh: "ore",
                dd: "zile",
                MM: "luni",
                yy: "ani"
            }, separator = " ";
            (number % 100 >= 20 || number >= 100 && 0 === number % 100) && (separator = " de ");
            return number + separator + format[key];
        }
        return moment.lang("ro", {
            months: "ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),
            monthsShort: "ian_feb_mar_apr_mai_iun_iul_aug_sep_oct_noi_dec".split("_"),
            weekdays: "duminicÄƒ_luni_marÈ›i_miercuri_joi_vineri_sÃ¢mbÄƒtÄƒ".split("_"),
            weekdaysShort: "Dum_Lun_Mar_Mie_Joi_Vin_SÃ¢m".split("_"),
            weekdaysMin: "Du_Lu_Ma_Mi_Jo_Vi_SÃ¢".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY H:mm",
                LLLL: "dddd, D MMMM YYYY H:mm"
            },
            calendar: {
                sameDay: "[azi la] LT",
                nextDay: "[mÃ¢ine la] LT",
                nextWeek: "dddd [la] LT",
                lastDay: "[ieri la] LT",
                lastWeek: "[fosta] dddd [la] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "peste %s",
                past: "%s Ã®n urmÄƒ",
                s: "cÃ¢teva secunde",
                m: "un minut",
                mm: relativeTimeWithPlural,
                h: "o orÄƒ",
                hh: relativeTimeWithPlural,
                d: "o zi",
                dd: relativeTimeWithPlural,
                M: "o lunÄƒ",
                MM: relativeTimeWithPlural,
                y: "un an",
                yy: relativeTimeWithPlural
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "jedna minuta" : "jedne minute";

              case "mm":
                result += 1 === number ? "minuta" : 2 === number || 3 === number || 4 === number ? "minute" : "minuta";
                return result;

              case "h":
                return withoutSuffix ? "jedan sat" : "jednog sata";

              case "hh":
                result += 1 === number ? "sat" : 2 === number || 3 === number || 4 === number ? "sata" : "sati";
                return result;

              case "dd":
                result += 1 === number ? "dan" : "dana";
                return result;

              case "MM":
                result += 1 === number ? "mesec" : 2 === number || 3 === number || 4 === number ? "meseca" : "meseci";
                return result;

              case "yy":
                result += 1 === number ? "godina" : 2 === number || 3 === number || 4 === number ? "godine" : "godina";
                return result;
            }
        }
        return moment.lang("rs", {
            months: "januar_februar_mart_april_maj_jun_jul_avgust_septembar_oktobar_novembar_decembar".split("_"),
            monthsShort: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
            weekdays: "nedelja_ponedeljak_utorak_sreda_Äetvrtak_petak_subota".split("_"),
            weekdaysShort: "ned._pon._uto._sre._Äet._pet._sub.".split("_"),
            weekdaysMin: "ne_po_ut_sr_Äe_pe_su".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[danas u] LT",
                nextDay: "[sutra u] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[u] [nedelju] [u] LT";

                      case 3:
                        return "[u] [sredu] [u] LT";

                      case 6:
                        return "[u] [subotu] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[u] dddd [u] LT";
                    }
                },
                lastDay: "[juÄe u] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                        return "[proÅ¡lu] dddd [u] LT";

                      case 6:
                        return "[proÅ¡le] [subote] [u] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[proÅ¡li] dddd [u] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "pre %s",
                s: "par sekundi",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "dan",
                dd: translate,
                M: "mesec",
                MM: translate,
                y: "godinu",
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(word, num) {
            var forms = word.split("_");
            return 1 === num % 10 && 11 !== num % 100 ? forms[0] : num % 10 >= 2 && 4 >= num % 10 && (10 > num % 100 || num % 100 >= 20) ? forms[1] : forms[2];
        }
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                mm: "Ð¼Ð¸Ð½ÑƒÑ‚Ð°_Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹_Ð¼Ð¸Ð½ÑƒÑ‚",
                hh: "Ñ‡Ð°Ñ_Ñ‡Ð°ÑÐ°_Ñ‡Ð°ÑÐ¾Ð²",
                dd: "Ð´ÐµÐ½ÑŒ_Ð´Ð½Ñ_Ð´Ð½ÐµÐ¹",
                MM: "Ð¼ÐµÑÑÑ†_Ð¼ÐµÑÑÑ†Ð°_Ð¼ÐµÑÑÑ†ÐµÐ²",
                yy: "Ð³Ð¾Ð´_Ð³Ð¾Ð´Ð°_Ð»ÐµÑ‚"
            };
            return "m" === key ? withoutSuffix ? "Ð¼Ð¸Ð½ÑƒÑ‚Ð°" : "Ð¼Ð¸Ð½ÑƒÑ‚Ñƒ" : number + " " + plural(format[key], +number);
        }
        function monthsCaseReplace(m, format) {
            var months = {
                nominative: "ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ".split("_"),
                accusative: "ÑÐ½Ð²Ð°Ñ€Ñ_Ñ„ÐµÐ²Ñ€Ð°Ð»Ñ_Ð¼Ð°Ñ€Ñ‚Ð°_Ð°Ð¿Ñ€ÐµÐ»Ñ_Ð¼Ð°Ñ_Ð¸ÑŽÐ½Ñ_Ð¸ÑŽÐ»Ñ_Ð°Ð²Ð³ÑƒÑÑ‚Ð°_ÑÐµÐ½Ñ‚ÑÐ±Ñ€Ñ_Ð¾ÐºÑ‚ÑÐ±Ñ€Ñ_Ð½Ð¾ÑÐ±Ñ€Ñ_Ð´ÐµÐºÐ°Ð±Ñ€Ñ".split("_")
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative";
            return months[nounCase][m.month()];
        }
        function monthsShortCaseReplace(m, format) {
            var monthsShort = {
                nominative: "ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº".split("_"),
                accusative: "ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ñ_Ð¸ÑŽÐ½Ñ_Ð¸ÑŽÐ»Ñ_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº".split("_")
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? "accusative" : "nominative";
            return monthsShort[nounCase][m.month()];
        }
        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                nominative: "Ð²Ð¾ÑÐºÑ€ÐµÑÐµÐ½ÑŒÐµ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»ÑŒÐ½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³_Ð¿ÑÑ‚Ð½Ð¸Ñ†Ð°_ÑÑƒÐ±Ð±Ð¾Ñ‚Ð°".split("_"),
                accusative: "Ð²Ð¾ÑÐºÑ€ÐµÑÐµÐ½ÑŒÐµ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»ÑŒÐ½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ñƒ_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³_Ð¿ÑÑ‚Ð½Ð¸Ñ†Ñƒ_ÑÑƒÐ±Ð±Ð¾Ñ‚Ñƒ".split("_")
            }, nounCase = /\[ ?[Ð’Ð²] ?(?:Ð¿Ñ€Ð¾ÑˆÐ»ÑƒÑŽ|ÑÐ»ÐµÐ´ÑƒÑŽÑ‰ÑƒÑŽ)? ?\] ?dddd/.test(format) ? "accusative" : "nominative";
            return weekdays[nounCase][m.day()];
        }
        return moment.lang("ru", {
            months: monthsCaseReplace,
            monthsShort: monthsShortCaseReplace,
            weekdays: weekdaysCaseReplace,
            weekdaysShort: "Ð²Ñ_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
            weekdaysMin: "Ð²Ñ_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
            monthsParse: [ /^ÑÐ½Ð²/i, /^Ñ„ÐµÐ²/i, /^Ð¼Ð°Ñ€/i, /^Ð°Ð¿Ñ€/i, /^Ð¼Ð°[Ð¹|Ñ]/i, /^Ð¸ÑŽÐ½/i, /^Ð¸ÑŽÐ»/i, /^Ð°Ð²Ð³/i, /^ÑÐµÐ½/i, /^Ð¾ÐºÑ‚/i, /^Ð½Ð¾Ñ/i, /^Ð´ÐµÐº/i ],
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY Ð³.",
                LLL: "D MMMM YYYY Ð³., LT",
                LLLL: "dddd, D MMMM YYYY Ð³., LT"
            },
            calendar: {
                sameDay: "[Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ Ð²] LT",
                nextDay: "[Ð—Ð°Ð²Ñ‚Ñ€Ð° Ð²] LT",
                lastDay: "[Ð’Ñ‡ÐµÑ€Ð° Ð²] LT",
                nextWeek: function() {
                    return 2 === this.day() ? "[Ð’Ð¾] dddd [Ð²] LT" : "[Ð’] dddd [Ð²] LT";
                },
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ðµ] dddd [Ð²] LT";

                      case 1:
                      case 2:
                      case 4:
                        return "[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»Ñ‹Ð¹] dddd [Ð²] LT";

                      case 3:
                      case 5:
                      case 6:
                        return "[Ð’ Ð¿Ñ€Ð¾ÑˆÐ»ÑƒÑŽ] dddd [Ð²] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "Ñ‡ÐµÑ€ÐµÐ· %s",
                past: "%s Ð½Ð°Ð·Ð°Ð´",
                s: "Ð½ÐµÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÐµÐºÑƒÐ½Ð´",
                m: relativeTimeWithPlural,
                mm: relativeTimeWithPlural,
                h: "Ñ‡Ð°Ñ",
                hh: relativeTimeWithPlural,
                d: "Ð´ÐµÐ½ÑŒ",
                dd: relativeTimeWithPlural,
                M: "Ð¼ÐµÑÑÑ†",
                MM: relativeTimeWithPlural,
                y: "Ð³Ð¾Ð´",
                yy: relativeTimeWithPlural
            },
            meridiem: function(hour) {
                return 4 > hour ? "Ð½Ð¾Ñ‡Ð¸" : 12 > hour ? "ÑƒÑ‚Ñ€Ð°" : 17 > hour ? "Ð´Ð½Ñ" : "Ð²ÐµÑ‡ÐµÑ€Ð°";
            },
            ordinal: function(number, period) {
                switch (period) {
                  case "M":
                  case "d":
                  case "DDD":
                    return number + "-Ð¹";

                  case "D":
                    return number + "-Ð³Ð¾";

                  case "w":
                  case "W":
                    return number + "-Ñ";

                  default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(n) {
            return n > 1 && 5 > n;
        }
        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + " ";
            switch (key) {
              case "s":
                return withoutSuffix || isFuture ? "pÃ¡r sekÃºnd" : "pÃ¡r sekundami";

              case "m":
                return withoutSuffix ? "minÃºta" : isFuture ? "minÃºtu" : "minÃºtou";

              case "mm":
                return withoutSuffix || isFuture ? result + (plural(number) ? "minÃºty" : "minÃºt") : result + "minÃºtami";

              case "h":
                return withoutSuffix ? "hodina" : isFuture ? "hodinu" : "hodinou";

              case "hh":
                return withoutSuffix || isFuture ? result + (plural(number) ? "hodiny" : "hodÃ­n") : result + "hodinami";

              case "d":
                return withoutSuffix || isFuture ? "deÅˆ" : "dÅˆom";

              case "dd":
                return withoutSuffix || isFuture ? result + (plural(number) ? "dni" : "dnÃ­") : result + "dÅˆami";

              case "M":
                return withoutSuffix || isFuture ? "mesiac" : "mesiacom";

              case "MM":
                return withoutSuffix || isFuture ? result + (plural(number) ? "mesiace" : "mesiacov") : result + "mesiacmi";

              case "y":
                return withoutSuffix || isFuture ? "rok" : "rokom";

              case "yy":
                return withoutSuffix || isFuture ? result + (plural(number) ? "roky" : "rokov") : result + "rokmi";
            }
        }
        var months = "januÃ¡r_februÃ¡r_marec_aprÃ­l_mÃ¡j_jÃºn_jÃºl_august_september_oktÃ³ber_november_december".split("_"), monthsShort = "jan_feb_mar_apr_mÃ¡j_jÃºn_jÃºl_aug_sep_okt_nov_dec".split("_");
        return moment.lang("sk", {
            months: months,
            monthsShort: monthsShort,
            monthsParse: function(months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; 12 > i; i++) _monthsParse[i] = new RegExp("^" + months[i] + "$|^" + monthsShort[i] + "$", "i");
                return _monthsParse;
            }(months, monthsShort),
            weekdays: "nedeÄ¾a_pondelok_utorok_streda_Å¡tvrtok_piatok_sobota".split("_"),
            weekdaysShort: "ne_po_ut_st_Å¡t_pi_so".split("_"),
            weekdaysMin: "ne_po_ut_st_Å¡t_pi_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD.MM.YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[dnes o] LT",
                nextDay: "[zajtra o] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v nedeÄ¾u o] LT";

                      case 1:
                      case 2:
                        return "[v] dddd [o] LT";

                      case 3:
                        return "[v stredu o] LT";

                      case 4:
                        return "[vo Å¡tvrtok o] LT";

                      case 5:
                        return "[v piatok o] LT";

                      case 6:
                        return "[v sobotu o] LT";
                    }
                },
                lastDay: "[vÄera o] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[minulÃº nedeÄ¾u o] LT";

                      case 1:
                      case 2:
                        return "[minulÃ½] dddd [o] LT";

                      case 3:
                        return "[minulÃº stredu o] LT";

                      case 4:
                      case 5:
                        return "[minulÃ½] dddd [o] LT";

                      case 6:
                        return "[minulÃº sobotu o] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "za %s",
                past: "pred %s",
                s: translate,
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: translate,
                dd: translate,
                M: translate,
                MM: translate,
                y: translate,
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + " ";
            switch (key) {
              case "m":
                return withoutSuffix ? "ena minuta" : "eno minuto";

              case "mm":
                result += 1 === number ? "minuta" : 2 === number ? "minuti" : 3 === number || 4 === number ? "minute" : "minut";
                return result;

              case "h":
                return withoutSuffix ? "ena ura" : "eno uro";

              case "hh":
                result += 1 === number ? "ura" : 2 === number ? "uri" : 3 === number || 4 === number ? "ure" : "ur";
                return result;

              case "dd":
                result += 1 === number ? "dan" : "dni";
                return result;

              case "MM":
                result += 1 === number ? "mesec" : 2 === number ? "meseca" : 3 === number || 4 === number ? "mesece" : "mesecev";
                return result;

              case "yy":
                result += 1 === number ? "leto" : 2 === number ? "leti" : 3 === number || 4 === number ? "leta" : "let";
                return result;
            }
        }
        return moment.lang("sl", {
            months: "januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),
            monthsShort: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
            weekdays: "nedelja_ponedeljek_torek_sreda_Äetrtek_petek_sobota".split("_"),
            weekdaysShort: "ned._pon._tor._sre._Äet._pet._sob.".split("_"),
            weekdaysMin: "ne_po_to_sr_Äe_pe_so".split("_"),
            longDateFormat: {
                LT: "H:mm",
                L: "DD. MM. YYYY",
                LL: "D. MMMM YYYY",
                LLL: "D. MMMM YYYY LT",
                LLLL: "dddd, D. MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[danes ob] LT",
                nextDay: "[jutri ob] LT",
                nextWeek: function() {
                    switch (this.day()) {
                      case 0:
                        return "[v] [nedeljo] [ob] LT";

                      case 3:
                        return "[v] [sredo] [ob] LT";

                      case 6:
                        return "[v] [soboto] [ob] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[v] dddd [ob] LT";
                    }
                },
                lastDay: "[vÄeraj ob] LT",
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                      case 6:
                        return "[prejÅ¡nja] dddd [ob] LT";

                      case 1:
                      case 2:
                      case 4:
                      case 5:
                        return "[prejÅ¡nji] dddd [ob] LT";
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "Äez %s",
                past: "%s nazaj",
                s: "nekaj sekund",
                m: translate,
                mm: translate,
                h: translate,
                hh: translate,
                d: "en dan",
                dd: translate,
                M: "en mesec",
                MM: translate,
                y: "eno leto",
                yy: translate
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("sq", {
            months: "Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_NÃ«ntor_Dhjetor".split("_"),
            monthsShort: "Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_NÃ«n_Dhj".split("_"),
            weekdays: "E Diel_E HÃ«nÃ«_E Marte_E MÃ«rkure_E Enjte_E Premte_E ShtunÃ«".split("_"),
            weekdaysShort: "Die_HÃ«n_Mar_MÃ«r_Enj_Pre_Sht".split("_"),
            weekdaysMin: "D_H_Ma_MÃ«_E_P_Sh".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Sot nÃ«] LT",
                nextDay: "[Neser nÃ«] LT",
                nextWeek: "dddd [nÃ«] LT",
                lastDay: "[Dje nÃ«] LT",
                lastWeek: "dddd [e kaluar nÃ«] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "nÃ« %s",
                past: "%s me parÃ«",
                s: "disa sekonda",
                m: "njÃ« minut",
                mm: "%d minuta",
                h: "njÃ« orÃ«",
                hh: "%d orÃ«",
                d: "njÃ« ditÃ«",
                dd: "%d ditÃ«",
                M: "njÃ« muaj",
                MM: "%d muaj",
                y: "njÃ« vit",
                yy: "%d vite"
            },
            ordinal: "%d.",
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("sv", {
            months: "januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),
            monthsShort: "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
            weekdays: "sÃ¶ndag_mÃ¥ndag_tisdag_onsdag_torsdag_fredag_lÃ¶rdag".split("_"),
            weekdaysShort: "sÃ¶n_mÃ¥n_tis_ons_tor_fre_lÃ¶r".split("_"),
            weekdaysMin: "sÃ¶_mÃ¥_ti_on_to_fr_lÃ¶".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "YYYY-MM-DD",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Idag] LT",
                nextDay: "[Imorgon] LT",
                lastDay: "[IgÃ¥r] LT",
                nextWeek: "dddd LT",
                lastWeek: "[FÃ¶rra] dddd[en] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "om %s",
                past: "fÃ¶r %s sedan",
                s: "nÃ¥gra sekunder",
                m: "en minut",
                mm: "%d minuter",
                h: "en timme",
                hh: "%d timmar",
                d: "en dag",
                dd: "%d dagar",
                M: "en mÃ¥nad",
                MM: "%d mÃ¥nader",
                y: "ett Ã¥r",
                yy: "%d Ã¥r"
            },
            ordinal: function(number) {
                var b = number % 10, output = 1 === ~~(number % 100 / 10) ? "e" : 1 === b ? "a" : 2 === b ? "a" : 3 === b ? "e" : "e";
                return number + output;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("ta", {
            months: "à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯".split("_"),
            monthsShort: "à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯".split("_"),
            weekdays: "à®žà®¾à®¯à®¿à®±à¯à®±à¯à®•à¯à®•à®¿à®´à®®à¯ˆ_à®¤à®¿à®™à¯à®•à®Ÿà¯à®•à®¿à®´à®®à¯ˆ_à®šà¯†à®µà¯à®µà®¾à®¯à¯à®•à®¿à®´à®®à¯ˆ_à®ªà¯à®¤à®©à¯à®•à®¿à®´à®®à¯ˆ_à®µà®¿à®¯à®¾à®´à®•à¯à®•à®¿à®´à®®à¯ˆ_à®µà¯†à®³à¯à®³à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ_à®šà®©à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ".split("_"),
            weekdaysShort: "à®žà®¾à®¯à®¿à®±à¯_à®¤à®¿à®™à¯à®•à®³à¯_à®šà¯†à®µà¯à®µà®¾à®¯à¯_à®ªà¯à®¤à®©à¯_à®µà®¿à®¯à®¾à®´à®©à¯_à®µà¯†à®³à¯à®³à®¿_à®šà®©à®¿".split("_"),
            weekdaysMin: "à®žà®¾_à®¤à®¿_à®šà¯†_à®ªà¯_à®µà®¿_à®µà¯†_à®š".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY, LT",
                LLLL: "dddd, D MMMM YYYY, LT"
            },
            calendar: {
                sameDay: "[à®‡à®©à¯à®±à¯] LT",
                nextDay: "[à®¨à®¾à®³à¯ˆ] LT",
                nextWeek: "dddd, LT",
                lastDay: "[à®¨à¯‡à®±à¯à®±à¯] LT",
                lastWeek: "[à®•à®Ÿà®¨à¯à®¤ à®µà®¾à®°à®®à¯] dddd, LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s à®‡à®²à¯",
                past: "%s à®®à¯à®©à¯",
                s: "à®’à®°à¯ à®šà®¿à®² à®µà®¿à®¨à®¾à®Ÿà®¿à®•à®³à¯",
                m: "à®’à®°à¯ à®¨à®¿à®®à®¿à®Ÿà®®à¯",
                mm: "%d à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯",
                h: "à®’à®°à¯ à®®à®£à®¿ à®¨à¯‡à®°à®®à¯",
                hh: "%d à®®à®£à®¿ à®¨à¯‡à®°à®®à¯",
                d: "à®’à®°à¯ à®¨à®¾à®³à¯",
                dd: "%d à®¨à®¾à®Ÿà¯à®•à®³à¯",
                M: "à®’à®°à¯ à®®à®¾à®¤à®®à¯",
                MM: "%d à®®à®¾à®¤à®™à¯à®•à®³à¯",
                y: "à®’à®°à¯ à®µà®°à¯à®Ÿà®®à¯",
                yy: "%d à®†à®£à¯à®Ÿà¯à®•à®³à¯"
            },
            ordinal: function(number) {
                return number + "à®µà®¤à¯";
            },
            meridiem: function(hour) {
                if (hour >= 6 && 10 >= hour) return " à®•à®¾à®²à¯ˆ";
                if (hour >= 10 && 14 >= hour) return " à®¨à®£à¯à®ªà®•à®²à¯";
                if (hour >= 14 && 18 >= hour) return " à®Žà®±à¯à®ªà®¾à®Ÿà¯";
                if (hour >= 18 && 20 >= hour) return " à®®à®¾à®²à¯ˆ";
                if (hour >= 20 && 24 >= hour) return " à®‡à®°à®µà¯";
                if (hour >= 0 && 6 >= hour) return " à®µà¯ˆà®•à®±à¯ˆ";
            },
            week: {
                dow: 0,
                doy: 6
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("th", {
            months: "à¸¡à¸à¸£à¸²à¸„à¸¡_à¸à¸¸à¸¡à¸ à¸²à¸žà¸±à¸™à¸˜à¹Œ_à¸¡à¸µà¸™à¸²à¸„à¸¡_à¹€à¸¡à¸©à¸²à¸¢à¸™_à¸žà¸¤à¸©à¸ à¸²à¸„à¸¡_à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™_à¸à¸£à¸à¸Žà¸²à¸„à¸¡_à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡_à¸à¸±à¸™à¸¢à¸²à¸¢à¸™_à¸•à¸¸à¸¥à¸²à¸„à¸¡_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™_à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡".split("_"),
            monthsShort: "à¸¡à¸à¸£à¸²_à¸à¸¸à¸¡à¸ à¸²_à¸¡à¸µà¸™à¸²_à¹€à¸¡à¸©à¸²_à¸žà¸¤à¸©à¸ à¸²_à¸¡à¸´à¸–à¸¸à¸™à¸²_à¸à¸£à¸à¸Žà¸²_à¸ªà¸´à¸‡à¸«à¸²_à¸à¸±à¸™à¸¢à¸²_à¸•à¸¸à¸¥à¸²_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²_à¸˜à¸±à¸™à¸§à¸²".split("_"),
            weekdays: "à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ªà¸šà¸”à¸µ_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ".split("_"),
            weekdaysShort: "à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ª_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ".split("_"),
            weekdaysMin: "à¸­à¸²._à¸ˆ._à¸­._à¸ž._à¸žà¸¤._à¸¨._à¸ª.".split("_"),
            longDateFormat: {
                LT: "H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ",
                L: "YYYY/MM/DD",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY à¹€à¸§à¸¥à¸² LT",
                LLLL: "à¸§à¸±à¸™ddddà¸—à¸µà¹ˆ D MMMM YYYY à¹€à¸§à¸¥à¸² LT"
            },
            meridiem: function(hour) {
                return 12 > hour ? "à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡" : "à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡";
            },
            calendar: {
                sameDay: "[à¸§à¸±à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT",
                nextDay: "[à¸žà¸£à¸¸à¹ˆà¸‡à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT",
                nextWeek: "dddd[à¸«à¸™à¹‰à¸² à¹€à¸§à¸¥à¸²] LT",
                lastDay: "[à¹€à¸¡à¸·à¹ˆà¸­à¸§à¸²à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT",
                lastWeek: "[à¸§à¸±à¸™]dddd[à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§ à¹€à¸§à¸¥à¸²] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "à¸­à¸µà¸ %s",
                past: "%sà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§",
                s: "à¹„à¸¡à¹ˆà¸à¸µà¹ˆà¸§à¸´à¸™à¸²à¸—à¸µ",
                m: "1 à¸™à¸²à¸—à¸µ",
                mm: "%d à¸™à¸²à¸—à¸µ",
                h: "1 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡",
                hh: "%d à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡",
                d: "1 à¸§à¸±à¸™",
                dd: "%d à¸§à¸±à¸™",
                M: "1 à¹€à¸”à¸·à¸­à¸™",
                MM: "%d à¹€à¸”à¸·à¸­à¸™",
                y: "1 à¸›à¸µ",
                yy: "%d à¸›à¸µ"
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("tl-ph", {
            months: "Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre".split("_"),
            monthsShort: "Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis".split("_"),
            weekdays: "Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado".split("_"),
            weekdaysShort: "Lin_Lun_Mar_Miy_Huw_Biy_Sab".split("_"),
            weekdaysMin: "Li_Lu_Ma_Mi_Hu_Bi_Sab".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "MM/D/YYYY",
                LL: "MMMM D, YYYY",
                LLL: "MMMM D, YYYY LT",
                LLLL: "dddd, MMMM DD, YYYY LT"
            },
            calendar: {
                sameDay: "[Ngayon sa] LT",
                nextDay: "[Bukas sa] LT",
                nextWeek: "dddd [sa] LT",
                lastDay: "[Kahapon sa] LT",
                lastWeek: "dddd [huling linggo] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "sa loob ng %s",
                past: "%s ang nakalipas",
                s: "ilang segundo",
                m: "isang minuto",
                mm: "%d minuto",
                h: "isang oras",
                hh: "%d oras",
                d: "isang araw",
                dd: "%d araw",
                M: "isang buwan",
                MM: "%d buwan",
                y: "isang taon",
                yy: "%d taon"
            },
            ordinal: function(number) {
                return number;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        var suffixes = {
            1: "'inci",
            5: "'inci",
            8: "'inci",
            70: "'inci",
            80: "'inci",
            2: "'nci",
            7: "'nci",
            20: "'nci",
            50: "'nci",
            3: "'Ã¼ncÃ¼",
            4: "'Ã¼ncÃ¼",
            100: "'Ã¼ncÃ¼",
            6: "'ncÄ±",
            9: "'uncu",
            10: "'uncu",
            30: "'uncu",
            60: "'Ä±ncÄ±",
            90: "'Ä±ncÄ±"
        };
        return moment.lang("tr", {
            months: "Ocak_Åžubat_Mart_Nisan_MayÄ±s_Haziran_Temmuz_AÄŸustos_EylÃ¼l_Ekim_KasÄ±m_AralÄ±k".split("_"),
            monthsShort: "Oca_Åžub_Mar_Nis_May_Haz_Tem_AÄŸu_Eyl_Eki_Kas_Ara".split("_"),
            weekdays: "Pazar_Pazartesi_SalÄ±_Ã‡arÅŸamba_PerÅŸembe_Cuma_Cumartesi".split("_"),
            weekdaysShort: "Paz_Pts_Sal_Ã‡ar_Per_Cum_Cts".split("_"),
            weekdaysMin: "Pz_Pt_Sa_Ã‡a_Pe_Cu_Ct".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd, D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[bugÃ¼n saat] LT",
                nextDay: "[yarÄ±n saat] LT",
                nextWeek: "[haftaya] dddd [saat] LT",
                lastDay: "[dÃ¼n] LT",
                lastWeek: "[geÃ§en hafta] dddd [saat] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s sonra",
                past: "%s Ã¶nce",
                s: "birkaÃ§ saniye",
                m: "bir dakika",
                mm: "%d dakika",
                h: "bir saat",
                hh: "%d saat",
                d: "bir gÃ¼n",
                dd: "%d gÃ¼n",
                M: "bir ay",
                MM: "%d ay",
                y: "bir yÄ±l",
                yy: "%d yÄ±l"
            },
            ordinal: function(number) {
                if (0 === number) return number + "'Ä±ncÄ±";
                var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
                return number + (suffixes[a] || suffixes[b] || suffixes[c]);
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("tzm-la", {
            months: "innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir".split("_"),
            monthsShort: "innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir".split("_"),
            weekdays: "asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas".split("_"),
            weekdaysShort: "asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas".split("_"),
            weekdaysMin: "asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[asdkh g] LT",
                nextDay: "[aska g] LT",
                nextWeek: "dddd [g] LT",
                lastDay: "[assant g] LT",
                lastWeek: "dddd [g] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "dadkh s yan %s",
                past: "yan %s",
                s: "imik",
                m: "minuá¸",
                mm: "%d minuá¸",
                h: "saÉ›a",
                hh: "%d tassaÉ›in",
                d: "ass",
                dd: "%d ossan",
                M: "ayowr",
                MM: "%d iyyirn",
                y: "asgas",
                yy: "%d isgasn"
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("tzm", {
            months: "âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”".split("_"),
            monthsShort: "âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”".split("_"),
            weekdays: "â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™".split("_"),
            weekdaysShort: "â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™".split("_"),
            weekdaysMin: "â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[â´°âµ™â´·âµ… â´´] LT",
                nextDay: "[â´°âµ™â´½â´° â´´] LT",
                nextWeek: "dddd [â´´] LT",
                lastDay: "[â´°âµšâ´°âµâµœ â´´] LT",
                lastWeek: "dddd [â´´] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "â´·â´°â´·âµ… âµ™ âµ¢â´°âµ %s",
                past: "âµ¢â´°âµ %s",
                s: "âµ‰âµŽâµ‰â´½",
                m: "âµŽâµ‰âµâµ“â´º",
                mm: "%d âµŽâµ‰âµâµ“â´º",
                h: "âµ™â´°âµ„â´°",
                hh: "%d âµœâ´°âµ™âµ™â´°âµ„âµ‰âµ",
                d: "â´°âµ™âµ™",
                dd: "%d oâµ™âµ™â´°âµ",
                M: "â´°âµ¢oâµ“âµ”",
                MM: "%d âµ‰âµ¢âµ¢âµ‰âµ”âµ",
                y: "â´°âµ™â´³â´°âµ™",
                yy: "%d âµ‰âµ™â´³â´°âµ™âµ"
            },
            week: {
                dow: 6,
                doy: 12
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        function plural(word, num) {
            var forms = word.split("_");
            return 1 === num % 10 && 11 !== num % 100 ? forms[0] : num % 10 >= 2 && 4 >= num % 10 && (10 > num % 100 || num % 100 >= 20) ? forms[1] : forms[2];
        }
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                mm: "Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð°_Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð¸_Ñ…Ð²Ð¸Ð»Ð¸Ð½",
                hh: "Ð³Ð¾Ð´Ð¸Ð½Ð°_Ð³Ð¾Ð´Ð¸Ð½Ð¸_Ð³Ð¾Ð´Ð¸Ð½",
                dd: "Ð´ÐµÐ½ÑŒ_Ð´Ð½Ñ–_Ð´Ð½Ñ–Ð²",
                MM: "Ð¼Ñ–ÑÑÑ†ÑŒ_Ð¼Ñ–ÑÑÑ†Ñ–_Ð¼Ñ–ÑÑÑ†Ñ–Ð²",
                yy: "Ñ€Ñ–Ðº_Ñ€Ð¾ÐºÐ¸_Ñ€Ð¾ÐºÑ–Ð²"
            };
            return "m" === key ? withoutSuffix ? "Ñ…Ð²Ð¸Ð»Ð¸Ð½Ð°" : "Ñ…Ð²Ð¸Ð»Ð¸Ð½Ñƒ" : "h" === key ? withoutSuffix ? "Ð³Ð¾Ð´Ð¸Ð½Ð°" : "Ð³Ð¾Ð´Ð¸Ð½Ñƒ" : number + " " + plural(format[key], +number);
        }
        function monthsCaseReplace(m, format) {
            var months = {
                nominative: "ÑÑ–Ñ‡ÐµÐ½ÑŒ_Ð»ÑŽÑ‚Ð¸Ð¹_Ð±ÐµÑ€ÐµÐ·ÐµÐ½ÑŒ_ÐºÐ²Ñ–Ñ‚ÐµÐ½ÑŒ_Ñ‚Ñ€Ð°Ð²ÐµÐ½ÑŒ_Ñ‡ÐµÑ€Ð²ÐµÐ½ÑŒ_Ð»Ð¸Ð¿ÐµÐ½ÑŒ_ÑÐµÑ€Ð¿ÐµÐ½ÑŒ_Ð²ÐµÑ€ÐµÑÐµÐ½ÑŒ_Ð¶Ð¾Ð²Ñ‚ÐµÐ½ÑŒ_Ð»Ð¸ÑÑ‚Ð¾Ð¿Ð°Ð´_Ð³Ñ€ÑƒÐ´ÐµÐ½ÑŒ".split("_"),
                accusative: "ÑÑ–Ñ‡Ð½Ñ_Ð»ÑŽÑ‚Ð¾Ð³Ð¾_Ð±ÐµÑ€ÐµÐ·Ð½Ñ_ÐºÐ²Ñ–Ñ‚Ð½Ñ_Ñ‚Ñ€Ð°Ð²Ð½Ñ_Ñ‡ÐµÑ€Ð²Ð½Ñ_Ð»Ð¸Ð¿Ð½Ñ_ÑÐµÑ€Ð¿Ð½Ñ_Ð²ÐµÑ€ÐµÑÐ½Ñ_Ð¶Ð¾Ð²Ñ‚Ð½Ñ_Ð»Ð¸ÑÑ‚Ð¾Ð¿Ð°Ð´Ð°_Ð³Ñ€ÑƒÐ´Ð½Ñ".split("_")
            }, nounCase = /D[oD]? *MMMM?/.test(format) ? "accusative" : "nominative";
            return months[nounCase][m.month()];
        }
        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                nominative: "Ð½ÐµÐ´Ñ–Ð»Ñ_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»Ð¾Ðº_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€Ð¾Ðº_ÑÐµÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†Ñ_ÑÑƒÐ±Ð¾Ñ‚Ð°".split("_"),
                accusative: "Ð½ÐµÐ´Ñ–Ð»ÑŽ_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»Ð¾Ðº_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€Ð¾Ðº_ÑÐµÑ€ÐµÐ´Ñƒ_Ñ‡ÐµÑ‚Ð²ÐµÑ€_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†ÑŽ_ÑÑƒÐ±Ð¾Ñ‚Ñƒ".split("_"),
                genitive: "Ð½ÐµÐ´Ñ–Ð»Ñ–_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»ÐºÐ°_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€ÐºÐ°_ÑÐµÑ€ÐµÐ´Ð¸_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³Ð°_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†Ñ–_ÑÑƒÐ±Ð¾Ñ‚Ð¸".split("_")
            }, nounCase = /(\[[Ð’Ð²Ð£Ñƒ]\]) ?dddd/.test(format) ? "accusative" : /\[?(?:Ð¼Ð¸Ð½ÑƒÐ»Ð¾Ñ—|Ð½Ð°ÑÑ‚ÑƒÐ¿Ð½Ð¾Ñ—)? ?\] ?dddd/.test(format) ? "genitive" : "nominative";
            return weekdays[nounCase][m.day()];
        }
        function processHoursFunction(str) {
            return function() {
                return str + "Ð¾" + (11 === this.hours() ? "Ð±" : "") + "] LT";
            };
        }
        return moment.lang("uk", {
            months: monthsCaseReplace,
            monthsShort: "ÑÑ–Ñ‡_Ð»ÑŽÑ‚_Ð±ÐµÑ€_ÐºÐ²Ñ–Ñ‚_Ñ‚Ñ€Ð°Ð²_Ñ‡ÐµÑ€Ð²_Ð»Ð¸Ð¿_ÑÐµÑ€Ð¿_Ð²ÐµÑ€_Ð¶Ð¾Ð²Ñ‚_Ð»Ð¸ÑÑ‚_Ð³Ñ€ÑƒÐ´".split("_"),
            weekdays: weekdaysCaseReplace,
            weekdaysShort: "Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
            weekdaysMin: "Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD.MM.YYYY",
                LL: "D MMMM YYYY Ñ€.",
                LLL: "D MMMM YYYY Ñ€., LT",
                LLLL: "dddd, D MMMM YYYY Ñ€., LT"
            },
            calendar: {
                sameDay: processHoursFunction("[Ð¡ÑŒÐ¾Ð³Ð¾Ð´Ð½Ñ– "),
                nextDay: processHoursFunction("[Ð—Ð°Ð²Ñ‚Ñ€Ð° "),
                lastDay: processHoursFunction("[Ð’Ñ‡Ð¾Ñ€Ð° "),
                nextWeek: processHoursFunction("[Ð£] dddd ["),
                lastWeek: function() {
                    switch (this.day()) {
                      case 0:
                      case 3:
                      case 5:
                      case 6:
                        return processHoursFunction("[ÐœÐ¸Ð½ÑƒÐ»Ð¾Ñ—] dddd [").call(this);

                      case 1:
                      case 2:
                      case 4:
                        return processHoursFunction("[ÐœÐ¸Ð½ÑƒÐ»Ð¾Ð³Ð¾] dddd [").call(this);
                    }
                },
                sameElse: "L"
            },
            relativeTime: {
                future: "Ð·Ð° %s",
                past: "%s Ñ‚Ð¾Ð¼Ñƒ",
                s: "Ð´ÐµÐºÑ–Ð»ÑŒÐºÐ° ÑÐµÐºÑƒÐ½Ð´",
                m: relativeTimeWithPlural,
                mm: relativeTimeWithPlural,
                h: "Ð³Ð¾Ð´Ð¸Ð½Ñƒ",
                hh: relativeTimeWithPlural,
                d: "Ð´ÐµÐ½ÑŒ",
                dd: relativeTimeWithPlural,
                M: "Ð¼Ñ–ÑÑÑ†ÑŒ",
                MM: relativeTimeWithPlural,
                y: "Ñ€Ñ–Ðº",
                yy: relativeTimeWithPlural
            },
            meridiem: function(hour) {
                return 4 > hour ? "Ð½Ð¾Ñ‡Ñ–" : 12 > hour ? "Ñ€Ð°Ð½ÐºÑƒ" : 17 > hour ? "Ð´Ð½Ñ" : "Ð²ÐµÑ‡Ð¾Ñ€Ð°";
            },
            ordinal: function(number, period) {
                switch (period) {
                  case "M":
                  case "d":
                  case "DDD":
                  case "w":
                  case "W":
                    return number + "-Ð¹";

                  case "D":
                    return number + "-Ð³Ð¾";

                  default:
                    return number;
                }
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("uz", {
            months: "ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ".split("_"),
            monthsShort: "ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½_Ð¸ÑŽÐ»_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº".split("_"),
            weekdays: "Ð¯ÐºÑˆÐ°Ð½Ð±Ð°_Ð”ÑƒÑˆÐ°Ð½Ð±Ð°_Ð¡ÐµÑˆÐ°Ð½Ð±Ð°_Ð§Ð¾Ñ€ÑˆÐ°Ð½Ð±Ð°_ÐŸÐ°Ð¹ÑˆÐ°Ð½Ð±Ð°_Ð–ÑƒÐ¼Ð°_Ð¨Ð°Ð½Ð±Ð°".split("_"),
            weekdaysShort: "Ð¯ÐºÑˆ_Ð”ÑƒÑˆ_Ð¡ÐµÑˆ_Ð§Ð¾Ñ€_ÐŸÐ°Ð¹_Ð–ÑƒÐ¼_Ð¨Ð°Ð½".split("_"),
            weekdaysMin: "Ð¯Ðº_Ð”Ñƒ_Ð¡Ðµ_Ð§Ð¾_ÐŸÐ°_Ð–Ñƒ_Ð¨Ð°".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "D MMMM YYYY, dddd LT"
            },
            calendar: {
                sameDay: "[Ð‘ÑƒÐ³ÑƒÐ½ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]",
                nextDay: "[Ð­Ñ€Ñ‚Ð°Ð³Ð°] LT [Ð´Ð°]",
                nextWeek: "dddd [ÐºÑƒÐ½Ð¸ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]",
                lastDay: "[ÐšÐµÑ‡Ð° ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]",
                lastWeek: "[Ð£Ñ‚Ð³Ð°Ð½] dddd [ÐºÑƒÐ½Ð¸ ÑÐ¾Ð°Ñ‚] LT [Ð´Ð°]",
                sameElse: "L"
            },
            relativeTime: {
                future: "Ð¯ÐºÐ¸Ð½ %s Ð¸Ñ‡Ð¸Ð´Ð°",
                past: "Ð‘Ð¸Ñ€ Ð½ÐµÑ‡Ð° %s Ð¾Ð»Ð´Ð¸Ð½",
                s: "Ñ„ÑƒÑ€ÑÐ°Ñ‚",
                m: "Ð±Ð¸Ñ€ Ð´Ð°ÐºÐ¸ÐºÐ°",
                mm: "%d Ð´Ð°ÐºÐ¸ÐºÐ°",
                h: "Ð±Ð¸Ñ€ ÑÐ¾Ð°Ñ‚",
                hh: "%d ÑÐ¾Ð°Ñ‚",
                d: "Ð±Ð¸Ñ€ ÐºÑƒÐ½",
                dd: "%d ÐºÑƒÐ½",
                M: "Ð±Ð¸Ñ€ Ð¾Ð¹",
                MM: "%d Ð¾Ð¹",
                y: "Ð±Ð¸Ñ€ Ð¹Ð¸Ð»",
                yy: "%d Ð¹Ð¸Ð»"
            },
            week: {
                dow: 1,
                doy: 7
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("vn", {
            months: "thÃ¡ng 1_thÃ¡ng 2_thÃ¡ng 3_thÃ¡ng 4_thÃ¡ng 5_thÃ¡ng 6_thÃ¡ng 7_thÃ¡ng 8_thÃ¡ng 9_thÃ¡ng 10_thÃ¡ng 11_thÃ¡ng 12".split("_"),
            monthsShort: "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
            weekdays: "chá»§ nháº­t_thá»© hai_thá»© ba_thá»© tÆ°_thá»© nÄƒm_thá»© sÃ¡u_thá»© báº£y".split("_"),
            weekdaysShort: "CN_T2_T3_T4_T5_T6_T7".split("_"),
            weekdaysMin: "CN_T2_T3_T4_T5_T6_T7".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                L: "DD/MM/YYYY",
                LL: "D MMMM [nÄƒm] YYYY",
                LLL: "D MMMM [nÄƒm] YYYY LT",
                LLLL: "dddd, D MMMM [nÄƒm] YYYY LT",
                l: "DD/M/YYYY",
                ll: "D MMM YYYY",
                lll: "D MMM YYYY LT",
                llll: "ddd, D MMM YYYY LT"
            },
            calendar: {
                sameDay: "[HÃ´m nay lÃºc] LT",
                nextDay: "[NgÃ y mai lÃºc] LT",
                nextWeek: "dddd [tuáº§n tá»›i lÃºc] LT",
                lastDay: "[HÃ´m qua lÃºc] LT",
                lastWeek: "dddd [tuáº§n rá»“i lÃºc] LT",
                sameElse: "L"
            },
            relativeTime: {
                future: "%s tá»›i",
                past: "%s trÆ°á»›c",
                s: "vÃ i giÃ¢y",
                m: "má»™t phÃºt",
                mm: "%d phÃºt",
                h: "má»™t giá»",
                hh: "%d giá»",
                d: "má»™t ngÃ y",
                dd: "%d ngÃ y",
                M: "má»™t thÃ¡ng",
                MM: "%d thÃ¡ng",
                y: "má»™t nÄƒm",
                yy: "%d nÄƒm"
            },
            ordinal: function(number) {
                return number;
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("zh-cn", {
            months: "ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ".split("_"),
            monthsShort: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
            weekdays: "æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­".split("_"),
            weekdaysShort: "å‘¨æ—¥_å‘¨ä¸€_å‘¨äºŒ_å‘¨ä¸‰_å‘¨å››_å‘¨äº”_å‘¨å…­".split("_"),
            weekdaysMin: "æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­".split("_"),
            longDateFormat: {
                LT: "Ahç‚¹mm",
                L: "YYYY-MM-DD",
                LL: "YYYYå¹´MMMDæ—¥",
                LLL: "YYYYå¹´MMMDæ—¥LT",
                LLLL: "YYYYå¹´MMMDæ—¥ddddLT",
                l: "YYYY-MM-DD",
                ll: "YYYYå¹´MMMDæ—¥",
                lll: "YYYYå¹´MMMDæ—¥LT",
                llll: "YYYYå¹´MMMDæ—¥ddddLT"
            },
            meridiem: function(hour, minute) {
                var hm = 100 * hour + minute;
                return 600 > hm ? "å‡Œæ™¨" : 900 > hm ? "æ—©ä¸Š" : 1130 > hm ? "ä¸Šåˆ" : 1230 > hm ? "ä¸­åˆ" : 1800 > hm ? "ä¸‹åˆ" : "æ™šä¸Š";
            },
            calendar: {
                sameDay: function() {
                    return 0 === this.minutes() ? "[ä»Šå¤©]Ah[ç‚¹æ•´]" : "[ä»Šå¤©]LT";
                },
                nextDay: function() {
                    return 0 === this.minutes() ? "[æ˜Žå¤©]Ah[ç‚¹æ•´]" : "[æ˜Žå¤©]LT";
                },
                lastDay: function() {
                    return 0 === this.minutes() ? "[æ˜¨å¤©]Ah[ç‚¹æ•´]" : "[æ˜¨å¤©]LT";
                },
                nextWeek: function() {
                    var startOfWeek, prefix;
                    startOfWeek = moment().startOf("week");
                    prefix = this.unix() - startOfWeek.unix() >= 604800 ? "[ä¸‹]" : "[æœ¬]";
                    return 0 === this.minutes() ? prefix + "dddAhç‚¹æ•´" : prefix + "dddAhç‚¹mm";
                },
                lastWeek: function() {
                    var startOfWeek, prefix;
                    startOfWeek = moment().startOf("week");
                    prefix = this.unix() < startOfWeek.unix() ? "[ä¸Š]" : "[æœ¬]";
                    return 0 === this.minutes() ? prefix + "dddAhç‚¹æ•´" : prefix + "dddAhç‚¹mm";
                },
                sameElse: "LL"
            },
            ordinal: function(number, period) {
                switch (period) {
                  case "d":
                  case "D":
                  case "DDD":
                    return number + "æ—¥";

                  case "M":
                    return number + "æœˆ";

                  case "w":
                  case "W":
                    return number + "å‘¨";

                  default:
                    return number;
                }
            },
            relativeTime: {
                future: "%så†…",
                past: "%så‰",
                s: "å‡ ç§’",
                m: "1åˆ†é’Ÿ",
                mm: "%dåˆ†é’Ÿ",
                h: "1å°æ—¶",
                hh: "%då°æ—¶",
                d: "1å¤©",
                dd: "%då¤©",
                M: "1ä¸ªæœˆ",
                MM: "%dä¸ªæœˆ",
                y: "1å¹´",
                yy: "%då¹´"
            },
            week: {
                dow: 1,
                doy: 4
            }
        });
    });
    (function(factory) {
        factory(moment);
    })(function(moment) {
        return moment.lang("zh-tw", {
            months: "ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ".split("_"),
            monthsShort: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
            weekdays: "æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­".split("_"),
            weekdaysShort: "é€±æ—¥_é€±ä¸€_é€±äºŒ_é€±ä¸‰_é€±å››_é€±äº”_é€±å…­".split("_"),
            weekdaysMin: "æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­".split("_"),
            longDateFormat: {
                LT: "Ahé»žmm",
                L: "YYYYå¹´MMMDæ—¥",
                LL: "YYYYå¹´MMMDæ—¥",
                LLL: "YYYYå¹´MMMDæ—¥LT",
                LLLL: "YYYYå¹´MMMDæ—¥ddddLT",
                l: "YYYYå¹´MMMDæ—¥",
                ll: "YYYYå¹´MMMDæ—¥",
                lll: "YYYYå¹´MMMDæ—¥LT",
                llll: "YYYYå¹´MMMDæ—¥ddddLT"
            },
            meridiem: function(hour, minute) {
                var hm = 100 * hour + minute;
                return 900 > hm ? "æ—©ä¸Š" : 1130 > hm ? "ä¸Šåˆ" : 1230 > hm ? "ä¸­åˆ" : 1800 > hm ? "ä¸‹åˆ" : "æ™šä¸Š";
            },
            calendar: {
                sameDay: "[ä»Šå¤©]LT",
                nextDay: "[æ˜Žå¤©]LT",
                nextWeek: "[ä¸‹]ddddLT",
                lastDay: "[æ˜¨å¤©]LT",
                lastWeek: "[ä¸Š]ddddLT",
                sameElse: "L"
            },
            ordinal: function(number, period) {
                switch (period) {
                  case "d":
                  case "D":
                  case "DDD":
                    return number + "æ—¥";

                  case "M":
                    return number + "æœˆ";

                  case "w":
                  case "W":
                    return number + "é€±";

                  default:
                    return number;
                }
            },
            relativeTime: {
                future: "%så…§",
                past: "%så‰",
                s: "å¹¾ç§’",
                m: "ä¸€åˆ†é˜",
                mm: "%dåˆ†é˜",
                h: "ä¸€å°æ™‚",
                hh: "%då°æ™‚",
                d: "ä¸€å¤©",
                dd: "%då¤©",
                M: "ä¸€å€‹æœˆ",
                MM: "%då€‹æœˆ",
                y: "ä¸€å¹´",
                yy: "%då¹´"
            }
        });
    });
    moment.lang("en");
    if (hasModule) {
        module.exports = moment;
        makeGlobal(true);
    } else "function" == typeof define && define.amd ? define("moment", function(require, exports, module) {
        module.config && module.config() && true !== module.config().noGlobal && makeGlobal(module.config().noGlobal === undefined);
        return moment;
    }) : makeGlobal();
}).call(this);