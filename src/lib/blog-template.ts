export type BlogTemplateContent = {
  body: string;
  leftImage: string;
  leftImageAlt: string;
  rightImage: string;
  rightImageAlt: string;
};

const emptyTemplateContent: BlogTemplateContent = {
  body: '',
  leftImage: '',
  leftImageAlt: '',
  rightImage: '',
  rightImageAlt: '',
};

const looksLikeJson = (value: string) =>
  (value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'));

const readString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeImagePath = (value: string) => {
  const image = value.trim();

  if (!image) {
    return '';
  }

  if (
    image.startsWith('/') ||
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image;
  }

  if (image.startsWith('public/')) {
    return `/${image.slice('public/'.length)}`;
  }

  return `/${image.replace(/^\.?\//, '')}`;
};

export function parseBlogTemplateContent(rawContent: string) {
  const content = rawContent.trim();

  if (!content) {
    return emptyTemplateContent;
  }

  if (!looksLikeJson(content)) {
    return {
      ...emptyTemplateContent,
      body: content,
    };
  }

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      body: readString(parsed.body || parsed.content),
      leftImage: normalizeImagePath(readString(parsed.leftImage)),
      leftImageAlt: readString(parsed.leftImageAlt),
      rightImage: normalizeImagePath(readString(parsed.rightImage)),
      rightImageAlt: readString(parsed.rightImageAlt),
    };
  } catch {
    return {
      ...emptyTemplateContent,
      body: content,
    };
  }
}

export function serializeBlogTemplateContent(input: Partial<BlogTemplateContent>) {
  const body = readString(input.body);
  const leftImage = normalizeImagePath(readString(input.leftImage));
  const leftImageAlt = readString(input.leftImageAlt);
  const rightImage = normalizeImagePath(readString(input.rightImage));
  const rightImageAlt = readString(input.rightImageAlt);

  if (!leftImage && !leftImageAlt && !rightImage && !rightImageAlt) {
    return body;
  }

  return JSON.stringify({
    body,
    leftImage,
    leftImageAlt,
    rightImage,
    rightImageAlt,
  });
}
