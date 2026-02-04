// Content hash generation for glyph claims

export async function generateContentHash(
  canonicalText: string,
  latticeId: string,
  latticeVersion: number,
  rulesJson: object,
  pathJson: object
): Promise<string> {
  const data = JSON.stringify({
    canonicalText,
    latticeId,
    latticeVersion,
    rules: rulesJson,
    path: pathJson,
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function canonicalizeText(text: string): string {
  return text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')  // Replace unsupported chars with space
    .replace(/\s+/g, ' ')        // Collapse multiple spaces
    .trim();
}
