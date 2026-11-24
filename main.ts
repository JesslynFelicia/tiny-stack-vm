// Compact implementation of make.fun's tiny stack ISA (ISA.md), all rules as specified.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const T: Record<number, number[]> = {
  0: [0, 0, 0], 1: [1, 0, 1], 2: [4, 0, 1], 3: [0, 1, 0], 4: [0, 1, 2], 5: [0, 2, 2], 6: [0, 2, 3], 7: [0, 3, 3],
  0x17: [0, 1, 1], 0x1b: [0, 1, 1], 0x30: [2, 0, 0], 0x31: [2, 1, 0], 0x32: [2, 1, 0], 0x33: [2, 0, 0],
  0x34: [0, 0, 0], 0x40: [0, 1, 1], 0x41: [0, 2, 0], 0x50: [0, 1, 0], 0x51: [0, 1, 0], 0x52: [0, 0, 1], 0x53: [0, 1, 0],
};
for (let o = 0x10; o < 0x23; o++) if (o < 0x17 || (o > 0x17 && o < 0x1b) || (o > 0x1b && o < 0x1f) || o > 0x1f) T[o] = [0, 2, 1];

function run(p: Uint8Array, inp: Uint8Array): [Uint8Array, number] {
  const n = p.length;
  const D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), out = new Uint8Array(65536);
  let sp = 0, cs = 0, ol = 0, ip = 0, pc = 0, st = 0;
  const f = (c: number): [Uint8Array, number] => [out.slice(0, ol), c];
  for (;;) {
    if (st === 1e6) return f(10);
    if (pc < 0 || pc >= n) return f(9);
    const op = p[pc], t = T[op];
    if (!t) return f(5);
    const [im, po, pu] = t;
    if (pc + im >= n) return f(9);
    st++;
    const nx = pc + 1 + im;
    if (sp < po) return f(2);
    if (sp - po + pu > 256) return f(3);
    pc = nx;
    if (op >= 0x10 && op <= 0x22 && po === 2) {
      const b = D[sp - 1], a = D[sp - 2];
      let r = 0;
      switch (op) {
        case 0x10: r = a + b; break;
        case 0x11: r = a - b; break;
        case 0x12: r = Math.imul(a, b); break;
        case 0x13: case 0x14: case 0x15: case 0x16:
          if (!b) return f(4);
          if (op === 0x13) r = a === -2147483648 && b === -1 ? a : a / b;
          else if (op === 0x14) r = b === -1 ? 0 : a % b;
          else if (op === 0x15) r = Math.floor((a >>> 0) / (b >>> 0));
          else r = (a >>> 0) % (b >>> 0);
          break;
        case 0x18: r = a & b; break;
        case 0x19: r = a | b; break;
        case 0x1a: r = a ^ b; break;
        case 0x1c: r = a << (b & 31); break;
        case 0x1d: r = a >> (b & 31); break;
        case 0x1e: r = a >>> (b & 31); break;
        case 0x20: r = +(a === b); break;
        case 0x21: r = +(a < b); break;
        case 0x22: r = +(a >>> 0 < b >>> 0); break;
      }
      D[--sp - 1] = r | 0;
      continue;
    }
    switch (op) {
      case 0: return f(0);
      case 1: D[sp++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const x = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = x; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 0x17: D[sp - 1] = -D[sp - 1] | 0; break;
      case 0x1b: D[sp - 1] = ~D[sp - 1]; break;
      case 0x30: case 0x31: case 0x32: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        let tk = true;
        if (op > 0x30) { const v = D[--sp]; tk = op === 0x31 ? v === 0 : v !== 0; }
        if (tk) pc = nx + rel;
        break;
      }
      case 0x33:
        if (cs === 64) return f(7);
        C[cs++] = nx;
        pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 0x34:
        if (!cs) return f(8);
        pc = C[--cs];
        break;
      case 0x40: { const a = D[sp - 1]; if (a < 0 || a > 255) return f(6); D[sp - 1] = M[a]; break; }
      case 0x41: { const a = D[sp - 1]; if (a < 0 || a > 255) return f(6); M[a] = D[sp - 2]; sp -= 2; break; }
      case 0x50: {
        const s = String(D[sp - 1]);
        if (ol + s.length > 65536) return f(11);
        sp--;
        for (let i = 0; i < s.length; i++) out[ol++] = s.charCodeAt(i);
        break;
      }
      case 0x51:
        if (ol >= 65536) return f(11);
        out[ol++] = D[--sp] & 255;
        break;
      case 0x52: D[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 0x53: return f(D[--sp] & 255);
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const [o, c] = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), o);
  writeFileSync(join(O, id, 'exit.txt'), `${c}\n`);
}
