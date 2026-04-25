import { COMPANY_INFO, FAQS, type ProductData } from './data';

export type ChatMessageRole = 'user' | 'assistant';

export type ChatIntent =
  | 'product_search'
  | 'quote'
  | 'meeting'
  | 'contact'
  | 'support'
  | 'company'
  | 'greeting'
  | 'general';

export type ChatAvailability = 'available' | 'needs_clarification' | 'not_listed';

export interface ChatMessageInput {
  role: ChatMessageRole;
  text: string;
}

export interface ChatProductMatch {
  slug: string;
  title: string;
  category: string;
  shortDesc: string;
  href: string;
  image: string;
  imageAlt: string;
}

export interface ChatReplyPayload {
  reply: string;
  source: 'gemini' | 'fallback';
  intent: ChatIntent;
  availability: ChatAvailability;
  matchedProducts: ChatProductMatch[];
  quickReplies: string[];
  machineInterest: string;
  askForMachineDetails: boolean;
  allowLeadCapture: boolean;
  allowMeetingCapture: boolean;
}

type CategoryAlias = {
  categories: string[];
  keywords: string[];
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'also',
  'available',
  'batana',
  'bataye',
  'chahiye',
  'chaiye',
  'could',
  'demo',
  'details',
  'for',
  'from',
  'get',
  'hai',
  'help',
  'hey',
  'hi',
  'hello',
  'i',
  'in',
  'is',
  'ka',
  'ke',
  'ki',
  'kya',
  'line',
  'machine',
  'machines',
  'mujhe',
  'need',
  'of',
  'our',
  'please',
  'price',
  'quotation',
  'quote',
  'required',
  'show',
  'site',
  'tell',
  'the',
  'to',
  'want',
  'with',
  'your',
]);

const CATEGORY_ALIASES: CategoryAlias[] = [
  {
    categories: ['Sealing Machines'],
    keywords: [
      'band sealer',
      'sealer',
      'seal',
      'sealing',
      'pouch sealing',
      'bag sealing',
      'tube sealing',
      'impulse sealing',
    ],
  },
  {
    categories: ['Shrink Wrapping Machines'],
    keywords: [
      'shrink',
      'shrink wrap',
      'shrink wrapping',
      'web sealer',
      'l sealer',
      'atta packing',
      'atta pouch',
      'bottle wrapping',
      'box wrapping',
      'sleeve wrap',
    ],
  },
  {
    categories: ['Vacuum Packaging Machines'],
    keywords: ['vacuum', 'vacuum packing', 'vacuum packaging', 'shelf life'],
  },
  {
    categories: ['Conveyor Systems'],
    keywords: ['conveyor', 'belt conveyor', 'roller conveyor', 'transfer line'],
  },
  {
    categories: ['Pallet Stretch Wrapping Machines', 'End-of-Line Packaging'],
    keywords: ['pallet', 'stretch wrap', 'stretch wrapping', 'dispatch load'],
  },
];

const QUICK_REPLY_DEFAULTS = [
  'I need a pouch sealing machine',
  'Show shrink wrapping options',
  'Schedule a meeting',
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toTokens = (value: string) =>
  Array.from(
    new Set(
      normalizeText(value)
        .split(' ')
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
    ),
  );

const toProductMatch = (product: ProductData): ChatProductMatch => ({
  slug: product.slug,
  title: product.title,
  category: product.category,
  shortDesc: product.shortDesc,
  href: `/products/${product.slug}`,
  image: product.image,
  imageAlt: product.imageAlt,
});

const uniqueStrings = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

const getLatestUserMessage = (messages: ChatMessageInput[]) =>
  [...messages].reverse().find((message) => message.role === 'user')?.text.trim() || '';

const getRecentUserContext = (messages: ChatMessageInput[]) =>
  messages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => message.text.trim())
    .filter(Boolean)
    .join(' ');

