/*
 * Copyright (c) 2016 Samsung Electronics Co., Ltd. All rights reserved.
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

(function() {
    var canvasContent,
        ctxContent,
        center,
        watchRadius,
        animRequest,
        animTimeout,
        isAmbientMode;

    /**
     * Renders a circle with specific center, radius, and color
     * @private
     * @param {object} context - the context for the circle to be placed in
     * @param {number} radius - the radius of the circle
     * @param {string} color - the color of the circle
     */
    function renderCircle(context, center, radius, color, startAngle, endAngle) {
        context.save();
        context.beginPath();
        context.globalAlpha=0.4;
        context.fillStyle = color;
        context.arc(center.x, center.y, radius, startAngle, endAngle);
        context.lineTo(center.x, center.y)
        context.fill();
        context.closePath();
        context.restore();
    }

    /**
     * Renders text at a specific center, radius, and color
     * @private
     * @param {object} context - the context for the text to be placed in
     * @param {string} text - the text to be placed
     * @param {number} x - the x-coordinate of the text
     * @param {number} y - the y-coordinate of the text
     * @param {number} textSize - the size of the text in pixel
     * @param {string} color - the color of the text
     */
    function renderText(context, text, x, y, textSize, color) {
        context.save();
        context.beginPath();
        //draw shadow
        context.globalAlpha=0;
        context.shadowColor = '#000000';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.fillText(text, x, y);
        context.globalCompositeOperation = 'difference';
        context.globalAlpha=1;
        context.font = textSize + "px helvetica";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(text, x, y);
        
        context.closePath();
        context.restore();
    }


    /**
     * Draws the content of the watch
     * @private
     */
    function drawNormalWatch() {
        var datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes(),
            second = datetime.getSeconds(),
            nextMove = 1000 - datetime.getMilliseconds();

        // Clear canvas
        ctxContent.clearRect(0, 0, ctxContent.canvas.width, ctxContent.canvas.height);
        
        // Draw the minute/hour circle
        renderCircle(ctxContent, center, watchRadius, "#CCCCCC", 3/2 * Math.PI, 2 * Math.PI / 60 * (minute + second / 60) - 0.5 * Math.PI);
        //renderCircle(ctxContent, center, watchRadius, "#CCCCCC",2 * Math.PI / 60 * (minute + (second - 1) / 60) - 0.5 * Math.PI, 3/2 * Math.PI);

        // Draw the text for date
        renderText(ctxContent, hour, center.x, center.y + 25 , 300, "#cccccc");
        //document.getElementById("hour").innerHTML = hour;
        animTimeout = setTimeout(function() {
            animRequest = window.requestAnimationFrame(drawNormalWatch);
        }, nextMove);
    }

    /**
     * Set default variables
     * @private
     */
    function setDefaultVariables() {
        canvasContent = document.querySelector("#canvas-content");
        ctxContent = canvasContent.getContext("2d");

        // Set the canvases square
        canvasContent.width = document.body.clientWidth;
        canvasContent.height = canvasContent.width;

        center = {
            x: canvasContent.width / 2,
            y: canvasContent.height / 2
        };

        watchRadius = canvasContent.width / 2;
    }

    /**
     * Set default event listeners
     * @private
     */
    function setDefaultEvents() {
        // add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                // Draw the content of the watch
                drawNormalWatch();
                if (isAmbientMode === true) {
                    // Rendering ambient mode case
                    activateMode("Ambient");
                } else {
                    // Rendering normal case
                    activateMode("Normal");
                }
            }
        });
        
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                 // Rendering ambient mode case
                 activateMode("Ambient");
            } else {
                // Rendering normal case
                activateMode("Normal");
            }
        });
        
        window.addEventListener('timetick', function() {
        	drawNormalWatch(); 
        }); 
    }

    /**
     * Initiates the application
     * @private
     */
    function init() {
        setDefaultVariables();
        setDefaultEvents();
        
        drawNormalWatch();

        // Update the content of the watch every second
        animRequest = window.requestAnimationFrame(drawNormalWatch);
    }
    
    /**
     * Activates a mode of the watch.
     * @param {string} mode - The mode of the watch to be activated.
     * @private
     */
    function activateMode(mode) {
        'use strict';

        // Stop the animation before mode changing
        if (animTimeout) {
            window.clearTimeout(animTimeout);
        }
        if (animRequest) {
            window.cancelAnimationFrame(animRequest);
        }

        switch (mode) {
            case "Ambient":
                // Normal -> Ambient
                isAmbientMode = true;
                drawNormalWatch();

                break;
            case "Normal":
                // Ambient -> Normal
                isAmbientMode = false;
                animRequest = window.requestAnimationFrame(drawNormalWatch);

                break;
            default:
                break;
        }
    }

    window.onload = init;
}());