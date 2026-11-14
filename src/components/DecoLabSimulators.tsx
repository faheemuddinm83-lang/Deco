import { useState } from 'react';
import {
  calculateCacheAddressBits,
  computeFullAdder,
  computeTwoComplement8Bit,
} from '../utils/decoLogic';

export function DecoLabSimulators() {
  const [activeTab, setActiveTab] = useState<'logic' | 'cache'>('logic');

  // Unit 1 & 2: Full Adder & Signed 8-bit 2's Complement
  const [bitA, setBitA] = useState<0 | 1>(1);
  const [bitB, setBitB] = useState<0 | 1>(1);
  const [bitCin, setBitCin] = useState<0 | 1>(0);
  const [signedInput, setSignedInput] = useState<number>(-18);

  // Unit 5: Cache Bit Splitter
  const [memoryKB, setMemoryKB] = useState<number>(65536); // 64 MB
  const [cacheKB, setCacheKB] = useState<number>(32); // 32 KB
  const [blockBytes, setBlockBytes] = useState<number>(64);
  const [associativity, setAssociativity] = useState<number>(4);

  const adder = computeFullAdder(bitA, bitB, bitCin);
  const twos = computeTwoComplement8Bit(signedInput);
  const cacheSplit = calculateCacheAddressBits(
    memoryKB,
    cacheKB,
    blockBytes,
    associativity,
  );

  return (
    <section
      id="lab-simulators"
      className="no-print border border-slate-200 bg-white rounded-xl p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Interactive Exam Calculators · Units 1, 2 &amp; 5
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
            DECO Numerical &amp; Logic Lab
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="DECO Lab Simulators"
          className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logic'}
            onClick={() => setActiveTab('logic')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'logic'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Adder &amp; 2&apos;s Complement
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cache'}
            onClick={() => setActiveTab('cache')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'cache'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cache Address Bit-Splitter
          </button>
        </div>
      </div>

      <hr className="border-t border-slate-200" />

      {activeTab === 'logic' ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Interactive Full Adder & Logic Gates */}
          <div className="space-y-5 min-w-0">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                1-Bit Full Adder &amp; Basic Gates Truth Probe
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Toggle binary inputs A, B, and Cin to inspect signal propagation across Sum, Carry-Out, and universal gates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setBitA(bitA === 1 ? 0 : 1)}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold border transition-colors cursor-pointer ${
                  bitA === 1
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Input A = {bitA}
              </button>
              <button
                type="button"
                onClick={() => setBitB(bitB === 1 ? 0 : 1)}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold border transition-colors cursor-pointer ${
                  bitB === 1
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Input B = {bitB}
              </button>
              <button
                type="button"
                onClick={() => setBitCin(bitCin === 1 ? 0 : 1)}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold border transition-colors cursor-pointer ${
                  bitCin === 1
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Carry In = {bitCin}
              </button>
            </div>

            {/* Interactive SVG Full Adder Diagram */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <svg
                viewBox="0 0 460 150"
                className="w-full h-auto"
                role="img"
                aria-label={`Full adder diagram with A=${bitA}, B=${bitB}, Cin=${bitCin}, Sum=${adder.sum}, Cout=${adder.cout}`}
              >
                {/* Input Wires */}
                <line
                  x1="20"
                  y1="35"
                  x2="130"
                  y2="35"
                  stroke={bitA ? '#0284c7' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text x="20" y="25" className="fill-slate-700 text-[12px] font-mono">
                  A = {bitA}
                </text>

                <line
                  x1="20"
                  y1="75"
                  x2="130"
                  y2="75"
                  stroke={bitB ? '#0284c7' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text x="20" y="65" className="fill-slate-700 text-[12px] font-mono">
                  B = {bitB}
                </text>

                <line
                  x1="20"
                  y1="115"
                  x2="130"
                  y2="115"
                  stroke={bitCin ? '#0284c7' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text x="20" y="105" className="fill-slate-700 text-[12px] font-mono">
                  Cin = {bitCin}
                </text>

                {/* Full Adder Block */}
                <rect
                  x="130"
                  y="20"
                  width="180"
                  height="110"
                  rx="8"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  x="220"
                  y="56"
                  textAnchor="middle"
                  className="fill-slate-900 text-[13px] font-bold"
                >
                  1-BIT FULL ADDER
                </text>
                <text
                  x="220"
                  y="78"
                  textAnchor="middle"
                  className="fill-slate-600 text-[11px] font-mono"
                >
                  S = A (+) B (+) Cin
                </text>
                <text
                  x="220"
                  y="98"
                  textAnchor="middle"
                  className="fill-slate-600 text-[11px] font-mono"
                >
                  Cout = AB + Cin(A(+)B)
                </text>

                {/* Output Wires */}
                <line
                  x1="310"
                  y1="52"
                  x2="440"
                  y2="52"
                  stroke={adder.sum ? '#0284c7' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text x="345" y="42" className="fill-slate-900 text-[12px] font-mono font-bold">
                  SUM = {adder.sum}
                </text>

                <line
                  x1="310"
                  y1="100"
                  x2="440"
                  y2="100"
                  stroke={adder.cout ? '#d97706' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text x="345" y="90" className="fill-slate-900 text-[12px] font-mono font-bold">
                  COUT = {adder.cout}
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
              {[
                { label: 'AND(A,B)', val: adder.andOut },
                { label: 'OR(A,B)', val: adder.orOut },
                { label: 'XOR(A,B)', val: adder.xorOut },
                { label: 'NAND', val: adder.nandOut },
                { label: 'NOR', val: adder.norOut },
              ].map((gate) => (
                <div
                  key={gate.label}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2.5"
                >
                  <div className="text-slate-500">{gate.label}</div>
                  <div
                    className={`mt-1 text-base font-bold ${
                      gate.val === 1 ? 'text-sky-700' : 'text-slate-700'
                    }`}
                  >
                    {gate.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8-bit 2's Complement Explorer */}
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                8-Bit Signed 2&apos;s Complement Converter
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Verify exam arithmetic conversions and signed overflow limits (valid range: -128 to +127).
              </p>
            </div>

            <div>
              <label
                htmlFor="signed-decimal-input"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Signed Decimal Integer
              </label>
              <input
                id="signed-decimal-input"
                type="number"
                value={signedInput}
                onChange={(e) =>
                  setSignedInput(
                    Number.isNaN(parseInt(e.target.value, 10))
                      ? 0
                      : parseInt(e.target.value, 10),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
              />
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Status</span>
                <span
                  className={`font-semibold ${
                    twos.overflow ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {twos.overflow ? '▲ 8-BIT OVERFLOW' : '● WITHIN RANGE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">8-Bit 2&apos;s Complement</span>
                <span className="font-bold text-slate-900">{twos.twosComplement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Inverted (1&apos;s Comp of Result)</span>
                <span className="text-slate-800">{twos.onesComplement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Hexadecimal Byte</span>
                <span className="font-semibold text-sky-700">{twos.hex}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="mem-size"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Main Memory Size
              </label>
              <select
                id="mem-size"
                value={memoryKB}
                onChange={(e) => setMemoryKB(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
              >
                <option value={1024}>1 MB (20-bit)</option>
                <option value={4096}>4 MB (22-bit)</option>
                <option value={16384}>16 MB (24-bit)</option>
                <option value={65536}>64 MB (26-bit)</option>
                <option value={262144}>256 MB (28-bit)</option>
                <option value={1048576}>1 GB (30-bit)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cache-size"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Cache Size
              </label>
              <select
                id="cache-size"
                value={cacheKB}
                onChange={(e) => setCacheKB(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
              >
                <option value={4}>4 KB</option>
                <option value={8}>8 KB</option>
                <option value={16}>16 KB</option>
                <option value={32}>32 KB</option>
                <option value={64}>64 KB</option>
                <option value={128}>128 KB</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="block-size"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Block / Line Size
              </label>
              <select
                id="block-size"
                value={blockBytes}
                onChange={(e) => setBlockBytes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
              >
                <option value={16}>16 Bytes</option>
                <option value={32}>32 Bytes</option>
                <option value={64}>64 Bytes</option>
                <option value={128}>128 Bytes</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="assoc-select"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Mapping Associativity
              </label>
              <select
                id="assoc-select"
                value={associativity}
                onChange={(e) => setAssociativity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
              >
                <option value={1}>Direct Mapped (1-way)</option>
                <option value={2}>2-Way Set Associative</option>
                <option value={4}>4-Way Set Associative</option>
                <option value={8}>8-Way Set Associative</option>
              </select>
            </div>
          </div>

          {cacheSplit.valid ? (
            <div className="space-y-4">
              {/* Visual Physical Address Bit Split Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-2">
                  <span>Physical Address Breakdown</span>
                  <span>Total: {cacheSplit.addressBits} bits</span>
                </div>
                <div className="flex h-12 w-full overflow-hidden rounded-lg border border-slate-300 font-mono text-xs font-semibold">
                  <div
                    style={{
                      width: `${(cacheSplit.tagBits / cacheSplit.addressBits) * 100}%`,
                    }}
                    className="flex items-center justify-center bg-slate-900 text-white px-2"
                  >
                    Tag: {cacheSplit.tagBits}b
                  </div>
                  <div
                    style={{
                      width: `${(cacheSplit.indexBits / cacheSplit.addressBits) * 100}%`,
                    }}
                    className="flex items-center justify-center bg-sky-700 text-white px-2 border-l border-white/30"
                  >
                    Index: {cacheSplit.indexBits}b
                  </div>
                  <div
                    style={{
                      width: `${(cacheSplit.offsetBits / cacheSplit.addressBits) * 100}%`,
                    }}
                    className="flex items-center justify-center bg-amber-600 text-white px-2 border-l border-white/30"
                  >
                    Offset: {cacheSplit.offsetBits}b
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4 font-mono text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-xs text-slate-500">Total Cache Lines</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {cacheSplit.totalLines}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-xs text-slate-500">Total Sets</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {cacheSplit.totalSets}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-xs text-slate-500">Index Bits</div>
                  <div className="mt-1 text-lg font-bold text-sky-700">
                    {cacheSplit.indexBits} bits
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-xs text-slate-500">Tag Bits</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {cacheSplit.tagBits} bits
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-800">{cacheSplit.error}</p>
          )}
        </div>
      )}
    </section>
  );
}
