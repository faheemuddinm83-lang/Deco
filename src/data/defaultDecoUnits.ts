import type { DecoUnit } from '../types/deco';

export const DEFAULT_DECO_UNITS: DecoUnit[] = [
  {
    unitNumber: 1,
    title: 'Number Systems, Boolean Algebra & Logic Gates',
    subtitle:
      'Radix conversions, signed 2s complement arithmetic, error codes, Boolean laws, and K-Map minimization',
    estimatedHours: '4.5 hrs',
    notes: [
      {
        id: 'u1-n1',
        heading: '1.1 Number Systems & Signed Arithmetic',
        summary:
          'Digital systems represent quantities in Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16). Negative integers are universally stored using 2s complement.',
        keyPoints: [
          'Binary-to-Octal groups bits in 3s from the binary point; Binary-to-Hex groups bits in 4s.',
          '1s Complement flips every bit (0 -> 1, 1 -> 0); has two representations for zero (+0 and -0).',
          '2s Complement = 1s Complement + 1; unique zero, range for n bits is [-2^(n-1), +2^(n-1) - 1].',
          'Overflow in signed addition occurs when two operands of the same sign yield a result of the opposite sign (Cin to MSB != Cout from MSB).',
        ],
        formulasOrTables: [
          '8-bit Signed Range: -128 to +127',
          '2s Complement Shortcut: Copy bits from LSB up to the first 1, then invert all remaining bits to the left.',
          'Subtraction A - B = A + (2s complement of B). Discard end carry.',
        ],
        workedExample: {
          problem: 'Subtract 14 - 23 using 8-bit 2s complement arithmetic.',
          solutionSteps: [
            '+14 in 8-bit binary = 00001110',
            '+23 in 8-bit binary = 00010111 -> 2s complement (-23) = 11101001',
            'Add: 00001110 + 11101001 = 11110111 (MSB is 1, so result is negative)',
            'Take 2s complement of 11110111 -> 00001001 = 9 -> Final answer = -9.',
          ],
        },
      },
      {
        id: 'u1-n2',
        heading: '1.2 Binary Codes & Error Detection (BCD, Gray, Hamming)',
        summary:
          'Specialized binary codes simplify decimal I/O, mechanical shaft encoding, and reliable memory transmission.',
        keyPoints: [
          'BCD (8421): Each decimal digit 0-9 uses 4 bits; codes 1010-1111 are invalid (add 0110 correction if sum > 9).',
          'Excess-3: Self-complementing unweighted code obtained by adding 3 (0011) to each BCD digit.',
          'Gray Code: Unit-distance code where successive values differ by only 1 bit (prevents race/glitch errors).',
          'Hamming Code: Adds k parity bits at positions 2^0, 2^1, 2^2... such that 2^k >= m + k + 1 for single-bit error correction.',
        ],
        formulasOrTables: [
          'Binary to Gray: G_n = B_n, and G_i = B_(i+1) XOR B_i',
          'Gray to Binary: B_n = G_n, and B_i = B_(i+1) XOR G_i',
          'Hamming Parity Inequality: 2^k >= m + k + 1',
        ],
      },
      {
        id: 'u1-n3',
        heading: '1.3 Boolean Algebra, Logic Gates & K-Map Simplification',
        summary:
          'Boolean expressions are minimized algebraically or graphically via Karnaugh Maps before hardware realization using basic or universal gates.',
        keyPoints: [
          'De Morgan Laws: (A + B)\' = A\' · B\' and (A · B)\' = A\' + B\'.',
          'Universal Gates (NAND and NOR): Any Boolean function can be implemented using only NAND gates (SOP -> NAND-NAND) or only NOR gates (POS -> NOR-NOR).',
          'Canonical SOP sums minterms (m_i where output = 1); Canonical POS multiplies maxterms (M_i where output = 0).',
          'K-Map Rules: Group adjacent 1s (and optional Don\'t-Care X cells) in powers of 2 (8, 4, 2, 1) starting with essential prime implicants.',
        ],
        formulasOrTables: [
          'Absorption: A + A·B = A | Consensus: A·B + A\'·C + B·C = A·B + A\'·C',
          'XOR: A (+) B = A\'B + AB\' | XNOR: (A (+) B)\' = AB + A\'B\'',
        ],
      },
    ],
    importantTopics: [
      {
        id: 'u1-t1',
        title: '4-Variable K-Map Minimization with Don\'t-Care Conditions',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Minimize F(A,B,C,D) = Sum m(1,3,7,11,15) + d(0,2,5) and implement using NAND gates only.',
        answerOutline: [
          'Draw 4x4 Gray-ordered K-map (00, 01, 11, 10).',
          'Place 1s at minterms and X at don\'t-care cells; include X only if it enlarges a group.',
          'Identify Essential Prime Implicants (EPIs) first, then cover remaining 1s.',
          'Convert simplified SOP expression directly into a two-level NAND-NAND circuit.',
        ],
      },
      {
        id: 'u1-t2',
        title: 'Universal Gate Realization (NAND-only & NOR-only)',
        examMarks: '8 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Prove that NAND and NOR are universal gates by realizing NOT, AND, OR, and XOR using only NAND gates.',
        answerOutline: [
          'NOT using NAND: tie both inputs together (A NAND A = A\').',
          'AND using NAND: invert output of NAND with a second 1-input NAND.',
          'OR using NAND: invert each input first, then feed into a NAND gate (De Morgan).',
          'XOR using 4 NAND gates: A (+) B = [A NAND (A NAND B)] NAND [B NAND (A NAND B)].',
        ],
      },
      {
        id: 'u1-t3',
        title: 'Hamming Code Error Detection & Correction',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Construct a 7-bit even-parity Hamming code for data 1011 and show how a single-bit error is located.',
        answerOutline: [
          'Determine k=3 parity bits for m=4 data bits (2^3 >= 4+3+1).',
          'Assign P1 (pos 1), P2 (pos 2), P4 (pos 4); place D3, D5, D6, D7.',
          'Compute P1 (bits 1,3,5,7), P2 (2,3,6,7), P4 (4,5,6,7) for even parity.',
          'At receiver, recalculate syndrome bits C4 C2 C1; binary value points directly to erroneous bit position.',
        ],
      },
      {
        id: 'u1-t4',
        title: '2s Complement Subtraction & Signed Overflow',
        examMarks: '5 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Perform (-45) + (-38) in 8-bit 2s complement and state the condition for arithmetic overflow.',
        answerOutline: [
          'Convert magnitudes to 8-bit binary and take 2s complement for negative values.',
          'Add bit-by-bit and check C_in to sign bit vs C_out from sign bit.',
          'State rule: Overflow = C_in(MSB) XOR C_out(MSB).',
        ],
      },
      {
        id: 'u1-t5',
        title: 'Binary <-> Gray Code & BCD Addition',
        examMarks: '4 Marks',
        priority: 'Conceptual',
        expectedQuestion:
          'Explain why Gray code is preferred in rotary encoders and perform BCD addition of 58 + 67.',
        answerOutline: [
          'Highlight single-bit transition property eliminating intermediate false states.',
          'Show 4-bit BCD addition and +6 (0110) correction when nibble > 9 or carry occurs.',
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'u1-q1',
        question:
          'How many NAND gates are minimally required to implement a 2-input XOR gate?',
        options: ['3 NAND gates', '4 NAND gates', '5 NAND gates', '6 NAND gates'],
        correctIndex: 1,
        explanation:
          'A standard 2-input XOR requires 4 two-input NAND gates: G1 = (AB)\', G2 = (A·G1)\', G3 = (B·G1)\', Out = (G2·G3)\'.',
      },
      {
        id: 'u1-q2',
        question: 'What is the 8-bit 2s complement representation of -18?',
        options: ['11101101', '11101110', '10010010', '11101100'],
        correctIndex: 1,
        explanation:
          '+18 = 00010010. Inverting gives 11101101 (1s complement), adding 1 yields 11101110.',
      },
    ],
  },
  {
    unitNumber: 2,
    title: 'Combinational & Sequential Logic Circuits',
    subtitle:
      'Adders, multiplexers, decoders, flip-flops, excitation tables, shift registers, and synchronous counters',
    estimatedHours: '5.0 hrs',
    notes: [
      {
        id: 'u2-n1',
        heading: '2.1 Arithmetic Combinational Circuits & MSI Blocks',
        summary:
          'Combinational outputs depend strictly on present inputs. Key MSI building blocks include adders, multiplexers, decoders, and encoders.',
        keyPoints: [
          'Half Adder: Sum = A (+) B, Carry = A · B. Full Adder: Sum = A (+) B (+) Cin, Cout = AB + Cin(A (+) B).',
          'Carry-Lookahead Adder (CLA): Eliminates ripple delay using Propagate P_i = A_i (+) B_i and Generate G_i = A_i · B_i.',
          'Multiplexer (2^n : 1): Data selector governed by n select lines; any n-variable function fits a 2^(n-1):1 MUX.',
          'Decoder (n : 2^n): Activates one minterm output line per input code; combined with OR gate realizes arbitrary Boolean functions.',
        ],
        formulasOrTables: [
          'Full Adder from 2 Half Adders + 1 OR gate',
          'CLA Next Carry: C_(i+1) = G_i + P_i · C_i',
          '4:1 MUX Equation: Y = S1\'S0\'I0 + S1\'S0I1 + S1S0\'I2 + S1S0I3',
        ],
        workedExample: {
          problem: 'Implement F(A,B,C) = Sum m(1, 3, 5, 6) using a 4:1 Multiplexer.',
          solutionSteps: [
            'Choose A, B as select lines S1, S0 and C as data input variable.',
            'List minterms per pair: I0 (AB=00 -> m0,m1): m1 active -> C.',
            'I1 (AB=01 -> m2,m3): m3 active -> C; I2 (AB=10 -> m4,m5): m5 active -> C; I3 (AB=11 -> m6,m7): m6 active -> C\'.',
            'Connect I0=C, I1=C, I2=C, I3=C\' to the 4:1 MUX.',
          ],
        },
      },
      {
        id: 'u2-n2',
        heading: '2.2 Latches, Flip-Flops & Excitation Tables',
        summary:
          'Sequential circuits add 1-bit memory elements (flip-flops) synchronized to clock edges so next state depends on inputs and current state Q(t).',
        keyPoints: [
          'SR Flip-Flop: S=1,R=1 is forbidden/indeterminate. JK Flip-Flop resolves S=R=1 by toggling Q(t+1) = Q\'(t).',
          'Race-Around Condition: Occurs in level-triggered JK when J=K=1 and clock pulse width > propagation delay; solved by edge-triggering or Master-Slave JK.',
          'D Flip-Flop (Delay/Data): Q(t+1) = D. T Flip-Flop (Toggle): Q(t+1) = T (+) Q(t).',
          'Flip-Flop Conversion uses excitation tables to express target FF inputs in terms of available FF inputs and Q(t).',
        ],
        formulasOrTables: [
          'Characteristic Equations: SR: Q+ = S + R\'Q (SR=0) | JK: Q+ = JQ\' + K\'Q | D: Q+ = D | T: Q+ = T (+) Q',
          'JK Excitation: 0->0 (0,X), 0->1 (1,X), 1->0 (X,1), 1->1 (X,0)',
        ],
      },
      {
        id: 'u2-n3',
        heading: '2.3 Shift Registers & Counters',
        summary:
          'Interconnected flip-flops store multi-bit words (registers) or step through deterministic binary sequences (counters).',
        keyPoints: [
          'Shift Registers: SISO, SIPO, PISO, PIPO; universal shift registers support hold, shift-left, shift-right, and parallel load.',
          'Asynchronous (Ripple) Counter: Clock feeds only LSB FF; subsequent FFs trigger from previous Q output -> cumulative propagation delay.',
          'Synchronous Counter: Common clock drives all FFs simultaneously; combinational logic determines next-state excitation.',
          'Mod-N Counter requires ceil(log2 N) flip-flops; Ring Counter (N states with N FFs), Johnson Counter (2N states with N FFs).',
        ],
        formulasOrTables: [
          'Max Clock Frequency (Ripple): f_max = 1 / (N · t_pd)',
          'Johnson Counter States = 2n (unused states = 2^n - 2n)',
        ],
      },
    ],
    importantTopics: [
      {
        id: 'u2-t1',
        title: 'Design of Synchronous Mod-6 / Mod-10 (BCD) Counter',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Design a synchronous Mod-6 counter (000 to 101) using JK flip-flops.',
        answerOutline: [
          'Determine number of FFs: 3 FFs (2^3 = 8 >= 6).',
          'Write present-to-next state transition table (states 0 to 5; 6 and 7 are don\'t-care X).',
          'Fill JK excitation columns (JA, KA, JB, KB, JC, KC) from JK excitation table.',
          'Minimize each input using 3-variable K-maps and draw the clocked logic diagram.',
        ],
      },
      {
        id: 'u2-t2',
        title: 'Race-Around Condition & Master-Slave JK Flip-Flop',
        examMarks: '8 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'What is the race-around condition in a JK flip-flop? Explain how a Master-Slave JK flip-flop eliminates it.',
        answerOutline: [
          'Define condition: J=K=1 with level-high clock pulse longer than gate delay causes multiple uncontrolled toggles.',
          'Draw Master-Slave block diagram (Master clocked by CLK, Slave clocked by inverted CLK).',
          'Trace operation: Master responds during positive level; Slave isolates output until falling edge transfers state.',
        ],
      },
      {
        id: 'u2-t3',
        title: 'Boolean Function Implementation Using Multiplexers & Decoders',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Implement a 4-variable Boolean function using an 8:1 MUX and a 3:8 Decoder with external gates.',
        answerOutline: [
          'For 8:1 MUX: assign 3 variables to select lines, derive 4th-variable input table (0, 1, D, D\').',
          'For 3:8 Decoder: connect active minterm outputs to an OR gate (or active-low outputs to NAND).',
        ],
      },
      {
        id: 'u2-t4',
        title: 'Carry-Lookahead Adder (CLA) Architecture',
        examMarks: '7 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Derive carry equations for a 4-bit Carry-Lookahead Adder and explain why it is faster than a Ripple-Carry Adder.',
        answerOutline: [
          'Define P_i = A_i (+) B_i and G_i = A_i · B_i.',
          'Expand C1, C2, C3, C4 purely in terms of C0, P, and G.',
          'Compare O(1) two-level gate delay against O(n) ripple delay.',
        ],
      },
      {
        id: 'u2-t5',
        title: 'Flip-Flop Conversions (SR to JK, D to T, JK to D)',
        examMarks: '5 Marks',
        priority: 'Conceptual',
        expectedQuestion: 'Convert a D flip-flop into a JK flip-flop.',
        answerOutline: [
          'Write truth table for target JK with inputs J, K, Q(t) and next state Q(t+1).',
          'Equate D = Q(t+1) and simplify via 3-variable K-map: D = J·Q\' + K\'·Q.',
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'u2-q1',
        question:
          'How many distinct states does a 4-bit Johnson (twisted ring) counter cycle through?',
        options: ['4 states', '8 states', '15 states', '16 states'],
        correctIndex: 1,
        explanation:
          'An n-bit Johnson counter feeds Q\' back to the first D input, producing 2n = 8 valid states.',
      },
      {
        id: 'u2-q2',
        question:
          'To build a Mod-12 synchronous counter, what is the minimum number of flip-flops needed?',
        options: ['3', '4', '6', '12'],
        correctIndex: 1,
        explanation:
          'Since 2^3 = 8 < 12 <= 2^4 = 16, at least 4 flip-flops are required.',
      },
    ],
  },
  {
    unitNumber: 3,
    title: 'Basic Computer Organization & Register Transfer',
    subtitle:
      'Von Neumann architecture, common bus system, RTL microoperations, instruction cycle, and addressing modes',
    estimatedHours: '4.5 hrs',
    notes: [
      {
        id: 'u3-n1',
        heading: '3.1 Common Bus System & Register Transfer Language (RTL)',
        summary:
          'RTL provides symbolic notation to describe microoperations transferring data between CPU registers over a shared bus.',
        keyPoints: [
          'Key CPU Registers: PC (Program Counter), AR/MAR (Address Register), DR/MDR (Data Register), AC (Accumulator), IR (Instruction Register), TR (Temporary).',
          'Common Bus System: Multiplexers or tri-state buffers connect N registers to a single k-bit bus using log2(N) selection lines (S2 S1 S0).',
          'RTL Conditional Transfer: P: R2 <- R1 (if control function P=1, transfer R1 to R2 on next clock edge).',
          '4-Category Microoperations: Register Transfer, Arithmetic (ADD, SUB, INC), Logic (AND, OR, XOR, Complement), Shift (Logical, Arithmetic, Circular).',
        ],
        formulasOrTables: [
          'Bus Selection: 8 registers -> 3 select lines (S2 S1 S0)',
          'Memory Read: AR <- PC; DR <- M[AR] | Memory Write: M[AR] <- DR',
          '2s Comp Subtraction Microoperation: R3 <- R1 + R2\' + 1',
        ],
      },
      {
        id: 'u3-n2',
        heading: '3.2 Stored-Program Cycle & Instruction Formats',
        summary:
          'Instructions and data share main memory (Von Neumann). Execution proceeds through Fetch, Decode, Indirect (optional), and Execute phases.',
        keyPoints: [
          'Fetch Phase: T0: AR <- PC; T1: IR <- M[AR], PC <- PC + 1; T2: Decode opcode IR(12-14), AR <- IR(0-11), I <- IR(15).',
          'Indirect Phase: If I=1 (indirect bit), T3: AR <- M[AR] to obtain effective address.',
          'Instruction Formats by Address Count: 3-address (shortest program, longest instruction), 2-address, 1-address (uses AC), 0-address (uses Stack / RPN).',
          'Interrupt Cycle: At end of instruction, if IEN=1 and FGI/FGO=1, save PC at M[0], branch PC <- 1.',
        ],
        formulasOrTables: [
          'Stack Push: SP <- SP + 1; M[SP] <- DR',
          'Stack Pop: DR <- M[SP]; SP <- SP - 1',
        ],
        workedExample: {
          problem:
            'Evaluate X = (A + B) * (C + D) using Zero-Address (Stack) instructions.',
          solutionSteps: [
            'PUSH A  (TOS = A)',
            'PUSH B  (TOS = B, below = A)',
            'ADD     (TOS = A + B)',
            'PUSH C ; PUSH D ; ADD  (TOS = C + D, below = A + B)',
            'MUL     (TOS = (A + B) * (C + D))',
            'POP X   (M[X] <- TOS)',
          ],
        },
      },
      {
        id: 'u3-n3',
        heading: '3.3 Addressing Modes',
        summary:
          'Addressing modes define how the operand\'s Effective Address (EA) is calculated from the instruction\'s address field.',
        keyPoints: [
          'Immediate: Operand value is inside the instruction itself (no memory lookup).',
          'Direct (Absolute): Address field holds the EA directly (EA = A).',
          'Indirect: Address field points to a memory cell holding the EA (EA = M[A]).',
          'Register & Register Indirect: Operand in register R, or EA = [R].',
          'PC-Relative: EA = PC + Displacement (position-independent code / branches).',
          'Indexed / Base-Register: EA = Index Register + Address field (array traversal).',
        ],
      },
    ],
    importantTopics: [
      {
        id: 'u3-t1',
        title: '16-Bit Common Bus System with Multiplexers & Tri-State Buffers',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Draw and explain the Basic Computer Common Bus System connecting AR, PC, DR, AC, IR, TR, and Memory.',
        answerOutline: [
          'Draw 7 registers + Memory feeding into 16-bit bus via S2 S1 S0 select lines (001=AR ... 111=M[AR]).',
          'Show LD (load), INR (increment), CLR (clear) control inputs on registers.',
          'Explain how a single clock cycle transfers data from one source register to one or more destination registers.',
        ],
      },
      {
        id: 'u3-t2',
        title: 'Addressing Modes & Effective Address Numericals',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Define 6 addressing modes and calculate the Effective Address and loaded AC value given PC=200, R1=400, XR=100, and memory table.',
        answerOutline: [
          'Tabulate Immediate, Direct, Indirect, Register Indirect, Relative (using updated PC!), and Indexed.',
          'Remember: During execution, PC has already incremented past the current instruction word.',
          'Show exact EA and final operand value step-by-step.',
        ],
      },
      {
        id: 'u3-t3',
        title: 'Instruction Cycle & Interrupt Cycle Flowchart',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Illustrate the Basic Computer Instruction Cycle with RTL statements for Fetch, Decode, Indirect, Execute, and Interrupt phases.',
        answerOutline: [
          'Draw flowchart checking R (interrupt flip-flop) before T0.',
          'Write T0, T1, T2 RTL microoperations for Fetch & Decode.',
          'Branch on D7 (Register/IO vs Memory-Reference) and I bit (Direct vs Indirect).',
        ],
      },
      {
        id: 'u3-t4',
        title: '0, 1, 2, and 3-Address Instruction Evaluation',
        examMarks: '6 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Write assembly programs to evaluate Y = (A - B) / (C + D * E) in 3-address, 2-address, 1-address, and 0-address formats.',
        answerOutline: [
          'Compare instruction length vs number of instructions executed.',
          'Demonstrate accumulator (LOAD, MUL, ADD, STORE) vs stack (PUSH, MUL, ADD, DIV, POP).',
        ],
      },
      {
        id: 'u3-t5',
        title: 'Arithmetic-Logic-Shift Unit (ALSU) Stage Design',
        examMarks: '5 Marks',
        priority: 'Conceptual',
        expectedQuestion:
          'Design one stage of an Arithmetic Logic Shift Unit (ALSU) controlled by S3 S2 S1 S0.',
        answerOutline: [
          'Show 1-bit Full Adder with B-input multiplexer (0, B, B\', 1) for arithmetic.',
          'Combine 4:1 logic MUX (AND, OR, XOR, NOT) and final 4:1 MUX selecting Arithmetic, Logic, Shift-Right, Shift-Left.',
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'u3-q1',
        question:
          'An instruction at memory address 300 (2 words long) uses PC-relative addressing with displacement +45. What is the Effective Address?',
        options: ['345', '346', '347', '302'],
        correctIndex: 2,
        explanation:
          'After fetching a 2-word instruction at 300, PC increments to 302. EA = PC + displacement = 302 + 45 = 347.',
      },
      {
        id: 'u3-q2',
        question:
          'Which register holds the actual binary instruction code currently being decoded?',
        options: ['PC', 'AR', 'IR', 'AC'],
        correctIndex: 2,
        explanation:
          'IR (Instruction Register) stores the fetched instruction word for the control unit decoder.',
      },
    ],
  },
  {
    unitNumber: 4,
    title: 'Computer Arithmetic, Control Unit & Pipelining',
    subtitle:
      'IEEE-754 floating point, Booths multiplication, division algorithms, hardwired vs microprogrammed control, and pipelining',
    estimatedHours: '5.5 hrs',
    notes: [
      {
        id: 'u4-n1',
        heading: '4.1 IEEE-754 Floating Point & Booth\'s Multiplication',
        summary:
          'Floating-point hardware handles wide dynamic ranges via sign, biased exponent, and normalized mantissa; Booth\'s algorithm multiplies signed 2s complement integers uniformly.',
        keyPoints: [
          'IEEE-754 Single Precision (32-bit): 1 Sign bit (S), 8 Exponent bits (Bias = 127), 23 Mantissa/Fraction bits (implicit leading 1).',
          'IEEE-754 Value: (-1)^S * (1.M)_2 * 2^(E - 127).',
          'Booth\'s Algorithm pairs current LSB Q0 and previous bit Q(-1): 00 or 11 -> Arithmetic Shift Right (ASR) only; 10 -> AC = AC - M, then ASR; 01 -> AC = AC + M, then ASR.',
          'Restoring vs Non-Restoring Division: Restoring adds divisor back if remainder < 0; Non-Restoring skips restoration and adds/subtracts on next step.',
        ],
        formulasOrTables: [
          'Booth Recoding: 00 -> no-op | 01 -> +M | 10 -> -M | 11 -> no-op (always followed by ASR)',
          'IEEE-754 Double (64-bit): 1 Sign, 11 Exponent (Bias 1023), 52 Mantissa',
        ],
        workedExample: {
          problem: 'Represent -13.625 in IEEE-754 Single-Precision (32-bit) format.',
          solutionSteps: [
            'Sign bit S = 1 (negative).',
            'Convert magnitude: 13 = 1101, 0.625 = .101 -> 1101.101_2.',
            'Normalize: 1.101101 * 2^3 -> Exponent e = 3, Mantissa M = 101101000...0 (23 bits).',
            'Biased Exponent E = 3 + 127 = 130 = 10000010_2.',
            '32-bit pattern: 1 10000010 10110100000000000000000 -> Hex = 0xC15A0000.',
          ],
        },
      },
      {
        id: 'u4-n2',
        heading: '4.2 Hardwired vs Microprogrammed Control Unit',
        summary:
          'The control unit generates timed control signals to execute instructions, implemented either via fixed combinational gates or a ROM-based control memory.',
        keyPoints: [
          'Hardwired Control: Uses decoders, sequence counters, and fixed logic gates; very fast (RISC), hard to modify.',
          'Microprogrammed Control: Control words (microinstructions) stored in Control Memory (ROM); easy to modify/debug (CISC), slightly slower due to ROM read.',
          'Horizontal Microinstruction: Wide control word, 1 bit per control signal -> high parallelism, minimal decoding, large memory.',
          'Vertical Microinstruction: Encoded fields decoded into control signals -> compact memory, slower decoding, less parallelism.',
        ],
        formulasOrTables: [
          'Microprogram Sequencer selects next CAR from: CAR + 1, Branch Address, Mapping ROM (from Opcode), or Subroutine Return Register.',
        ],
      },
      {
        id: 'u4-n3',
        heading: '4.3 Instruction Pipelining & Hazards',
        summary:
          'Pipelining overlaps Fetch, Decode, Execute, Memory, and Write-Back stages across multiple instructions to approach CPI = 1.',
        keyPoints: [
          'Ideal Speedup for k-stage pipeline executing n tasks: S = (n * k) / (k + n - 1); approaches k as n -> infinity.',
          'Structural Hazard: Hardware resource conflict (solved by separate I-cache and D-cache).',
          'Data Hazard (RAW, WAR, WAW): Solved by Operand Forwarding (Bypassing), pipeline stalls/bubbles, or compiler scheduling.',
          'Control Hazard (Branch): Solved by branch prediction, delayed branching, or branch target buffers.',
        ],
        formulasOrTables: [
          'Pipeline Clock Period: tau >= max(stage_delay) + latch_delay',
          'Throughput = n / [(k + n - 1) * tau]',
        ],
      },
    ],
    importantTopics: [
      {
        id: 'u4-t1',
        title: 'Booth\'s Signed Multiplication Algorithm (Step-by-Step Trace)',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Multiply (-7) * (+3) using 4-bit (or 5-bit) Booth\'s algorithm showing AC, Q, Q(-1), and SC at every step.',
        answerOutline: [
          'Verify bit width covers range (for -7, need 5 bits if signed range [-16, +15], or 4-bit [-8,+7]).',
          'Draw flowchart of Booth\'s algorithm and compute -M in 2s complement upfront.',
          'Trace table rows: Initial, then n cycles of (Check Q0Q(-1) -> Add/Sub -> ASR -> SC--).',
          'Verify final 2n-bit product in AC:Q.',
        ],
      },
      {
        id: 'u4-t2',
        title: 'Hardwired vs Microprogrammed Control Unit & Sequencer',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Compare Hardwired and Microprogrammed Control Units. Draw the block diagram of a Microprogram Sequencer.',
        answerOutline: [
          'Draw 6-point comparison table (Speed, Flexibility, Cost, Instruction Set RISC/CISC, Chip Area, Modification).',
          'Draw Microprogram Sequencer with CAR, Multiplexers, Incrementer, Subroutine Register (SBR), and Status/Condition MUX.',
          'Contrast Horizontal vs Vertical microinstructions.',
        ],
      },
      {
        id: 'u4-t3',
        title: 'IEEE-754 Single & Double Precision Conversion',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Convert decimal -27.375 to IEEE-754 32-bit hex representation and decode 0x42280000 back to decimal.',
        answerOutline: [
          'Show sign bit, binary fraction conversion, normalization to 1.M * 2^e, bias +127.',
          'For decoding: unpack 32 bits, subtract 127 from exponent, prepend implicit 1 to mantissa.',
        ],
      },
      {
        id: 'u4-t4',
        title: 'Pipeline Hazards & Speedup Numericals',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Explain Structural, Data (RAW/WAR/WAW), and Control hazards with mitigation techniques. Compute speedup of a 5-stage pipeline.',
        answerOutline: [
          'Draw 5-stage space-time diagram (IF, ID, EX, MEM, WB).',
          'Give concrete assembly examples for RAW dependency and show forwarding path.',
          'Apply S = (n * k * t_nonpipe) / [(k + n - 1) * tau].',
        ],
      },
      {
        id: 'u4-t5',
        title: 'Restoring & Non-Restoring Division Algorithm',
        examMarks: '6 Marks',
        priority: 'Conceptual',
        expectedQuestion:
          'Divide 11 by 3 using Restoring or Non-Restoring unsigned division algorithm.',
        answerOutline: [
          'Initialize A=0, Q=dividend, M=divisor, count=n.',
          'Shift left AQ, subtract M (or add M if A<0 in non-restoring), set Q0 based on sign of A.',
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'u4-q1',
        question:
          'In Booth\'s algorithm, if Q0 = 1 and Q(-1) = 0, what arithmetic operation is performed before shifting right?',
        options: ['AC <- AC + M', 'AC <- AC - M', 'No arithmetic operation', 'AC <- AC + 1'],
        correctIndex: 1,
        explanation:
          'Bit pair 10 marks the start of a string of 1s in the multiplier, so AC <- AC - M is executed prior to Arithmetic Shift Right.',
      },
      {
        id: 'u4-q2',
        question:
          'A non-pipelined processor takes 50 ns per instruction. A 5-stage pipeline has 10 ns stage delay plus 2 ns latch delay. What is the steady-state speedup?',
        options: ['5.0x', '4.17x', '3.50x', '6.0x'],
        correctIndex: 1,
        explanation:
          'Pipeline cycle tau = 10 + 2 = 12 ns. Steady-state speedup = 50 / 12 = 4.17x.',
      },
    ],
  },
  {
    unitNumber: 5,
    title: 'Memory Hierarchy & Input-Output Organization',
    subtitle:
      'SRAM/DRAM, cache mapping & hit ratio, virtual memory & TLB, I/O interfaces, interrupts, and DMA',
    estimatedHours: '5.0 hrs',
    notes: [
      {
        id: 'u5-n1',
        heading: '5.1 Memory Hierarchy, RAM Technologies & Cache Mapping',
        summary:
          'Memory hierarchy balances cost and speed by keeping active working sets in fast SRAM cache backed by larger DRAM main memory.',
        keyPoints: [
          'SRAM (6 transistors, flip-flop cell, no refresh, fast, used in Cache) vs DRAM (1 transistor + 1 capacitor, periodic refresh, dense, used in Main RAM).',
          'Locality of Reference: Temporal (recently accessed items reused soon) and Spatial (nearby addresses accessed soon).',
          'Direct Mapping: Block j maps to line (j mod M). Address = [Tag | Line Index | Block Offset]. Simple but high conflict misses.',
          'Fully Associative: Any block fits any line. Address = [Tag | Block Offset]. Zero conflict misses, expensive CAM tag search.',
          'K-Way Set Associative: Cache divided into S = Lines/K sets; block maps to set (j mod S). Address = [Tag | Set Index | Block Offset].',
        ],
        formulasOrTables: [
          'Effective Access Time (Simultaneous): T_avg = H * T_c + (1 - H) * (T_c + T_m) or T_avg = T_c + (1 - H) * T_m',
          'Write Policies: Write-Through (updates cache + RAM) vs Write-Back (updates cache + dirty bit, writes RAM on eviction).',
        ],
        workedExample: {
          problem:
            'A 64 MB main memory connects to a 32 KB 4-way set-associative cache with 64-byte blocks. Find Tag, Set, and Offset bits.',
          solutionSteps: [
            'Main Memory = 64 MB = 2^26 bytes -> Physical Address = 26 bits.',
            'Block size = 64 B = 2^6 -> Block Offset = 6 bits.',
            'Total Cache Lines = 32 KB / 64 B = 512 lines.',
            'Number of Sets (4-way) = 512 / 4 = 128 = 2^7 -> Set Index = 7 bits.',
            'Tag bits = 26 - 7 - 6 = 13 bits.',
          ],
        },
      },
      {
        id: 'u5-n2',
        heading: '5.2 Virtual Memory, Paging & TLB',
        summary:
          'Virtual memory gives each process a private contiguous address space mapped dynamically onto physical RAM frames using Page Tables and a TLB.',
        keyPoints: [
          'Virtual Address splits into [Virtual Page Number (VPN) | Page Offset]; Page Offset equals Frame Offset.',
          'Translation Lookaside Buffer (TLB): Small hardware associative cache storing recent VPN -> PFN translations to avoid double memory lookups.',
          'Page Fault: Occurs when valid bit = 0 in page table; OS traps, fetches page from disk, updates page table (using LRU/FIFO if RAM full), and restarts instruction.',
        ],
        formulasOrTables: [
          'EAT with TLB: T_eff = alpha*(T_tlb + T_mem) + (1 - alpha)*(T_tlb + 2*T_mem)',
        ],
      },
      {
        id: 'u5-n3',
        heading: '5.3 I/O Organization, Interrupts & DMA',
        summary:
          'I/O interfaces bridge slow asynchronous peripherals with the fast CPU via programmed polling, interrupts, or Direct Memory Access (DMA).',
        keyPoints: [
          'Memory-Mapped I/O (single address space, standard load/store) vs Isolated I/O (separate I/O space with IN/OUT instructions).',
          'Asynchronous Transfer: Strobe control (single pulse) vs Handshaking (Req/Ack two-wire confirmation).',
          'Programmed I/O wastes CPU cycles polling status flags; Interrupt-Driven I/O signals CPU only when ready.',
          'DMA (Direct Memory Access): DMA controller takes bus mastery (BR/BG) to transfer blocks directly between I/O and RAM in Burst Mode or Cycle Stealing.',
        ],
      },
    ],
    importantTopics: [
      {
        id: 'u5-t1',
        title: 'Cache Mapping Techniques & Address Bit-Split Numericals',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Compare Direct, Associative, and Set-Associative cache mapping. Calculate Tag, Index, and Offset bits for a 2-way set-associative cache.',
        answerOutline: [
          'Draw address division diagrams for all 3 mapping schemes.',
          'Show step-by-step bit calculation: Address = log2(Mem), Offset = log2(Block), Sets = Lines/K, Tag = Addr - Index - Offset.',
          'Compute Effective Access Time from Hit Ratio H, T_cache, and T_main.',
        ],
      },
      {
        id: 'u5-t2',
        title: 'DMA Controller Architecture & Transfer Modes',
        examMarks: '10 Marks',
        priority: 'Must Revise',
        expectedQuestion:
          'Draw the block diagram of a DMA Controller and explain Burst Mode vs Cycle Stealing.',
        answerOutline: [
          'Show DMA registers: Address Register, Word Count Register, Control/Status Register.',
          'Trace Bus Request (BR) -> Bus Grant (BG) -> DMA Read/Write -> Interrupt on WC=0.',
          'Contrast Burst Mode (entire block transferred while CPU waits) vs Cycle Stealing (1 word per stolen bus cycle).',
        ],
      },
      {
        id: 'u5-t3',
        title: 'Virtual Memory Address Translation & TLB Hit Ratio',
        examMarks: '8 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Explain virtual-to-physical address translation using a Page Table and TLB. Compute effective memory access time for 95% TLB hit rate.',
        answerOutline: [
          'Draw VPN -> TLB lookup -> Hit (PFN + Offset) vs Miss (Page Table in RAM).',
          'Mention page fault handling and LRU replacement.',
          'Compute EAT accurately using alpha * (T_tlb + T_m) + (1 - alpha) * (T_tlb + 2*T_m).',
        ],
      },
      {
        id: 'u5-t4',
        title: 'Priority Interrupts (Daisy Chaining & Polling)',
        examMarks: '6 Marks',
        priority: 'High Yield',
        expectedQuestion:
          'Explain Daisy-Chain Priority Interrupt hardware with PI/PO signals and vector address (VAD).',
        answerOutline: [
          'Draw devices ordered highest-to-lowest priority along shared INT line.',
          'Trace INTA propagation: if device requests, it blocks PO=0 and places VAD on data bus.',
        ],
      },
      {
        id: 'u5-t5',
        title: 'Asynchronous Data Transfer (Strobe vs Handshaking)',
        examMarks: '5 Marks',
        priority: 'Conceptual',
        expectedQuestion:
          'Draw timing diagrams for Source-Initiated and Destination-Initiated Handshaking.',
        answerOutline: [
          'Explain why single strobe fails if receiver is slower than sender.',
          'Show 4-step Data Valid <-> Data Accepted handshaking sequence.',
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'u5-q1',
        question:
          'A cache has 10 ns access time, main memory has 100 ns access time, and hit ratio is 0.90 (sequential lookup). What is the Effective Access Time?',
        options: ['19 ns', '20 ns', '25 ns', '100 ns'],
        correctIndex: 1,
        explanation:
          'Sequential lookup: EAT = T_c + (1 - H) * T_m = 10 + (0.10 * 100) = 20 ns.',
      },
      {
        id: 'u5-q2',
        question:
          'Which DMA mode transfers one word at a time whenever the CPU does not need the system bus for a clock cycle?',
        options: ['Burst Mode', 'Cycle Stealing', 'Programmed Polling', 'Daisy Chaining'],
        correctIndex: 1,
        explanation:
          'Cycle Stealing allows the DMA controller to steal individual memory cycles without halting the CPU for an entire block.',
      },
    ],
  },
];
