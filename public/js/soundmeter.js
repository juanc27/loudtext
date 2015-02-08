/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var host = window.document.location.host.replace(/:.*/, '');

function sendMessage() {
    var ws = new WebSocket('ws://' + host + ':8080');
    ws.on('open', function open() {
        ws.send('send TEXT');
    });
    ws.close();
}

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context, threshold) {
  this.context = context;
  this.instant = 0.0;
  this.timeAtUpdate = 0.0;
  this.threshold = 0.0;
  this.threshold = threshold;
  this.topOne = 0.0;
  this.topOneTime = 0.0;
  this.topTwo = 0.0;
  this.topTwoTime = 0.0;
  this.topThree = 0.0;
  this.topThreeTime = 0.0;
  this.aboveCnt = 0;
  this.sumAbove = 0.0;
  this.startTime = 0.0;
  this.endTime = 0.0;
  this.weighted_average = 0.0;
  this.script = context.createScriptProcessor(2048, 1, 1);
  var that = this;
  this.script.onaudioprocess = function(event) {
    var input = event.inputBuffer.getChannelData(0);
    var i;
    var sum = 0.0;
    var aboveCnt = 0;
    var sumAbove = 0.0;
    var weighted_average = that.weighted_average; //using 95% old, %5 new
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
      weighted_average = (0.95 * weighted_average) + (0.05 * Math.abs(input[i]));
      if (weighted_average > that.threshold) {
        if (that.aboveCnt == 0) {
          that.startTime = context.currentTime;
          that.aboveCnt = 1;
        }
        aboveCnt = aboveCnt + 1;
        sumAbove += input[i] * input[i];
      } else {
        that.endTime = context.currentTime
        if (that.endTime > that.startTime) {
          var delta = 0;
          delta = that.endTime - that.startTime;
          that.startTime = that.endTime;
          if (delta > 1.0) {
            if (that.aboveCnt == 1) {
              that.aboveCnt = that.aboveCnt - 1;
            }
            that.aboveCnt = that.aboveCnt + aboveCnt;
            that.sumAbove = that.sumAbove + Math.sqrt(sumAbove / aboveCnt);

            if (that.sumAbove > that.topOne) {
              that.topThree = that.topTwo;
              that.topThreeTime = that.topTwoTime;
              that.topTwo = that.topOne;
              that.topTwoTime = that.topOneTime;
              that.topOne = that.sumAbove;
              that.topOneTime = delta;
              //SEND MESSAGE
              sendMessage();
            } else if (that.sumAbove > that.topTwo) {
              that.topThree = that.topTwo;
              that.topThreeTime = that.topTwoTime;
              that.topTwo = that.sumAbove;
              that.topTwoTime = delta;
              //SEND MESSAGE
              sendMessage();
            } else if (that.sumAbove > that.topThree) {
              that.topThree = that.sumAbove;
              that.topThreeTime = delta;
              //SEND MESSAGE
              sendMessage();
            }
          }
        }
        aboveCnt = 0;
        sumAbove = 0.0;
        that.aboveCnt = 0.0;
        that.sumAbove = 0.0;
      }
    }
    that.instant = Math.sqrt(sum / input.length);

    //means we are rolling over the next period
    if (that.aboveCnt > 0) {
        if (that.aboveCnt == 1)
          that.aboveCnt = that.aboveCnt - 1;
        that.aboveCnt = that.aboveCnt + aboveCnt;
        that.sumAbove = that.sumAbove + Math.sqrt(sumAbove / aboveCnt);
    }
    that.weighted_average = weighted_average;
  };
}

SoundMeter.prototype.connectToSource = function(stream) {
  console.log('SoundMeter connecting');
  this.mic = this.context.createMediaStreamSource(stream);
  this.mic.connect(this.script);
  // necessary to make sample run, but should not be.
  this.script.connect(this.context.destination);
};

SoundMeter.prototype.stop = function() {
  this.mic.disconnect();
  this.script.disconnect();
};
