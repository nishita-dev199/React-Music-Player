const fs = require('fs');
const path = require('path');

function createWavBuffer(samples, sampleRate = 44100, numChannels = 2) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.floor(val), offset);
    offset += 2;
  }

  return buffer;
}

// Frequency helper
function noteToFreq(note) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = note.slice(0, -1);
  const octave = parseInt(note.slice(-1), 10);
  const semitonesFromC0 = notes.indexOf(name) + octave * 12;
  // A4 is 440Hz, which is 57 semitones above C0 (A is index 9, 9 + 4*12 = 57)
  return 440 * Math.pow(2, (semitonesFromC0 - 57) / 12);
}

function generateTrack(bpm, chordProgressions, styleIndex = 0, durationSec = 16) {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barProgress = (t % (barDuration * chordProgressions.length)) / barDuration;
    const chordIdx = Math.floor(barProgress) % chordProgressions.length;
    const chord = chordProgressions[chordIdx];
    const beatInBar = (t % barDuration) / beatDuration;

    let sampleL = 0;
    let sampleR = 0;

    // 1. Chords (Warm Synth / E-Piano pad)
    chord.forEach((note, nIdx) => {
      const freq = noteToFreq(note);
      const detune = (nIdx % 2 === 0 ? 0.3 : -0.3);
      // Soft warm saw/sine mix
      const osc1 = Math.sin(2 * Math.PI * freq * t);
      const osc2 = Math.sin(2 * Math.PI * (freq + detune) * t * 2) * 0.2;
      const osc3 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.3; // Sub harmonic
      const env = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t / barDuration));
      
      const pan = (nIdx / chord.length) * 0.6 - 0.3; // stereo spread
      const wave = (osc1 + osc2 + osc3) * 0.08 * (0.8 + 0.2 * env);
      sampleL += wave * (1 - pan);
      sampleR += wave * (1 + pan);
    });

    // 2. Bassline (Punchy warm sine bass)
    const rootNote = chord[0].slice(0, -1) + '2';
    const bassFreq = noteToFreq(rootNote);
    const bassBeat = beatInBar % 1;
    const bassEnv = Math.exp(-bassBeat * 3.5);
    const bassWave = Math.sin(2 * Math.PI * bassFreq * t) * 0.22 * bassEnv;
    sampleL += bassWave;
    sampleR += bassWave;

    // 3. Gentle Lo-Fi / Groove Kick on beat 0 and 2
    const beatFraction = beatInBar % 1;
    if (Math.floor(beatInBar) === 0 || Math.floor(beatInBar) === 2) {
      const kickEnv = Math.exp(-beatFraction * 14);
      const kickFreq = 110 * Math.exp(-beatFraction * 20) + 45;
      const kick = Math.sin(2 * Math.PI * kickFreq * beatFraction) * 0.28 * kickEnv;
      sampleL += kick;
      sampleR += kick;
    }

    // 4. Soft Snare / Rimshot on beat 1 and 3
    if (Math.floor(beatInBar) === 1 || Math.floor(beatInBar) === 3) {
      const snareEnv = Math.exp(-beatFraction * 12);
      const noise = (Math.random() * 2 - 1) * 0.12 * snareEnv;
      const tone = Math.sin(2 * Math.PI * 190 * beatFraction) * 0.1 * snareEnv;
      sampleL += (noise + tone) * 0.9;
      sampleR += (noise + tone) * 1.1;
    }

    // 5. Delicate Hi-Hat (eighth notes)
    const eighthProgress = (beatInBar * 2) % 1;
    const hatEnv = Math.exp(-eighthProgress * 28);
    const hat = (Math.random() * 2 - 1) * 0.04 * hatEnv;
    sampleL += hat * 0.8;
    sampleR += hat * 1.2;

    // Master volume & smooth fade in/out at edges for seamless loop
    const edgeFade = Math.min(1, Math.min(t / 0.1, (durationSec - t) / 0.1));
    left[i] = sampleL * edgeFade * 0.85;
    right[i] = sampleR * edgeFade * 0.85;
  }

  // Interleave stereo samples
  const interleaved = new Float32Array(totalSamples * 2);
  for (let i = 0; i < totalSamples; i++) {
    interleaved[i * 2] = left[i];
    interleaved[i * 2 + 1] = right[i];
  }

  return createWavBuffer(interleaved, sampleRate, 2);
}

// Curate distinct melodic tracks for categories
const TRACKS = [
  {
    name: 'track-1.wav',
    bpm: 105,
    chords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']], // Summer Days
  },
  {
    name: 'track-2.wav',
    bpm: 96,
    chords: [['A3', 'C4', 'E4'], ['G3', 'B3', 'D4'], ['F3', 'A3', 'C4'], ['E3', 'G#3', 'B3']], // Señorita
  },
  {
    name: 'track-3.wav',
    bpm: 116,
    chords: [['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['C4', 'E4', 'G4']], // SOS
  },
  {
    name: 'track-4.wav',
    bpm: 84,
    chords: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']], // Arcade
  },
  {
    name: 'track-5.wav',
    bpm: 122,
    chords: [['F3', 'Ab3', 'C4'], ['C4', 'Eb4', 'G4'], ['Eb3', 'G3', 'Bb3'], ['Bb3', 'D4', 'F4']], // Blinding Lights
  },
  {
    name: 'track-6.wav',
    bpm: 96,
    chords: [['C#4', 'E4', 'G#4'], ['F#3', 'A3', 'C#4'], ['A3', 'C#4', 'E4'], ['B3', 'D#4', 'F#4']], // Shape of You
  },
  {
    name: 'track-7.wav',
    bpm: 78,
    chords: [['A3', 'C#4', 'E4'], ['G#3', 'B3', 'E4'], ['F#3', 'A3', 'C#4'], ['D3', 'F#3', 'A3']], // Someone Like You
  },
  {
    name: 'track-8.wav',
    bpm: 90,
    chords: [['D4', 'F#4', 'A4'], ['A3', 'C#4', 'E4'], ['B3', 'D4', 'F#4'], ['G3', 'B3', 'D4']], // Sunset Lover
  },
];

const outDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

TRACKS.forEach((trk, idx) => {
  console.log(`Generating ${trk.name} (${trk.bpm} BPM)...`);
  const wavBuf = generateTrack(trk.bpm, trk.chords, idx, 16);
  fs.writeFileSync(path.join(outDir, trk.name), wavBuf);
  console.log(`Saved ${trk.name} (${(wavBuf.length / 1024).toFixed(1)} KB)`);
});

console.log('All 8 high quality local music tracks generated successfully!');

