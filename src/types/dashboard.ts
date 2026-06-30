export type ServiceState = 'operational' | 'degraded' | 'offline' | 'unknown';
export type JobState = 'queued' | 'processing' | 'completed' | 'failed';

export interface ServiceStatus {
  readonly id: string;
  readonly name: string;
  readonly state: ServiceState;
  readonly latencyMs?: number;
}

export interface AnalysisJob {
  readonly id: string;
  readonly target: string;
  readonly mission: string;
  readonly state: JobState;
  readonly progress?: number;
  readonly updatedAt: string;
}

export interface RecentDownload {
  readonly id: string;
  readonly filename: string;
  readonly target: string;
  readonly downloadedAt: string;
  readonly sizeBytes: number;
}

export interface DashboardSummary {
  readonly systemState: ServiceState;
  readonly pipelineState: ServiceState;
  readonly modelVersion: string | null;
  readonly services: readonly ServiceStatus[];
  readonly recentAnalyses: readonly AnalysisJob[];
  readonly recentDownloads: readonly RecentDownload[];
  readonly activeJobs: readonly AnalysisJob[];
  readonly generatedAt: string;
}

