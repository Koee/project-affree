import fs from 'fs';
import path from 'path';
import { ApiRecord } from './api-crawl-recorder';

export function generateApiCrawlHtmlReport(
    records: ApiRecord[],
    outputDir = 'test-results/api-crawl'
) {
    fs.mkdirSync(outputDir, { recursive: true });

    const rows = records
        .map(
            item => `
      <tr>
        <td>${item.method}</td>
        <td>${item.endpoint}</td>
        <td>${item.status}</td>
        <td>${item.contentType}</td>
        <td>${item.sourcePage || ''}</td>
        <td>${item.requestBody ? 'YES' : 'NO'}</td>
      </tr>
    `
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Affree API Crawl Report</title>
  <style>
    body { font-family: Arial; padding: 24px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
    th { background: #222; color: white; }
    .ok { color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Affree API Crawl Report</h1>
  <p>Total APIs found: <b>${records.length}</b></p>

  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Endpoint</th>
        <th>Status</th>
        <th>Content-Type</th>
        <th>Source Page</th>
        <th>Has Body</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
`;

    fs.writeFileSync(path.join(outputDir, 'api-crawl-report.html'), html, 'utf-8');
}