import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/cms';
import {
  buildCatalogSystemInstruction,
  buildFallbackChatReply,
  normalizeChatMessages,
  type ChatAvailability,
  type ChatIntent,
  type ChatProductMatch,
  type ChatReplyPayload,
} from '@/lib/chatbot';
import type { ProductData } from '@/lib/data';

export const runtime = 'nodejs';

const GEMINI_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

const CHAT_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    intent: {
      type: 'string',
      enum: [
        'product_search',
        'quote',
        'meeting',
        'contact',
        'support',
        'company',
        'greeting',
        'general',
      ],
    },
    availability: {
      type: 'string',
      enum: ['available', 'needs_clarification', 'not_listed'],
    },
    matchedProductSlugs: {
      type: 'array',
      items: { type: 'string' },
    },
    quickReplies: {
      type: 'array',
      items: { type: 'string' },
    },
    machineInterest: { type: 'string' },
    askForMachineDetails: { type: 'boolean' },
    allowLeadCapture: { type: 'boolean' },
    allowMeetingCapture: { type: 'boolean' },
  },
  required: [
    'reply',
    'intent',
    'availability',
    'matchedProductSlugs',
    'quickReplies',
    'machineInterest',
    'askForMachineDetails',
    'allowLeadCapture',
    'allowMeetingCapture',
  ],
} as const;

const intentValues = new Set<ChatIntent>([
  'product_search',
  'quote',
  'meeting',
  'contact',
  'support',
  'company',
  'greeting',
  'general',
]);

const availabilityValues = new Set<ChatAvailability>([
  'available',
  'needs_clarification',
  'not_listed',
]);

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!GEMINI_API_KEY) {
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  return aiClient;
};

const uniqueMatches = (matches: ChatProductMatch[]) => {
  const bySlug = new Map<string, ChatProductMatch>();

  matches.forEach((match) => {
    if (!bySlug.has(match.slug)) {
      bySlug.set(match.slug, match);
    }
  });

  return Array.from(bySlug.values()).slice(0, 3);
};

const parseStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];

const toMatchedProductsFromSlugs = (
  slugs: string[],
  products: ProductData[],
) => {
  const productMap = new Map(products.map((product) => [product.slug, product]));

  return uniqueMatches(
    slugs
      .map((slug) => productMap.get(slug))
      .filter((product): product is ProductData => Boolean(product))
      .map((product) => ({
        slug: product.slug,
        title: product.title,
        category: product.category,
        shortDesc: product.shortDesc,
        href: `/products/${product.slug}`,
        image: product.image,
        imageAlt: product.imageAlt,
      })),
  );
};

const sanitizeGeminiReply = (
  rawValue: unknown,
  fallback: ChatReplyPayload,
  products: ProductData[],
  localMatches: ChatProductMatch[],
) => {
  if (typeof rawValue !== 'object' || rawValue === null) {
    return fallback;
  }

  const raw = rawValue as Record<string, unknown>;
  const reply = typeof raw.reply === 'string' && raw.reply.trim() ? raw.reply.trim() : fallback.reply;
  const intent =
    typeof raw.intent === 'string' && intentValues.has(raw.intent as ChatIntent)
      ? (raw.intent as ChatIntent)
      : fallback.intent;
  const availability =
    typeof raw.availability === 'string' &&
    availabilityValues.has(raw.availability as ChatAvailability)
      ? (raw.availability as ChatAvailability)
      : fallback.availability;
  const quickReplies = parseStringArray(raw.quickReplies).slice(0, 4);
  const matchedProducts = uniqueMatches([
    ...toMatchedProductsFromSlugs(parseStringArray(raw.matchedProductSlugs), products),
    ...localMatches,
  ]);
  const machineInterest =
    typeof raw.machineInterest === 'string' && raw.machineInterest.trim()
      ? raw.machineInterest.trim()
      : fallback.machineInterest;

  return {
    reply,
    source: 'gemini' as const,
    intent,
    availability:
      matchedProducts.length === 0 && availability === 'available'
        ? 'needs_clarification'
        : availability,
    matchedProducts:
      matchedProducts.length > 0 || fallback.matchedProducts.length === 0
        ? matchedProducts
        : fallback.matchedProducts,
    quickReplies: quickReplies.length > 0 ? quickReplies : fallback.quickReplies,
    machineInterest,
    askForMachineDetails:
      typeof raw.askForMachineDetails === 'boolean'
        ? raw.askForMachineDetails
        : fallback.askForMachineDetails,
    allowLeadCapture:
      typeof raw.allowLeadCapture === 'boolean'
        ? raw.allowLeadCapture || matchedProducts.length > 0
        : fallback.allowLeadCapture || matchedProducts.length > 0,
    allowMeetingCapture:
      typeof raw.allowMeetingCapture === 'boolean'
        ? raw.allowMeetingCapture
        : fallback.allowMeetingCapture,
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = normalizeChatMessages(body?.messages);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'messages are required' }, { status: 400 });
    }

    const products = (await listProducts({ publishedOnly: true })) as ProductData[];
    const fallbackReply = buildFallbackChatReply(messages, products);
    const localMatches = fallbackReply.matchedProducts.slice(0, 4);
    const ai = getAiClient();

    if (!ai) {
      return NextResponse.json(fallbackReply);
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.text }],
        })),
        config: {
          temperature: 0.35,
          responseMimeType: 'application/json',
          responseJsonSchema: CHAT_RESPONSE_SCHEMA,
          systemInstruction: buildCatalogSystemInstruction(products, localMatches),
        },
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        return NextResponse.json(fallbackReply);
      }

      const parsed = JSON.parse(rawText) as unknown;
      const sanitized = sanitizeGeminiReply(
        parsed,
        fallbackReply,
        products,
        localMatches,
      );

      return NextResponse.json(sanitized);
    } catch (geminiError) {
      console.error('Gemini chat fallback triggered:', geminiError);
      return NextResponse.json(fallbackReply);
    }
  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
