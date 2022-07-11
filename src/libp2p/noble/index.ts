/* eslint-disable quotes */
import * as nodeCrypto from 'crypto';

type Hex = Uint8Array | string;
type PrivKey = Hex | bigint | number;

const pow = (left: any, right: any) => {
  if (typeof left === 'bigint' && typeof right === 'bigint') {
    if (right < 0) {
      throw new RangeError('Exponent must be positive');
    }
    if (!right) {
      return ++right;
    }
    let result: any = left;
    while (--right) result *= left;
    return result;
  }
  return Math.pow(left, right);
};

const _0n = BigInt(0);
const _1n = BigInt(1);
const _2n = BigInt(2);
const _255n = BigInt(255);
const MAX_256B = pow(_2n, BigInt(256));
const CURVE_ORDER = pow(_2n, BigInt(252)) + BigInt('27742317777372353535851937790883648493');
// √(-1) aka √(a) aka 2^((p-1)/4)
const SQRT_M1 = BigInt(
  '19681161376707505956807079304988542015446066515923890162744021073123829784752',
);

/**
 * ed25519 is Twisted Edwards curve with equation of
 * ```
 * −x² + y² = 1 − (121665/121666) * x² * y²
 * ```
 */
const CURVE = {
  // Param: a
  a: BigInt(-1),
  // Equal to -121665/121666 over finite field.
  // Negative number is P - number, and division is invert(number, P)
  d: BigInt('37095705934669439343138083508754565189542113879843219016388785533085940283555'),
  // Finite field 𝔽p over which we'll do calculations
  P: pow(_2n, _255n) - BigInt(19),
  // Subgroup order: how many points ed25519 has
  l: CURVE_ORDER, // in rfc8032 it's called l
  n: CURVE_ORDER, // backwards compatibility
  // Cofactor
  h: BigInt(8),
  // Base point (x, y) aka generator point
  Gx: BigInt('15112221349535400772501151409588531511454012693041857206046113283949847762202'),
  Gy: BigInt('46316835694926478169428394003475163141307993866256225615783033603165251855960'),
};

const crypto: { node?: any; web?: any } = {
  node: nodeCrypto,
  web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
};

class ExtendedPoint {
  // eslint-disable-next-line no-unused-vars
  constructor(readonly x: bigint, readonly y: bigint, readonly z: bigint, readonly t: bigint) {}

  static BASE = new ExtendedPoint(CURVE.Gx, CURVE.Gy, _1n, mod(CURVE.Gx * CURVE.Gy));
  static ZERO = new ExtendedPoint(_0n, _1n, _1n, _0n);
  static fromAffine(p: Point): ExtendedPoint {
    if (!(p instanceof Point)) {
      throw new TypeError('ExtendedPoint#fromAffine: expected Point');
    }
    if (p.equals(Point.ZERO)) return ExtendedPoint.ZERO;
    return new ExtendedPoint(p.x, p.y, _1n, mod(p.x * p.y));
  }
  // Takes a bunch of Jacobian Points but executes only one
  // invert on all of them. invert is very slow operation,
  // so this improves performance massively.
  static toAffineBatch(points: ExtendedPoint[]): Point[] {
    const toInv = invertBatch(points.map((p) => p.z));
    return points.map((p, i) => p.toAffine(toInv[i]));
  }

  static normalizeZ(points: ExtendedPoint[]): ExtendedPoint[] {
    return this.toAffineBatch(points).map(this.fromAffine);
  }

