export function normalizeMediaUrl(input?: string | null): string | null {
  if (!input) return null;

  const value = input.trim();
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  const cleanLeadingSlashes = value.replace(/^\/+/, "");

  if (value.startsWith("//")) {
    const [hostPart] = cleanLeadingSlashes.split("/");
    if (isLikelyDomain(hostPart) && cleanLeadingSlashes.includes("/")) {
      return `https://${cleanLeadingSlashes}`;
    }
    return `/${cleanLeadingSlashes}`;
  }

  const [firstSegment] = value.split("/");
  if (isLikelyDomain(firstSegment) && value.includes("/")) {
    return `https://${value}`;
  }

  return `/${value.replace(/^\.?\/+/, "")}`;
}

function isLikelyDomain(value: string): boolean {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
}