const getFormattedProductTitles = (matches: ChatProductMatch[]) => {
  if (matches.length === 0) return '';
  if (matches.length === 1) return matches[0].title;
  if (matches.length === 2) return `${matches[0].title} and ${matches[1].title}`;
  return `${matches.slice(0, -1).map((match) => match.title).join(', ')}, and ${matches[matches.length - 1].title}`;
};

const getMatchedCategoryBoosts = (query: string) => {
  const normalizedQuery = normalizeText(query);
  return CATEGORY_ALIASES.reduce<Record<string, number>>((acc, alias) => {
    if (alias.keywords.some((keyword) => normalizedQuery.includes(keyword))) {
      alias.categories.forEach((category) => {
        acc[category] = (acc[category] || 0) + 10;
      });
    }
    return acc;
  }, {});
};

const getFaqAnswer = (query: string) => {
  const normalizedQuery = normalizeText(query);

  for (const faq of FAQS) {
    const faqTokens = toTokens(faq.q);
    const matchCount = faqTokens.filter((token) => normalizedQuery.includes(token)).length;

    if (matchCount >= 2) {
      return faq.a;
    }
  }

  return '';
};

export const normalizeChatMessages = (value: unknown): ChatMessageInput[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      const role =
        item.role === 'assistant' || item.role === 'user'
          ? item.role
          : null;
      const text = typeof item.text === 'string' ? item.text.trim() : '';

      if (!role || !text) {
        return null;
      }

      return { role, text } satisfies ChatMessageInput;
    })
    .filter((item): item is ChatMessageInput => Boolean(item))
    .slice(-12);
};

export const findProductMatches = (
  query: string,
  products: ProductData[],
  limit = 3,
) => {
  const normalizedQuery = normalizeText(query);
  const queryTokens = toTokens(query);
  const categoryBoosts = getMatchedCategoryBoosts(query);

  if (!normalizedQuery) {
    return [] as ChatProductMatch[];
  }

  const scoredProducts = products
    .map((product) => {
      const title = normalizeText(product.title);
      const slug = normalizeText(product.slug.replace(/-/g, ' '));
      const modelNo = normalizeText(product.modelNo);
      const category = normalizeText(product.category);
      const shortDesc = normalizeText(product.shortDesc);
      const description = normalizeText(product.description);
      const features = normalizeText(product.features.join(' '));
      const specs = normalizeText(
        Object.entries(product.specs)
          .map(([key, value]) => `${key} ${value}`)
          .join(' '),
      );

      let score = categoryBoosts[product.category] || 0;

      if (normalizedQuery.length > 4) {
        if (title.includes(normalizedQuery)) score += 24;
        if (slug.includes(normalizedQuery)) score += 20;
        if (category.includes(normalizedQuery)) score += 16;
        if (shortDesc.includes(normalizedQuery)) score += 10;
        if (description.includes(normalizedQuery)) score += 8;
      }

      queryTokens.forEach((token) => {
        if (title.includes(token)) score += 8;
        if (slug.includes(token)) score += 7;
        if (modelNo.includes(token)) score += 8;
        if (category.includes(token)) score += 5;
        if (shortDesc.includes(token)) score += 4;
        if (description.includes(token)) score += 3;
        if (features.includes(token)) score += 3;
        if (specs.includes(token)) score += 2;
      });

      return {
        score,
        product,
      };
    })
    .filter((entry) => entry.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => toProductMatch(entry.product));

  return scoredProducts;
};

export const inferChatIntent = (
  query: string,
  matches: ChatProductMatch[],
): ChatIntent => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return 'general';

  if (
    /\b(meeting|demo|appointment|schedule|factory visit|site visit|video call|video demo)\b/.test(
      normalizedQuery,
    )
  ) {
    return 'meeting';
  }

  if (
    /\b(price|pricing|cost|quote|quotation|budget|rate)\b/.test(normalizedQuery)
  ) {
    return 'quote';
  }

  if (
    /\b(contact|call|phone|email|reach|whatsapp)\b/.test(normalizedQuery)
  ) {
    return 'contact';
  }

  if (
    /\b(service|support|repair|maintenance|amc|spare|spares)\b/.test(
      normalizedQuery,
    )
  ) {
    return 'support';
  }

  if (
    /\b(company|about|who are you|spectra pack|manufacturer|factory)\b/.test(
      normalizedQuery,
    )
  ) {
    return 'company';
  }

  if (
    /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(
      normalizedQuery,
    )
  ) {
    return 'greeting';
  }

  if (
    matches.length > 0 ||
    /\b(machine|packaging|pack|pouch|carton|box|bottle|sealer|shrink|vacuum|conveyor|pallet|line)\b/.test(
      normalizedQuery,
    )
  ) {
    return 'product_search';
  }

  return 'general';
};

