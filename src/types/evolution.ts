/**
 * Core types for the Evolution System
 * These types define the structure of the autonomous evolution loop
 */

export type EvolutionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'approved' | 'rejected';

export type MutationType = 
  | 'ui_improvement'
  | 'performance_optimization'
  | 'seo_enhancement'
  | 'accessibility_fix'
  | 'content_update'
  | 'styling_refinement'
  | 'component_refactor'
  | 'bug_fix'
  | 'feature_addition'
  | 'theme_evolution';

export type ReviewSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface VersionDNA {
  id: string;
  version: string;
  createdAt: Date;
  status: EvolutionStatus;
  parentVersionId?: string;
  lineage: string[]; // Array of ancestor version IDs
  metrics: {
    performance: {
      before: MetricsSnapshot;
      after?: MetricsSnapshot;
    };
    bundleSize: {
      before: number;
      after?: number;
    };
    accessibility: {
      before: number; // Score 0-100
      after?: number;
    };
    seo: {
      before: number; // Score 0-100
      after?: number;
    };
    userMetrics?: {
      engagement?: number;
      bounceRate?: number;
      avgSessionDuration?: number;
    };
  };
  reasoning: string; // Natural language explanation of why this version was created
  mutations: Mutation[];
  costFunctionScore?: number; // 0-1, higher is better
  approvedBy?: string; // User ID
  approvedAt?: Date;
  deployedAt?: Date;
}

export interface MetricsSnapshot {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface Mutation {
  id: string;
  type: MutationType;
  filePath: string;
  description: string;
  diff: string; // Git-like diff
  codeBefore: string;
  codeAfter: string;
  reasoning: string; // Why this mutation was generated
  estimatedImpact: {
    performance?: number; // -1 to 1, relative change
    ux?: number;
    seo?: number;
    accessibility?: number;
    stability?: number;
  };
  validationStatus: 'pending' | 'passed' | 'failed';
  validationErrors?: string[];
}

export interface Review {
  id: string;
  versionId: string;
  createdAt: Date;
  severity: ReviewSeverity;
  category: 'ui' | 'ux' | 'performance' | 'seo' | 'accessibility' | 'code_quality' | 'content' | 'structure';
  title: string;
  description: string; // Natural language critique
  suggestions: string[]; // Suggested improvements
  priority: number; // 1-10, higher is more important
  addressed: boolean;
  addressedAt?: Date;
  addressedBy?: string; // Mutation ID that addressed this
}

export interface Snapshot {
  id: string;
  versionId: string;
  createdAt: Date;
  fileStructure: FileStructureNode;
  codebaseHash: string; // SHA-256 hash of the entire codebase
  metadata: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>; // Language -> line count
  };
}

export interface FileStructureNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileStructureNode[];
  size?: number;
  lastModified?: Date;
}

export interface Config {
  id: string;
  key: string;
  value: any;
  description: string;
  updatedAt: Date;
  updatedBy?: string;
}

export interface Approval {
  id: string;
  versionId: string;
  mutationIds: string[];
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  feedback?: string;
  approvedMutations?: string[]; // IDs of approved mutations
  rejectedMutations?: string[]; // IDs of rejected mutations
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
  trafficSplit: number; // Percentage for variant A (rest goes to B)
  metrics: {
    impressions: number;
    conversions: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}

export interface ExperimentVariant {
  id: string;
  name: string;
  versionId: string;
  description: string;
  isControl: boolean;
  trafficPercentage: number;
}

export interface AnalyticsEvent {
  id: string;
  experimentId?: string;
  variantId?: string;
  eventType: 'page_view' | 'click' | 'conversion' | 'engagement' | 'error';
  timestamp: Date;
  metadata: Record<string, any>;
  userId?: string;
  sessionId: string;
}
