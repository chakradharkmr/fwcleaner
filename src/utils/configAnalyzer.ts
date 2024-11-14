import { Rule, Vulnerability, AnalysisReport } from '../types';
import { vulnerabilityPatterns } from './aiRules';

function parseRule(line: string, index: number): Rule | null {
  const rulePattern = /^(permit|deny)\s+(\w+)\s+(\S+)\s+(\S+)(?:\s+eq\s+(\d+))?/i;
  const match = line.match(rulePattern);

  if (!match) return null;

  return {
    id: `RULE-${index}`,
    action: match[1].toLowerCase() === 'permit' ? 'allow' : 'deny',
    protocol: match[2],
    source: match[3],
    destination: match[4],
    port: match[5] || 'any',
    configLine: line.trim()
  };
}

function analyzeRuleContext(rules: Rule[]): Rule[] {
  return rules.filter((rule, index) => {
    // Find rules that might conflict or overlap
    const similarRules = rules.slice(index + 1).filter(r => {
      // Check for exact duplicates
      const exactDuplicate = 
        r.source === rule.source &&
        r.destination === rule.destination &&
        r.protocol === rule.protocol &&
        r.port === rule.port;
      
      // Check for overlapping rules
      const overlapping =
        (r.source === 'any' || rule.source === 'any' || r.source === rule.source) &&
        (r.destination === 'any' || rule.destination === 'any' || r.destination === rule.destination) &&
        (r.protocol === 'ip' || rule.protocol === 'ip' || r.protocol === rule.protocol) &&
        (r.port === 'any' || rule.port === 'any' || r.port === rule.port);

      return exactDuplicate || overlapping;
    });

    return similarRules.length > 0;
  });
}

export function analyzeConfig(config: string): AnalysisReport {
  const vulnerabilities: Vulnerability[] = [];
  const rules: Rule[] = [];
  const lines = config.split('\n');

  // AI-based pattern matching with context
  lines.forEach((line, index) => {
    vulnerabilityPatterns.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        const vuln = pattern.createVulnerability(line, index);
        vuln.configLine = line.trim();
        vulnerabilities.push(vuln);
      }
    });

    const rule = parseRule(line.trim(), index);
    if (rule) {
      rules.push(rule);
    }
  });

  // Analyze rule context and find duplicates/conflicts
  const duplicateRules = analyzeRuleContext(rules);

  // Policy analysis
  if (rules.length > 0) {
    const permitRules = rules.filter(r => r.action === 'allow').length;
    const permitPercentage = (permitRules / rules.length) * 100;

    if (permitPercentage > 75) {
      vulnerabilities.push({
        id: 'VULN-POLICY-PERMISSIVE',
        type: 'Permissive Security Policy',
        severity: 'medium',
        description: `${permitPercentage.toFixed(1)}% of rules are permit rules (${permitRules} out of ${rules.length}). A high percentage of permit rules may indicate an overly permissive security policy.`,
        recommendation: '1. Review and justify all permit rules\n2. Implement deny rules by default\n3. Group similar rules together\n4. Consider implementing security zones\n5. Document all rule exceptions'
      });
    }
  }

  return {
    vulnerabilities,
    duplicateRules,
    totalRules: rules.length
  };
}