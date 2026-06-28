export type RunStatus = "SUCCESS" | "FAILED" | "PARTIAL";

export interface RunArtifact {
  target_id: string;
  stage: string;
  relative_path: string;
  schema_name: string;
  schema_version: string;
  hash: string;
  size_bytes: number;
}

export interface PipelineRun {
  id: string;
  status: RunStatus;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  target_count: number;
  python_version: string;
  pipeline_version: string;
  os_platform: string;
  resolved_config_yaml: string;
  environment: Record<string, unknown>;
  artifacts: RunArtifact[];
}

export interface RunsIndex {
  runs: PipelineRun[];
}