  // Compare one point to another.
  equals(other: ExtendedPoint): boolean {
    assertExtPoint(other);
    const { x: X1, y: Y1, z: Z1 } = this;
    const { x: X2, y: Y2, z: Z2 } = other;
    const X1Z2 = mod(X1 * Z2);
    const X2Z1 = mod(X2 * Z1);
    const Y1Z2 = mod(Y1 * Z2);
    const Y2Z1 = mod(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }

  // Inverses point to one corresponding to (x, -y) in Affine coordinates.
  negate(): ExtendedPoint {
    return new ExtendedPoint(mod(-this.x), this.y, this.z, mod(-this.t));
  }

  // Fast algo for doubling Extended Point when curve's a=-1.
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#doubling-dbl-2008-hwcd
  // Cost: 3M + 4S + 1*a + 7add + 1*2.
  double(): ExtendedPoint {
    const { x: X1, y: Y1, z: Z1 } = this;
    const { a } = CURVE;
    const A = mod(pow(X1, _2n));
    const B = mod(pow(Y1, _2n));
    const C = mod(_2n * mod(pow(Z1, _2n)));
    const D = mod(a * A);
    const E = mod(mod(pow(X1 + Y1, _2n)) - A - B);
    const G = D + B;
    const F = G - C;
    const H = D - B;
    const X3 = mod(E * F);
    const Y3 = mod(G * H);
    const T3 = mod(E * H);
    const Z3 = mod(F * G);
    return new ExtendedPoint(X3, Y3, Z3, T3);
  }

  // Fast algo for adding 2 Extended Points when curve's a=-1.
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-4
  // Cost: 8M + 8add + 2*2.
  // Note: It does not check whether the `other` point is valid.
  add(other: ExtendedPoint) {
    assertExtPoint(other);
    const { x: X1, y: Y1, z: Z1, t: T1 } = this;
    const { x: X2, y: Y2, z: Z2, t: T2 } = other;
    const A = mod((Y1 - X1) * (Y2 + X2));
    const B = mod((Y1 + X1) * (Y2 - X2));
    const F = mod(B - A);
    if (F === _0n) return this.double(); // Same point.
    const C = mod(Z1 * _2n * T2);
    const D = mod(T1 * _2n * Z2);
    const E = D + C;
    const G = B + A;
    const H = D - C;
    const X3 = mod(E * F);
    const Y3 = mod(G * H);
    const T3 = mod(E * H);
    const Z3 = mod(F * G);
    return new ExtendedPoint(X3, Y3, Z3, T3);
  }

  subtract(other: ExtendedPoint): ExtendedPoint {
    return this.add(other.negate());
  }

  private precomputeWindow(W: number): ExtendedPoint[] {
    const windows = 1 + 256 / W;
    const points: ExtendedPoint[] = [];
    let p: ExtendedPoint = this;
    let base = p;
    for (let window = 0; window < windows; window++) {
      base = p;
      points.push(base);
      for (let i = 1; i < 2 ** (W - 1); i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }

  private wNAF(n: bigint, affinePoint?: Point): ExtendedPoint {
    if (!affinePoint && this.equals(ExtendedPoint.BASE)) affinePoint = Point.BASE;
    const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
    if (256 % W) {
      throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
    }

    let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
    if (!precomputes) {
      precomputes = this.precomputeWindow(W);
      if (affinePoint && W !== 1) {
        precomputes = ExtendedPoint.normalizeZ(precomputes);
        pointPrecomputes.set(affinePoint, precomputes);
      }
    }

    let p = ExtendedPoint.ZERO;
    let f = ExtendedPoint.ZERO;

    const windows = 1 + 256 / W;
    const windowSize = 2 ** (W - 1);
    const mask = BigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.
    const maxNumber = 2 ** W;
    const shiftBy = BigInt(W);

    for (let window = 0; window < windows; window++) {
      const offset = window * windowSize;
      // Extract W bits.
      let wbits = Number(n & mask);

      // Shift number by W bits.
      n >>= shiftBy;

      // If the bits are bigger than max size, we'll split those.
      // +224 => 256 - 32
      if (wbits > windowSize) {
        wbits -= maxNumber;
        n += _1n;
      }

      // Check if we're onto Zero point.
      // Add random point inside current window to f.
      if (wbits === 0) {
        let pr = precomputes[offset];
        if (window % 2) pr = pr.negate();
        f = f.add(pr);
      } else {
        let cached = precomputes[offset + Math.abs(wbits) - 1];
        if (wbits < 0) cached = cached.negate();
        p = p.add(cached);
      }
    }
    return ExtendedPoint.normalizeZ([p, f])[0];
  }

  // Constant time multiplication.
  // Uses wNAF method. Windowed method may be 10% faster,
  // but takes 2x longer to generate and consumes 2x memory.
  multiply(scalar: number | bigint, affinePoint?: Point): ExtendedPoint {
    return this.wNAF(normalizeScalar(scalar, CURVE.l), affinePoint);
  }

  // Non-constant-time multiplication. Uses double-and-add algorithm.
  // It's faster, but should only be used when you don't care about
  // an exposed private key e.g. sig verification.
  // Allows scalar bigger than curve order, but less than 2^256
  multiplyUnsafe(scalar: number | bigint): ExtendedPoint {
    let n = normalizeScalar(scalar, CURVE.l, false);
    const G = ExtendedPoint.BASE;
    const P0 = ExtendedPoint.ZERO;
    if (n === _0n) return P0;
    if (this.equals(P0) || n === _1n) return this;
    if (this.equals(G)) return this.wNAF(n);
    let p = P0;
    let d: ExtendedPoint = this;
    while (n > _0n) {
      if (n & _1n) p = p.add(d);
      d = d.double();
      n >>= _1n;
    }
    return p;
  }

  isSmallOrder(): boolean {
    return this.multiplyUnsafe(CURVE.h).equals(ExtendedPoint.ZERO);
  }

  isTorsionFree(): boolean {
    return this.multiplyUnsafe(CURVE.l).equals(ExtendedPoint.ZERO);
  }

  // Converts Extended point to default (x, y) coordinates.
  // Can accept precomputed Z^-1 - for example, from invertBatch.
  toAffine(invZ: bigint = invert(this.z)): Point {
    const { x, y, z } = this;
    const ax = mod(x * invZ);
    const ay = mod(y * invZ);
    const zz = mod(z * invZ);
    if (zz !== _1n) throw new Error('invZ was invalid');
    return new Point(ax, ay);
  }

  fromRistrettoBytes() {
    legacyRist();
  }
  toRistrettoBytes() {
    legacyRist();
  }
  fromRistrettoHash() {
    legacyRist();
  }
}

// Stores precomputed values for points.
const pointPrecomputes = new WeakMap<Point, ExtendedPoint[]>();

class Point {
  // Base point aka generator
  // public_key = Point.BASE * private_key
  static BASE: Point = new Point(CURVE.Gx, CURVE.Gy);
  // Identity point aka point at infinity
  // point = point + zero_point
  static ZERO: Point = new Point(_0n, _1n);
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  _WINDOW_SIZE?: number;

  // eslint-disable-next-line no-unused-vars
  constructor(readonly x: bigint, readonly y: bigint) {}

  // "Private method", don't use it directly.
  _setWindowSize(windowSize: number) {
    this._WINDOW_SIZE = windowSize;
    pointPrecomputes.delete(this);
  }

  // Converts hash string or Uint8Array to Point.
  // Uses algo from RFC8032 5.1.3.
  static fromHex(hex: Hex, strict = true) {
    const { d, P } = CURVE;
    hex = ensureBytes(hex, 32);
    // 1.  First, interpret the string as an integer in little-endian
    // representation. Bit 255 of this number is the least significant
    // bit of the x-coordinate and denote this value x_0.  The
    // y-coordinate is recovered simply by clearing this bit.  If the
    // resulting value is >= p, decoding fails.
    const normed = hex.slice();
    normed[31] = hex[31] & ~0x80;
    const y = bytesToNumberLE(normed);

    if (strict && y >= P) throw new Error('Expected 0 < hex < P');
    if (!strict && y >= MAX_256B) throw new Error('Expected 0 < hex < 2**256');

    // 2.  To recover the x-coordinate, the curve equation implies
    // x² = (y² - 1) / (d y² + 1) (mod p).  The denominator is always
    // non-zero mod p.  Let u = y² - 1 and v = d y² + 1.
    const y2 = mod(y * y);
    const u = mod(y2 - _1n);
    const v = mod(d * y2 + _1n);
    let { isValid, value: x } = uvRatio(u, v);
    if (!isValid) throw new Error('Point.fromHex: invalid y coordinate');

    // 4.  Finally, use the x_0 bit to select the right square root.  If
    // x = 0, and x_0 = 1, decoding fails.  Otherwise, if x_0 != x mod
    // 2, set x <-- p - x.  Return the decoded point (x,y).
    const isXOdd = (x & _1n) === _1n;
    const isLastByteOdd = (hex[31] & 0x80) !== 0;
    if (isLastByteOdd !== isXOdd) {
      x = mod(-x);
    }
    return new Point(x, y);
  }

  static async fromPrivateKey(privateKey: PrivKey) {
    return (await getExtendedPublicKey(privateKey)).point;
  }

  // There can always be only two x values (x, -x) for any y
  // When compressing point, it's enough to only store its y coordinate
  // and use the last byte to encode sign of x.
  toRawBytes(): Uint8Array {
    const bytes = numberTo32BytesLE(this.y);
    bytes[31] |= this.x & _1n ? 0x80 : 0;
    return bytes;
  }

  // Same as toRawBytes, but returns string.
  toHex(): string {
    return bytesToHex(this.toRawBytes());
  }

  /**
   * Converts to Montgomery; aka x coordinate of curve25519.
   * We don't have fromX25519, because we don't know sign.
   *
   * ```
   * u, v: curve25519 coordinates
   * x, y: ed25519 coordinates
   * (u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)
   * (x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))
   * ```
   * https://blog.filippo.io/using-ed25519-keys-for-encryption
   * @returns u coordinate of curve25519 point
   */
  toX25519(): Uint8Array {
    const { y } = this;
    const u = mod((_1n + y) * invert(_1n - y));
    return numberTo32BytesLE(u);
  }

  isTorsionFree(): boolean {
    return ExtendedPoint.fromAffine(this).isTorsionFree();
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  negate() {
    return new Point(mod(-this.x), this.y);
  }

  add(other: Point) {
    return ExtendedPoint.fromAffine(this).add(ExtendedPoint.fromAffine(other)).toAffine();
  }

  subtract(other: Point) {
    return this.add(other.negate());
  }

  /**
   * Constant time multiplication.
   * @param scalar Big-Endian number
   * @returns new point
   */
  multiply(scalar: number | bigint): Point {
    return ExtendedPoint.fromAffine(this).multiply(scalar, this).toAffine();
  }
}

class Signature {
  // eslint-disable-next-line no-unused-vars
  constructor(readonly r: Point, readonly s: bigint) {
    // eslint-disable-line no-unused-vars
    this.assertValidity();
  }

  static fromHex(hex: Hex) {
    const bytes = ensureBytes(hex, 64);
    const r = Point.fromHex(bytes.slice(0, 32), false);
    const s = bytesToNumberLE(bytes.slice(32, 64));
    return new Signature(r, s);
  }

  assertValidity() {
    const { r, s } = this;
    if (!(r instanceof Point)) throw new Error('Expected Point instance');
    // 0 <= s < l
    normalizeScalar(s, CURVE.l, false);
    return this;
  }

  toRawBytes() {
    const u8 = new Uint8Array(64);
    u8.set(this.r.toRawBytes());
    u8.set(numberTo32BytesLE(this.s), 32);
    return u8;
  }

  toHex() {
    return bytesToHex(this.toRawBytes());
  }
}

function mod(a: bigint, b: bigint = CURVE.P) {
  const res = a % b;
  return res >= _0n ? res : b + res;
}

function numberTo32BytesBE(num: bigint) {
  const length = 32;
  const hex = num.toString(16).padStart(length * 2, '0');
  return hexToBytes(hex);
}

function numberTo32BytesLE(num: bigint) {
  return numberTo32BytesBE(num).reverse();
}

// Power to (p-5)/8 aka x^(2^252-3)
// Used to calculate y - the square root of y².
// Exponentiates it to very big number.
// We are unwrapping the loop because it's 2x faster.
// (2n**252n-3n).toString(2) would produce bits [250x 1, 0, 1]
// We are multiplying it bit-by-bit
function pow_2_252_3(x: bigint) {
  const { P } = CURVE;
  const _5n = BigInt(5);
  const _10n = BigInt(10);
  const _20n = BigInt(20);
  const _40n = BigInt(40);
  const _80n = BigInt(80);
  const x2 = (x * x) % P;
  const b2 = (x2 * x) % P; // x^3, 11
  const b4 = (pow2(b2, _2n) * b2) % P; // x^15, 1111
  const b5 = (pow2(b4, _1n) * x) % P; // x^31
  const b10 = (pow2(b5, _5n) * b5) % P;
  const b20 = (pow2(b10, _10n) * b10) % P;
  const b40 = (pow2(b20, _20n) * b20) % P;
  const b80 = (pow2(b40, _40n) * b40) % P;
  const b160 = (pow2(b80, _80n) * b80) % P;
  const b240 = (pow2(b160, _80n) * b80) % P;
  const b250 = (pow2(b240, _10n) * b10) % P;
  const pow_p_5_8 = (pow2(b250, _2n) * x) % P;
  // ^ To pow to (p+3)/8, multiply it by x.
  return { pow_p_5_8, b2 };
}

// Little-endian check for first LE bit (last BE bit);
function edIsNegative(num: bigint) {
  return (mod(num) & _1n) === _1n;
}

// Does x ^ (2 ^ power) mod p. pow2(30, 4) == 30 ^ (2 ^ 4)
function pow2(x: bigint, power: bigint): bigint {
  const { P } = CURVE;
  let res = x;
  while (power-- > _0n) {
    res *= res;
    res %= P;
  }
  return res;
}

// Ratio of u to v. Allows us to combine inversion and square root. Uses algo from RFC8032 5.1.3.
// Constant-time
// prettier-ignore
function uvRatio(u: bigint, v: bigint): { isValid: boolean, value: bigint } {
  const v3 = mod(v * v * v);                  // v³
  const v7 = mod(v3 * v3 * v);                // v⁷
  const pow = pow_2_252_3(u * v7).pow_p_5_8;
  let x = mod(u * v3 * pow);                  // (uv³)(uv⁷)^(p-5)/8
  const vx2 = mod(v * x * x);                 // vx²
  const root1 = x;                            // First root candidate
  const root2 = mod(x * SQRT_M1);             // Second root candidate
  const useRoot1 = vx2 === u;                 // If vx² = u (mod p), x is a square root
  const useRoot2 = vx2 === mod(-u);           // If vx² = -u, set x <-- x * 2^((p-1)/4)
  const noRoot = vx2 === mod(-u * SQRT_M1);   // There is no valid root, vx² = -u√(-1)
  if (useRoot1) x = root1;
  if (useRoot2 || noRoot) x = root2;          // We return root2 anyway, for const-time
  if (edIsNegative(x)) x = mod(-x);
  return { isValid: useRoot1 || useRoot2, value: x };
}

/**
 * Takes a list of numbers, efficiently inverts all of them.
 * @param nums list of bigints
 * @param p modulo
 * @returns list of inverted bigints
 * @example
 * invertBatch([1n, 2n, 4n], 21n);
 * // => [1n, 11n, 16n]
 */
function invertBatch(nums: bigint[], p: bigint = CURVE.P): bigint[] {
  const tmp = new Array(nums.length);
  // Walk from first to last, multiply them by each other MOD p
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (num === _0n) return acc;
    tmp[i] = acc;
    return mod(acc * num, p);
  }, _1n);
  // Invert last element
  const inverted = invert(lastMultiplied, p);
  // Walk from last to first, multiply them by inverted each other MOD p
  nums.reduceRight((acc, num, i) => {
    if (num === _0n) return acc;
    tmp[i] = mod(acc * tmp[i], p);
    return mod(acc * num, p);
  }, inverted);
  return tmp;
}

function assertExtPoint(other: unknown) {
  if (!(other instanceof ExtendedPoint)) throw new TypeError('ExtendedPoint expected');
}

function legacyRist() {
  throw new Error('Legacy method: switch to RistrettoPoint');
}

// Note: this egcd-based invert is 50% faster than powMod-based one.
// Inverses number over modulo
function invert(number: bigint, modulo: bigint = CURVE.P): bigint {
  if (number === _0n || modulo <= _0n) {
    throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
  }
  // Eucledian GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
  let a = mod(number, modulo);
  let b = modulo;
  // prettier-ignore
  let x = _0n, y = _1n, u = _1n, v = _0n;
  while (a !== _0n) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    // prettier-ignore
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n) throw new Error('invert: does not exist');
  return mod(x, modulo);
}

const randomBytes = (bytesLength: number = 32): Uint8Array => {
  if (crypto.web) {
    return crypto.web.getRandomValues(new Uint8Array(bytesLength));
  } else if (crypto.node) {
    const { randomBytes } = crypto.node;
    return new Uint8Array(randomBytes(bytesLength).buffer);
  } else {
    throw new Error("The environment doesn't have randomBytes function");
  }
};

const sha512 = async (message: Uint8Array): Promise<Uint8Array> => {
  if (crypto.web) {
    const buffer = await crypto.web.subtle.digest('SHA-512', message.buffer);
    return new Uint8Array(buffer);
  } else if (crypto.node) {
    return Uint8Array.from(crypto.node.createHash('sha512').update(message).digest());
  } else {
    throw new Error("The environment doesn't have sha512 function");
  }
};

function ensureBytes(hex: Hex, expectedLength?: number): Uint8Array {
  // Uint8Array.from() instead of hash.slice() because node.js Buffer
  // is instance of Uint8Array, and its slice() creates **mutable** copy
  const bytes = hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
  if (typeof expectedLength === 'number' && bytes.length !== expectedLength)
    throw new Error(`Expected ${expectedLength} bytes`);
  return bytes;
}

// Caching slows it down 2-3x
function hexToBytes(hex: string): Uint8Array {
  if (typeof hex !== 'string') {
    throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
  }
  if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = Number.parseInt(hexByte, 16);
    if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
    array[i] = byte;
  }
  return array;
}

