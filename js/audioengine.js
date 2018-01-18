//TODO: Patterns are working well but still not synchronized to each other.
//      Stoping and starting the beet object doesn not work.
//      The Demo of beet seems to be using Scenes to do this.

var AudioContext = window.AudioContext || window.webkitAudioContext;

var AudioEngine = function ()
{
  this.context = new AudioContext();
  this.sawtooth = this.generateSawTooth();
  this.sinewave = this.generateSineWave();
  this.layers = [];
  this.sounds = [
      new AudioFile("snare01.wav"),
      new AudioFile("kick01.wav"),
      new AudioFile("Cowbell01.wav"),
      new AudioFile("ping01.wav"),
      new AudioFile("sax01.wav"),
  ];

  //Beet framework
  // initialize beet
  this.beet = new Beet({
    context: this.context,
    tempo: 100
  });

  this.beet.start();
}

AudioEngine.prototype.startSound = function (id, soundIndex, bpm, patt)
{
  var self = this;
  var pattern;
  if(patt) {
    pattern = this.beet.pattern(patt);
  }
  else {
    pattern = this.beet.pattern(4);
  }
  this.layers[id] = this.beet.layer(pattern, function (audiotime, step, timeFromScheduled){
          self.sounds[soundIndex].play(audiotime);
    });

  this.layers[id].tempo = bpm;
  this.beet.add(this.layers[id]);
  this.layers[id].start();
};

AudioEngine.prototype.startClick = function (id, frequency, bpm, patt)
{
  var self = this;
  var pattern;
  if(patt) {
    pattern = this.beet.pattern(patt);
  }
  else {
    pattern = this.beet.pattern(4);
  }
  this.layers[id] = this.beet.layer(pattern, function (audiotime, step, timeFromScheduled){
          self.click(audiotime, frequency);
    });

  this.layers[id].tempo = bpm;
  this.beet.add(this.layers[id]);
  this.layers[id].start();
};

AudioEngine.prototype.stopClick = function (id)
{
  this.layers[id].stop();
  this.beet.remove(this.layers[id]);
  this.layers[id] = null;
};

AudioEngine.prototype.stopSound = AudioEngine.prototype.stopClick;

AudioEngine.prototype.updateLayerPattern = function (id, pattern) {
  if(this.layers[id])
  {
    var onCallback = this.layers[id].on;
    var offCallback = this.layers[id].off;
    var bpm = this.layers[id].tempo;
    var next_event_time = this.layers[id].metro._next_event_time;
    var step = this.layers[id].metro._step;
    var pat = this.beet.pattern(pattern);
    this.stopClick(id);
    this.layers[id] = this.beet.layer(pat, onCallback, offCallback);
    this.layers[id].tempo = bpm;
    this.layers[id].metro._step = step;
    this.beet.add(this.layers[id]);
    this.layers[id].start(next_event_time);
  }
}

AudioEngine.prototype.setTempo = function (id, tempo)
{
  this.layers[id].tempo = tempo;
}


AudioEngine.prototype.click = function(time, frequency)
{
  //console.log("time: " + time + " ==== audio current: " + audio.context.currentTime);
  var osc = this.context.createOscillator();
  osc.connect(this.context.destination);

  //osc.setPeriodicWave(this.sawtooth);
  //osc.setPeriodicWave(this.sinewave);
  osc.frequency.setValueAtTime(frequency, this.context.currentTime);
  osc.start(time);
  osc.stop(time + 0.05);
}

AudioEngine.prototype.generateSawTooth = function ()
{
  var numCoeffs = 64;
  var realCoeffs = new Float32Array(numCoeffs);
  var imagCoeffs = new Float32Array(numCoeffs);

  realCoeffs[0] = 0.5;
  for (var i = 1; i < numCoeffs; i++) { // note i starts at 1
      imagCoeffs[i] = 1 / (i * Math.PI);
  }

  return this.context.createPeriodicWave(realCoeffs, imagCoeffs);
}

AudioEngine.prototype.generateSineWave = function ()
{
  var real = new Float32Array(2);
  var imag = new Float32Array(2);

  real[0] = 0;
  imag[0] = 0;
  real[1] = 1;
  imag[1] = 0;

  return this.context.createPeriodicWave(real, imag, {disableNormalization: true});
}

//+++++++++++++++++ Playing audio files +++++++++++++++++++

var AudioFile = function (filename)
{
  this.filename = filename;
  this.buffer = null;
  this.preload();
  this.ready = false;
}

AudioFile.prototype.preload = function () {
  var self = this;
  var request = new XMLHttpRequest();
  request.open('GET', this.filename, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    audio.context.decodeAudioData(request.response, function(buffer) {
      self.buffer = buffer;
      self.ready = true;
    }, self.onError);
  };
  request.send();
};

AudioFile.prototype.onError = function ()
{
  console.log("Could not load audio file.");
}

AudioFile.prototype.play = function (time)
{
  var source = audio.context.createBufferSource()
  var g = audio.context.createGain();
  source.buffer = this.buffer;
  if(time && time > 0)
  {
    source.start(time - audio.context.currentTime);
  }
  else {
    source.start(0);
  }
  g.gain.setValueAtTime(0.5, audio.context.currentTime);
  source.connect(g);
  g.connect(audio.context.destination);
}


//+++++++++++ Exports +++++++++++++++++

var audio = new AudioEngine();