const buildQuickReplies = (
  intent: ChatIntent,
  matches: ChatProductMatch[],
  availability: ChatAvailability,
  askForMachineDetails: boolean,
) => {
  const replies: string[] = [];

  if (askForMachineDetails) {
    replies.push(
      'I need a pouch sealing machine',
      'I need shrink wrapping for bottles',
      'I need a conveyor system',
      'Schedule a meeting',
    );
  }

  if (matches.length > 0) {
    replies.push(
      `I need a quote for ${matches[0].title}`,
      `Show more ${matches[0].category}`,
      'Schedule a meeting',
    );
  }

  if (intent === 'meeting') {
    replies.push(
      'I want a factory visit',
      'I want a video demo',
      'Schedule a meeting',
    );
  }

  if (intent === 'contact') {
    replies.push('Schedule a meeting', 'Show sealing machines');
  }

  if (availability === 'not_listed') {
    replies.push(
      'I need secondary packaging',
      'I need a pouch sealing machine',
      'Schedule a meeting',
    );
  }

  if (replies.length === 0) {
    replies.push(...QUICK_REPLY_DEFAULTS);
  }

  return uniqueStrings(replies).slice(0, 4);
};

export const buildCatalogSystemInstruction = (
  products: ProductData[],
  matches: ChatProductMatch[],
) => {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const catalogSummary = categories
    .map((category) => {
      const titles = products
        .filter((product) => product.category === category)
        .slice(0, 8)
        .map((product) => product.title)
        .join(', ');
      return `- ${category}: ${titles}`;
    })
    .join('\n');

  const relevantEntries =
    matches.length > 0
      ? matches
          .map(
            (match) =>
              `- ${match.title} | ${match.category} | ${match.shortDesc} | URL: ${COMPANY_INFO.website}${match.href}`,
          )
          .join('\n')
      : '- No exact catalog match yet. Ask a clarifying question before recommending a machine.';

  const faqSummary = FAQS.slice(0, 5)
    .map((faq) => `- Q: ${faq.q}\n  A: ${faq.a}`)
    .join('\n');

  return `You are the sales chatbot for Spectra Pack Machines.

Rules:
- Use only the provided catalog data to confirm machine availability.
- If the buyer asks for a machine and no exact match exists, do not invent a machine. Ask what product, pack style, and expected output they need.
- If the buyer shows purchase intent, mention that they can share their enquiry details in chat and can also schedule a meeting in chat.
- Keep replies concise, practical, and sales-focused.
- Match the user's language. Simple professional Hinglish is acceptable when the user mixes Hindi and English.
- Do not use markdown links. Product cards and actions are rendered separately by the site.

Company contact:
- Phone: ${COMPANY_INFO.phone[0]}
- Email: ${COMPANY_INFO.email[1]}
- Website: ${COMPANY_INFO.website}

Catalog categories:
${catalogSummary}

Relevant catalog entries for this conversation:
${relevantEntries}

FAQ guidance:
${faqSummary}`;
};

