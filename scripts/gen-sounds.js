// Generates audible WAV-content placeholder sound files for LifeQuest.
// ExoPlayer detects format by RIFF magic bytes, not file extension.
'use strict';
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit mono
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);      // PCM chunk size
  buf.writeUInt16LE(1, 20);       // PCM format
  buf.writeUInt16LE(1, 22);       // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);       // block align
  buf.writeUInt16LE(16, 34);      // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
}

function sine(freq, dur) {
  const n = Math.round(dur * SAMPLE_RATE);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SAMPLE_RATE;
    const fadeOut = Math.min(1, (dur - t) / 0.03);
    const fadeIn  = Math.min(1, t / 0.005);
    return 0.7 * Math.sin(2 * Math.PI * freq * t) * fadeOut * fadeIn;
  });
}

function sweep(f0, f1, dur) {
  const n = Math.round(dur * SAMPLE_RATE);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SAMPLE_RATE;
    const freq = f0 + (f1 - f0) * (t / dur);
    const fadeOut = Math.min(1, (dur - t) / 0.03);
    const fadeIn  = Math.min(1, t / 0.005);
    return 0.7 * Math.sin(2 * Math.PI * freq * t) * fadeOut * fadeIn;
  });
}

function steps(freqs, stepDur) {
  return freqs.flatMap(f => sine(f, stepDur));
}

const dir = path.resolve(__dirname, '..', 'assets', 'sounds');

const sounds = {
  'button_tap':   sine(900,  0.08),
  'success':      steps([523, 659, 784], 0.13),
  'error':        sweep(220, 110,  0.30),
  'achievement':  steps([523, 659, 784, 1047], 0.15),
  'milestone':    steps([440, 494, 523, 587, 659], 0.16),
  'age_up':       steps([392, 494, 587, 784], 0.175),
  'level_up':     steps([523, 659, 784], 0.165),
  'coins':        sine(1200, 0.15),
  'negative':     sweep(220, 100,  0.30),
  'positive':     sweep(400, 600,  0.25),
  'decision':     sine(500,  0.18),
  'page_turn':    sine(300,  0.12),
  'notification': sine(880,  0.20),
  'death':        sweep(150, 80,   1.00),
  'reincarnate':  sweep(200, 1000, 0.80),
};

Object.entries(sounds).forEach(([name, samples]) => {
  const fp = path.join(dir, name + '.mp3');
  writeWav(fp, samples);
  console.log(name + '.mp3  ' + fs.statSync(fp).size + ' bytes');
});
console.log('Done.');
