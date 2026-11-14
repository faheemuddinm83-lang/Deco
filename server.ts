import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface IncomingStudyFile {
  name: string;
  mimeType: string;
  textContent?: string;
  base64Data?: string;
}

const decoUnitsSchema = {
  type: Type.ARRAY,
  description: 'Exactly 5 structured UG DECO exam units.',
  items: {
    type: Type.OBJECT,
    properties: {
      unitNumber: {
        type: Type.INTEGER,
        description: 'Unit number from 1 to 5.',
      },
      title: {
        type: Type.STRING,
        description: 'Concise unit title.',
      },
      subtitle: {
        type: Type.STRING,
        description: 'One-sentence summary of topics covered in this unit.',
      },
      estimatedHours: {
        type: Type.STRING,
        description: 'Estimated revision time, e.g., "4.5 hrs".',
      },
      notes: {
        type: Type.ARRAY,
        description: 'Detailed structured exam notes for this unit.',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            heading: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulasOrTables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            workedExample: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solutionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['problem', 'solutionSteps'],
            },
          },
          required: ['id', 'heading', 'summary', 'keyPoints'],
        },
      },
      importantTopics: {
        type: Type.ARRAY,
        description:
          'Separate high-yield important exam topics for this unit (separated from unit notes).',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            examMarks: { type: Type.STRING },
            priority: {
              type: Type.STRING,
              description: 'One of: Must Revise, High Yield, Conceptual',
            },
            expectedQuestion: { type: Type.STRING },
            answerOutline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'id',
            'title',
            'examMarks',
            'priority',
            'expectedQuestion',
            'answerOutline',
          ],
        },
      },
      practiceQuestions: {
        type: Type.ARRAY,
        description: '2 quick multiple-choice exam check questions for this unit.',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: [
            'id',
            'question',
            'options',
            'correctIndex',
            'explanation',
          ],
        },
      },
    },
    required: [
      'unitNumber',
      'title',
      'subtitle',
      'estimatedHours',
      'notes',
      'importantTopics',
      'practiceQuestions',
    ],
  },
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment secrets.',
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/deco/synthesize', async (req: Request, res: Response) => {
    try {
      const {
        folderName,
        files,
        syllabusText,
        focusExamPattern,
      } = req.body as {
        folderName?: string;
        files?: IncomingStudyFile[];
        syllabusText?: string;
        focusExamPattern?: string;
      };

      const hasFiles = Array.isArray(files) && files.length > 0;
      const hasText =
        typeof syllabusText === 'string' && syllabusText.trim().length > 0;

      if (!hasFiles && !hasText) {
        res.status(400).json({
          error:
            'Provide at least one Google Drive file or pasted syllabus/note text to synthesize.',
        });
        return;
      }

      const ai = getGeminiClient();

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      const instruction = [
        `You are preparing exam-focused undergraduate Digital Electronics & Computer Organization (DECO) study material.`,
        `Source folder/context: ${folderName || 'UG DECO Study Materials'}.`,
        focusExamPattern
          ? `Student exam focus: ${focusExamPattern}`
          : '',
        `Create EXACTLY 5 Units (unitNumber 1 through 5) based strictly on the uploaded/pasted materials when provided, filling any standard UG DECO gaps clearly.`,
        `CRITICAL STRUCTURE: For EVERY unit, separate "notes" (comprehensive unit concepts, formulas, worked examples) from "importantTopics" (separate high-yield exam questions, marks weightage, and answer outlines).`,
        `Include 2-3 detailed note sections, 4-5 separate important topics, and 2 multiple-choice practice questions per unit.`,
        `Use unique IDs like "u1-n1", "u1-t1", "u1-q1". Set priority strictly to "Must Revise", "High Yield", or "Conceptual".`,
      ]
        .filter(Boolean)
        .join('\n');

      parts.push({ text: instruction });

      if (hasText && syllabusText) {
        parts.push({
          text: `\n--- PASTED SYLLABUS / NOTES ---\n${syllabusText.slice(0, 80000)}`,
        });
      }

      if (hasFiles && files) {
        for (const file of files.slice(0, 8)) {
          if (file.textContent) {
            parts.push({
              text: `\n--- DRIVE FILE: ${file.name} ---\n${file.textContent.slice(0, 50000)}`,
            });
          } else if (file.base64Data && file.mimeType) {
            parts.push({
              text: `\n--- ATTACHED FILE: ${file.name} ---`,
            });
            parts.push({
              inlineData: {
                mimeType: file.mimeType,
                data: file.base64Data,
              },
            });
          }
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction:
            'You are a rigorous undergraduate Computer Engineering professor creating clean, accurate, line-separable 5-unit DECO exam notes and separate important topics.',
          responseMimeType: 'application/json',
          responseSchema: decoUnitsSchema,
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        res.status(502).json({
          error: 'Synthesis returned an empty unit structure. Please try again.',
        });
        return;
      }

      res.json({ units: parsed });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Unknown synthesis error';
      console.error('Gemini synthesis error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DECO Exam Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