export const buildFallbackChatReply = (
  messages: ChatMessageInput[],
  products: ProductData[],
): ChatReplyPayload => {
  const latestUserMessage = getLatestUserMessage(messages);
  const recentContext = getRecentUserContext(messages);
  const lookupText = recentContext || latestUserMessage;
  const matches = findProductMatches(lookupText, products);
  const intent = inferChatIntent(lookupText, matches);
  const faqAnswer = getFaqAnswer(lookupText);
  const lowerText = normalizeText(lookupText);

  let reply = '';
  let availability: ChatAvailability = matches.length > 0 ? 'available' : 'needs_clarification';
  let askForMachineDetails = false;
  let allowLeadCapture = false;
  let allowMeetingCapture = false;
  const machineInterest =
    matches.length > 0 ? getFormattedProductTitles(matches) : latestUserMessage;

  if (/\b(fill|filling|liquid filler|filler)\b/.test(lowerText)) {
    reply =
      'The current website catalog mainly lists wrapping, sealing, vacuum packaging, conveyor, and pallet handling machines. I do not see a filling machine listed in the live catalog right now. If you share your product, pack size, and output requirement, I can still register the enquiry for the sales team or schedule a meeting in chat.';
    availability = 'not_listed';
    allowLeadCapture = true;
    allowMeetingCapture = true;
  } else if (intent === 'meeting') {
    reply =
      'Yes, you can schedule a meeting right here in chat. Share your preferred date and time, and I can log it for the sales team. If you already know the machine or application, mention that as well so the team can prepare.';
    allowMeetingCapture = true;
  } else if (intent === 'contact') {
    reply = `You can reach Spectra Pack Machines on ${COMPANY_INFO.phone[0]} or ${COMPANY_INFO.email[0]}. If you prefer, I can also capture your enquiry details here in chat and schedule a meeting for you.`;
    allowLeadCapture = true;
    allowMeetingCapture = true;
  } else if (intent === 'support') {
    reply =
      'We support machine selection, installation, commissioning, after-sales coordination, and spare-part assistance. If you tell me the machine family or issue, I can guide you further or register a support enquiry for the team.';
    allowLeadCapture = true;
  } else if (intent === 'company') {
    reply =
      'Spectra Pack Machines is a packaging machine manufacturer based in the Mumbai region, operating from Royal I.T. Industrial Estate, Vasai East, Palghar. The catalog covers shrink wrapping, sealing, vacuum packaging, conveyor systems, and end-of-line packaging solutions.';
  } else if (intent === 'greeting') {
    reply =
      'Hi, I am the Spectra Pack sales assistant. Tell me what product you want to pack, and I will check the site catalog for the closest machine. I can also capture your enquiry or schedule a meeting here in chat.';
  } else if (faqAnswer) {
    reply = faqAnswer;
  } else if (matches.length > 0) {
    reply = `Yes, ${getFormattedProductTitles(matches)} ${matches.length === 1 ? 'is' : 'are'} available in the website catalog. ${matches[0].shortDesc} If you want, I can take your name, email, phone, company, and requirement here in chat, or I can schedule a meeting with the sales team.`;
    allowLeadCapture = true;
    allowMeetingCapture = true;
  } else if (intent === 'quote') {
    reply =
      'I can help with that. Tell me the machine type or the product you want to pack, and I will check the closest option from the website catalog. After that, you can share your name, email, phone, and company here in chat for a quote request.';
    askForMachineDetails = true;
    allowLeadCapture = true;
    allowMeetingCapture = true;
  } else if (intent === 'product_search') {
    reply =
      'Sure. Which product or pack type do you need to handle: pouch, bottle, carton, box, pallet, vacuum pouch, or conveyor transfer? If you know the expected output per minute, share that too and I will check what is available on the site.';
    askForMachineDetails = true;
  } else {
    reply = `I can help you find the right packaging machine from the Spectra Pack catalog. Tell me what product you want to pack, or ask for a quote, meeting, or machine recommendation. You can also reach the team on ${COMPANY_INFO.phone[0]}.`;
  }

  return {
    reply,
    source: 'fallback',
    intent,
    availability,
    matchedProducts: matches,
    quickReplies: buildQuickReplies(
      intent,
      matches,
      availability,
      askForMachineDetails,
    ),
    machineInterest,
    askForMachineDetails,
    allowLeadCapture,
    allowMeetingCapture,
  };
};
