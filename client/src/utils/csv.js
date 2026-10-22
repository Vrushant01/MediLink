// Generates and triggers browser download of an array of objects as a formatted CSV file
export const downloadCsv = (filename, rows) => {
  if (!rows || rows.length === 0) {
    return;
  }

  // Extract column keys from the first row
  const headers = Object.keys(rows[0]);

  // Escape special characters and format fields
  const escapeField = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value);
    // Double quote any internal quotes, and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeField).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeField(row[header])).join(',')
    ),
  ];

  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default downloadCsv;
