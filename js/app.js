/*
 * Copyright (c) 2019 Homin Lee <homin.lee@suapapa.net> All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
    var timerUpdateDate = 0,
        flagDigital = false,
        interval,
        BACKGROUND_URL = "url('./images/bg.jpg')",
        arrHanHour = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두"],
        arrHanMonth = ["일", "이", "삼", "사", "오", "유", "칠", "팔", "구", "시", "십일", "십이"],
        arrHanNum = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"],
        arrHanDay = ["일", "월", "화", "수", "목", "금", "토"];

    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
        var datetime = tizen.time.getCurrentDateTime(),
            nextInterval,
            strDate = document.getElementById("date-str"),
            day = datetime.getDay(),
            date = datetime.getDate(),
            month = datetime.getMonth();

        // Check the update condition.
        // if prevDate is '0', it will always update the date.
        if (prevDay !== null) {
            if (prevDay === day) {
                // If the date was not changed (meaning that something went wrong),
                // call updateDate again after a second.
                nextInterval = 1000;
            } else {
                // If the day was changed,
                // call updateDate at the beginning of the next day.
                // Calculate how much time is left until the next day.
                nextInterval =
                    (23 - datetime.getHours()) * 60 * 60 * 1000 +
                    (59 - datetime.getMinutes()) * 60 * 1000 +
                    (59 - datetime.getSeconds()) * 1000 +
                    (1000 - datetime.getMilliseconds()) +
                    1;
            }
        }

        console.log(month, date, day);

        var date10 = ~~(date / 10);
        var date1 = date % 10;
        if (date10 == 1) {
            strDate.innerHTML = arrHanMonth[month] + "월 " + "십" + arrHanNum[date1] + "일 " + arrHanDay[day] + "요일";
        } else if (date10 != 0) {
            strDate.innerHTML = arrHanMonth[month] + "월 " + arrHanNum[date10] + "십" + arrHanNum[date1] + "일 " + arrHanDay[day] + "요일";
        } else {
            strDate.innerHTML = arrHanMonth[month] + "월 " + arrHanNum[date1] + "일 " + arrHanDay[day] + "요일";
        }

        // If an updateDate timer already exists, clear the previous timer.
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update.
        timerUpdateDate = setTimeout(function () {
            updateDate(day);
        }, nextInterval);
    }

    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
        var strHours = document.getElementById("h-str"),
            strMinutes = document.getElementById("m-str"),
            strAmpm = document.getElementById("ampm-str");

        var datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes();

        // TODO: 자정/정오 처리
        if (hour < 12) {
            strAmpm.innerHTML = "오전";
        } else {
            strAmpm.innerHTML = "오후";
            hour -= 12;
        }
        strHours.innerHTML = arrHanHour[hour];

        // TODO: 정각 처리
        var min10 = ~~(minute / 10);
        var min1 = minute % 10;
        if (min10 == 1) {
            strMinutes.innerHTML = "십" + arrHanNum[min1];
        } else if (min10 != 0) {
            strMinutes.innerHTML = arrHanNum[min10] + "십" + arrHanNum[min1];
        } else {
            strMinutes.innerHTML = arrHanNum[min1];
        }

        // TODO: 초침 처리

        /*
        // Each 0.5 second the visibility of flagConsole is changed.
        if (flagDigital) {
            if (flagConsole) {
                strConsole.style.visibility = "visible";
                flagConsole = false;
            } else {
                strConsole.style.visibility = "hidden";
                flagConsole = true;
            }
        }
        else {
            strConsole.style.visibility = "visible";
            flagConsole = false;
        }
        */
    }

    /**
     * Sets to background image as BACKGROUND_URL,
     * and starts timer for normal digital watch mode.
     * @private
     */
    function initWatch() {
        flagDigital = true;
        document.getElementById("watchface").style.backgroundImage = BACKGROUND_URL;
        interval = setInterval(updateTime, 1000);
    }

    /**
     * Clears timer and sets background image as none for ambient digital watch mode.
     * @private
     */
    function ambientWatch() {
        flagDigital = false;
        clearInterval(interval);
        document.getElementById("digital-body").style.backgroundImage = "none";
        updateTime();
    }

    /**
     * Updates watch screen. (time and date)
     * @private
     */
    function updateWatch() {
        updateTime();
        updateDate(0);
    }

    /**
     * Binds events.
     * @private
     */
    function bindEvents() {
        // add eventListener for timetick (1min on ambientmode)
        window.addEventListener("timetick", function () {
            ambientWatch();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function (e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientWatch();

            } else {
                // rendering normal digital mode case
                initWatch();
            }
        });

        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        tizen.time.setTimezoneChangeListener(function () {
            updateWatch();
        });
    }

    /**
     * Initializes date and time.
     * Sets to digital mode.
     * @private
     */
    function init() {
        initWatch();
        updateDate(0);

        bindEvents();
    }

    window.onload = init();
}());
