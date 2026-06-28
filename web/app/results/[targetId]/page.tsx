import { ResultsPageContent } from "./ResultsPageContent";

interface Props {
  params: { targetId: string };
}

export default function ResultsPage({ params }: Props) {
  return <ResultsPageContent targetId={params.targetId} />;
}
