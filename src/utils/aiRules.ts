import { Vulnerability } from '../types';

interface PatternRule {
  pattern: RegExp;
  createVulnerability: (line: string, index: number) => Vulnerability;
}

export const vulnerabilityPatterns: PatternRule[] = [
  {
    pattern: /telnet\s+(?:permit|allow)/i,
    createVulnerability: (line: string, index: number) => ({
      id: `VULN-${index}-TELNET`,
      type: 'Insecure Remote Access Protocol',
      severity: 'critical',
      description: 'Telnet service is allowed, which transmits credentials and data in plaintext. This can lead to credential theft and session hijacking through network sniffing.',
      recommendation: 'Replace Telnet (port 23) with SSH (port 22). Configure SSH with strong ciphers, key-based authentication, and disable SSH protocol version 1.',
      line: index + 1
    })
  },
  {
    pattern: /ftp\s+(?:permit|allow)/i,
    createVulnerability: (line: string, index: number) => ({
      id: `VULN-${index}-FTP`,
      type: 'Insecure File Transfer Protocol',
      severity: 'high',
      description: 'FTP service is allowed, which transfers credentials and data in cleartext. FTP also uses multiple dynamic ports for data transfer, complicating firewall rules.',
      recommendation: 'Replace FTP with SFTP (SSH File Transfer) or FTPS (FTP over SSL/TLS). If FTP must be used, restrict it to specific trusted networks and implement strict access controls.',
      line: index + 1
    })
  },
  {
    pattern: /http\s+(?:permit|allow)(?!.*ssl|.*tls)/i,
    createVulnerability: (line: string, index: number) => ({
      id: `VULN-${index}-HTTP`,
      type: 'Unencrypted HTTP Traffic',
      severity: 'high',
      description: 'Plain HTTP traffic is allowed without encryption. This can expose sensitive data, enable session hijacking, and make the service vulnerable to man-in-the-middle attacks.',
      recommendation: 'Enforce HTTPS by redirecting all HTTP traffic to HTTPS. Implement TLS 1.2 or higher, use strong cipher suites, and consider adding HTTP Strict Transport Security (HSTS).',
      line: index + 1
    })
  },
  {
    pattern: /password\s+(?:0|7)\s+(\w+)/i,
    createVulnerability: (line, index) => ({
      id: `VULN-${index}-WEAK-ENCRYPTION`,
      type: 'Weak Password Encryption',
      severity: 'critical',
      description: `Password using type ${line.includes('0') ? 'plaintext (type 0)' : 'weak encryption (type 7)'} detected. Type 7 passwords can be easily decrypted using publicly available tools.`,
      recommendation: 'Use type 9 (scrypt) or type 8 (PBKDF2) password encryption. Remove all type 0 (plaintext) and type 7 (weak encryption) passwords. Implement strong password policies and regular password rotation.',
      line: index + 1
    })
  },
  {
    pattern: /permit\s+ip\s+any\s+any/i,
    createVulnerability: (line, index) => ({
      id: `VULN-${index}-OVERLY-PERMISSIVE`,
      type: 'Overly Permissive Access Rule',
      severity: 'critical',
      description: 'Rule allows unrestricted IP traffic from any source to any destination. This effectively bypasses the firewall\'s security controls and violates the principle of least privilege.',
      recommendation: 'Replace with specific rules that only allow necessary traffic:\n1. Define explicit source/destination IP ranges\n2. Specify required protocols and ports\n3. Implement separate rules for different services\n4. Use security zones to segment network access',
      line: index + 1
    })
  },
  {
    pattern: /(username\s+\w+\s+password|enable\s+password)\s+(\w+)(?!\s+encrypted)/i,
    createVulnerability: (line, index) => ({
      id: `VULN-${index}-PLAIN-CREDS`,
      type: 'Plaintext Credentials',
      severity: 'critical',
      description: 'Unencrypted credentials found in configuration. This exposes authentication credentials to anyone with access to the configuration file or backup copies.',
      recommendation: 'Encrypt all passwords in the configuration:\n1. Use \'service password-encryption\' command\n2. Configure secret passwords instead of regular passwords\n3. Implement AAA authentication\n4. Consider using a centralized authentication server (TACACS+/RADIUS)',
      line: index + 1
    })
  },
  {
    pattern: /snmp(-server)?\s+community\s+(\w+)\s+(?:ro|rw)/i,
    createVulnerability: (line, index) => ({
      id: `VULN-${index}-SNMP-COMMUNITY`,
      type: 'Insecure SNMP Configuration',
      severity: 'high',
      description: `SNMP ${line.includes('rw') ? 'read-write' : 'read-only'} community string detected. SNMPv1/v2c use cleartext community strings and lack strong authentication and encryption.`,
      recommendation: '1. Upgrade to SNMPv3 with authentication and encryption\n2. Configure SNMPv3 users with appropriate security levels (authPriv)\n3. Use strong authentication protocols (SHA) and encryption (AES)\n4. Restrict SNMP access to specific management stations\n5. If SNMPv2c must be used, use long, complex community strings and restrict access with ACLs',
      line: index + 1
    })
  },
  {
    pattern: /permit\s+(\w+)\s+any\s+any\s+eq\s+(\d+)/i,
    createVulnerability: (line, index) => {
      const matches = line.match(/permit\s+(\w+)\s+any\s+any\s+eq\s+(\d+)/i);
      const protocol = matches?.[1] || '';
      const port = matches?.[2] || '';
      return {
        id: `VULN-${index}-UNRESTRICTED-PORT`,
        type: 'Unrestricted Port Access',
        severity: 'high',
        description: `Rule allows unrestricted ${protocol.toUpperCase()} access to port ${port} from any source. This could expose services to unauthorized access and potential attacks.`,
        recommendation: `1. Restrict ${protocol.toUpperCase()} port ${port} access to specific source IPs/networks\n2. Consider implementing rate limiting\n3. Add logging for connection attempts\n4. If possible, use a more specific service definition instead of port numbers`,
        line: index + 1
      };
    }
  }
];