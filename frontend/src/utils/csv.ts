/**
 * Generic utility for exporting an array of objects to a CSV file.
 *
 * @param data Array of objects to export
 * @param filename Name of the downloaded file (without .csv extension)
 * @param headers Optional custom headers mapping object keys to column names
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T | ((item: T) => any); label: string }[]
) => {
  if (!data || !data.length) return;

  let csvContent = '';

  if (headers) {
    // Use mapped headers
    csvContent += headers.map(h => `"${h.label}"`).join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(h => {
        const value = typeof h.key === 'function' ? h.key(item) : item[h.key as keyof T];
        // Escape quotes and wrap in quotes to handle commas in data
        const safeValue = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : '';
        return `"${safeValue}"`;
      });
      csvContent += row.join(',') + '\n';
    });
  } else {
    // Auto-generate headers from object keys
    const autoHeaders = Object.keys(data[0]);
    csvContent += autoHeaders.map(key => `"${key}"`).join(',') + '\n';
    
    data.forEach(item => {
      const row = autoHeaders.map(key => {
        const value = item[key];
        const safeValue = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : '';
        return `"${safeValue}"`;
      });
      csvContent += row.join(',') + '\n';
    });
  }

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