function normalizeScalar(num: number | bigint, max: bigint, strict = true): bigint {
  if (!max) throw new TypeError('Specify max value');
  if (typeof num === 'number' && Number.isSafeInteger(num)) num = BigInt(num);
  if (typeof num === 'bigint' && num < max) {
    if (strict) {
      if (_0n < num) return num;
    } else {
      if (_0n <= num) return num;
    }
  }
  throw new TypeError('Expected valid scalar: 0 < scalar < max');
}

function adjustBytes25519(bytes: Uint8Array): Uint8Array {
  // Section 5: For X25519, in order to decode 32 random bytes as an integer scalar,
  // set the three least significant bits of the first byte
  bytes[0] &= 248; // 0b1111_1000
  // and the most significant bit of the last to zero,
  bytes[31] &= 127; // 0b0111_1111
  // set the second most significant bit of the last byte to 1
  bytes[31] |= 64; // 0b0100_0000
  return bytes;
}

const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
function bytesToHex(uint8a: Uint8Array): string {
  // pre-caching improves the speed 6x
  if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
  let hex = '';
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes[uint8a[i]];
  }
  return hex;
}

// Little Endian
function bytesToNumberLE(uint8a: Uint8Array): bigint {
  if (!(uint8a instanceof Uint8Array)) throw new Error('Expected Uint8Array');
  return BigInt('0x' + bytesToHex(Uint8Array.from(uint8a).reverse()));
}

