import React from 'react';

// Defines the structure for an item from a threat intelligence feed
interface ThreatIntelItem {
  id: string;
  source: 'Mandiant' | 'CrowdStrike' | 'Recorded Future';
  type: 'New Vulnerability' | 'Active Threat Actor' | 'Malware Campaign';
  title: string;
  summary: string;
  publishedAt: string;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

// Mock data from a threat intelligence feed integration
const threatIntelFeed: ThreatIntelItem[] = [
  {
    id: 'threat-1',
    source: 'Mandiant',
    type: 'New Vulnerability',
    title: 'Log4j Remote Code Execution (CVE-2021-44228)',
    summary: 'A critical RCE vulnerability in the popular Log4j logging library affects a wide range of Java applications.',
    publishedAt: '2021-12-10',
    threatLevel: 'Critical',
  },
  {
    id: 'threat-2',
    source: 'CrowdStrike',
    type: 'Active Threat Actor',
    title: 'FIN7 targets financial sector with new reconnaissance tools.',
    summary: 'The financially motivated threat actor FIN7 has been observed using a new set of tools for initial access and reconnaissance.',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    threatLevel: 'High',
  },
  {
    id: 'threat-3',
    source: 'Recorded Future',
    type: 'Malware Campaign',
    title: 'IcedID malware spreading via phishing campaigns.',
    summary: 'A large-scale phishing campaign is distributing the IcedID banking trojan.',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    threatLevel: 'Medium',
  },
];

/**
 * @description Integrates with threat intelligence feeds to display emerging threats.
 */
const ThreatIntel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Threat Intelligence Feed</h2>
      <div className="space-y-4">
        {threatIntelFeed.map((item) => (
          <div key={item.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <span className={`text-sm font-bold ${item.threatLevel === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                {item.threatLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
            <div className="text-xs text-gray-500 mt-2">
              Source: {item.source} | Published: {new Date(item.publishedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatIntel;
