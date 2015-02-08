/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* global AudioContext, SoundMeter */

'use strict';

var instantMeter = document.querySelector('#instant meter');

var instantValueDisplay = document.querySelector('#instant .value');
var inThreshold = document.getElementById('threshold').getAttribute('value');
var topOne = document.querySelector('#topOne');
var topOneTime = document.querySelector('#topOneTime');
var topTwo = document.querySelector('#topTwo');
var topTwoTime = document.querySelector('#topTwoTime');
var topThree = document.querySelector('#topThree');
var topThreeTime = document.querySelector('#topThreeTime');

try {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
} catch (e) {
  alert('Web Audio API not supported.');
}

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: true,
  video: false
};

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function successCallback(stream) {
  // Put variables in global scope to make them available to the browser console.
  window.stream = stream;
  var soundMeter = window.soundMeter = new SoundMeter(window.audioContext, parseFloat(inThreshold));
  soundMeter.connectToSource(stream);

  setInterval(function() {
    instantMeter.value = instantValueDisplay.innerText =
      soundMeter.instant.toFixed(5);
    topOne.innerText = soundMeter.topOne;
    topOneTime.innerText = soundMeter.topOneTime;
    topTwo.innerText = soundMeter.topTwo;
    topTwoTime.innerText = soundMeter.topTwoTime;
    topThree.innerText = soundMeter.topThree;
    topThreeTime.innerText = soundMeter.topThreeTime;
  }, 200);
}

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