async function getExtendedPublicKey(key: PrivKey) {
  // Normalize bigint / number / string to Uint8Array
  key =
    typeof key === 'bigint' || typeof key === 'number'
      ? numberTo32BytesBE(normalizeScalar(key, MAX_256B))
      : ensureBytes(key);
  if (key.length !== 32) throw new Error(`Expected 32 bytes`);
  // hash to produce 64 bytes
  const hashed = await sha512(key);
  // First 32 bytes of 64b uniformingly random input are taken,
  // clears 3 bits of it to produce a random field element.
  const head = adjustBytes25519(hashed.slice(0, 32));
  // Second 32 bytes is called key prefix (5.1.6)
  const prefix = hashed.slice(32, 64);
  // The actual private scalar
  const scalar = mod(bytesToNumberLE(head), CURVE.l);
  // Point on Edwards curve aka public key
  const point = Point.BASE.multiply(scalar);
  const pointBytes = point.toRawBytes();
  return { head, prefix, scalar, point, pointBytes };
}

// Little-endian SHA512 with modulo n
async function sha512ModqLE(...args: Uint8Array[]): Promise<bigint> {
  const hash = await sha512(concatBytes(...args));
  const value = bytesToNumberLE(hash);
  return mod(value, CURVE.l);
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  if (!arrays.every((a) => a instanceof Uint8Array)) throw new Error('Expected Uint8Array list');
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}

// Note: ed25519 private keys are uniform 32-bit strings. We do not need
// to check for modulo bias like we do in noble-secp256k1 randomPrivateKey()
export const randomPrivateKey = (): Uint8Array => {
  return randomBytes(32);
};

//
/**
 * Calculates ed25519 public key.
 * 1. private key is hashed with sha512, then first 32 bytes are taken from the hash
 * 2. 3 least significant bits of the first byte are cleared
 * RFC8032 5.1.5
 */
export async function getPublicKey(privateKey: PrivKey): Promise<Uint8Array> {
  return (await getExtendedPublicKey(privateKey)).pointBytes;
}

export async function sign(message: Hex, privateKey: Hex): Promise<Uint8Array> {
  message = ensureBytes(message);
  const { prefix, scalar, pointBytes } = await getExtendedPublicKey(privateKey);
  const r = await sha512ModqLE(prefix, message); // r = hash(prefix + msg)
  const R = Point.BASE.multiply(r); // R = rG
  const k = await sha512ModqLE(R.toRawBytes(), pointBytes, message); // k = hash(R + P + msg)
  const s = mod(r + k * scalar, CURVE.l); // s = r + kp
  return new Signature(R, s).toRawBytes();
}
