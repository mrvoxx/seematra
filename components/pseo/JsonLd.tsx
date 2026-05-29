// components/pseo/JsonLd.tsx — Generic JSON-LD script injector
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
