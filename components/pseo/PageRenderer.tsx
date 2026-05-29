// components/pseo/PageRenderer.tsx — Routes page_type to the correct renderer
import CircuitHubPage from './CircuitHubPage';
import DestinationGuidePage from './DestinationGuidePage';
import IntentPage from './IntentPage';
import ComparisonPage from './ComparisonPage';
import GenericPage from './GenericPage';

interface PageRendererProps {
  page: Record<string, unknown>;
  relatedPages: Record<string, unknown>[];
}

export default function PageRenderer({ page, relatedPages }: PageRendererProps) {
  const pageType = page.page_type as string;

  switch (pageType) {
    case 'circuit_hub':
      return <CircuitHubPage data={page} related={relatedPages} />;

    case 'destination_guide':
      return <DestinationGuidePage data={page} related={relatedPages} />;

    case 'intent':
      return <IntentPage data={page} related={relatedPages} />;

    case 'comparison':
      return <ComparisonPage data={page} related={relatedPages} />;

    // All other types use GenericPage with type-specific sections
    case 'seasonal':
    case 'persona':
    case 'faq_hub':
    case 'nearby_places':
    case 'activity':
    case 'itinerary':
    default:
      return <GenericPage data={page} related={relatedPages} />;
  }
}
