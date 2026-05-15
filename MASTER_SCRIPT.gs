function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('BWapp Directory');
  const rows = sheet.getDataRange().getValues().slice(1);
  const weekends = rows.map(r => ({
    name:      r[0],
    year:      r[1],
    location:  r[2],
    scriptURL: r[3],
    status:    r[4],
    startDate: r[5],
    endDate:   r[6]
  }));
  return ContentService.createTextOutput(JSON.stringify({ weekends }))
    .setMimeType(ContentService.MimeType.JSON);
}
