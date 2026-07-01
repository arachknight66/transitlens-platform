import { useMutation } from '@tanstack/react-query';

import { generateReport } from '../services/reportService';
import type { ReportFormat } from '../types/report';
import { saveBlob } from '../utils/download';

export const useReportExport = (analysisId: string) =>
  useMutation({
    mutationKey: ['report', analysisId],
    mutationFn: (format: ReportFormat) => generateReport(analysisId, format),
    onSuccess: (artifact) => {
      saveBlob(artifact.blob, artifact.filename);
    },
  });

