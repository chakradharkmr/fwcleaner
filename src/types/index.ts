export interface Rule {
  id: string;
  source: string;
  destination: string;
  port: string;
  action: 'allow' | 'deny';
  protocol: string;
  configLine?: string;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  line?: number;
  configLine?: string;
}

export interface AnalysisReport {
  vulnerabilities: Vulnerability[];
  duplicateRules: Rule[];
  totalRules: number;
}