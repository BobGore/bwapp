// ── ROUTING ──────────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'getAppData') return getAppData();
  return ok({ error: 'unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const { action, payload } = body;
  switch (action) {
    case 'addChat':       return addChat(payload);
    case 'addComment':    return addComment(payload);
    case 'addIdea':       return addIdea(payload);
    case 'vote':          return vote(payload);
    case 'uploadPhoto':   return uploadPhoto(payload);
    case 'addAgendaItem': return addAgendaItem(payload);
    case 'logDevice':     return logDevice(payload);
    case 'askByork':      return askByork(payload);
    default:              return ok({ success: true });
  }
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data || { success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Reads a two-column (Key, Value) sheet into a plain object.

function sheetToConfig(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) return {};
  const rows = sheet.getDataRange().getValues().slice(1);
  const config = {};
  rows.forEach(r => { if (r[0]) config[r[0]] = r[1]; });
  return config;
}

// ── DATA ──────────────────────────────────────────────────────────────────────

function getAppData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function getData(name) {
    const sheet = ss.getSheetByName(name);
    return sheet ? sheet.getDataRange().getValues() : [[]];
  }

  return ok({
    users:    getData('Users'),
    agenda:   getData('Agenda'),
    chat:     getData('Chat'),
    ideas:    getData('Ideas'),
    photos:   getData('Photos'),
    comments: getData('Comments'),
    places:   getData('Places'),
    votes:    getData('Votes'),
    config:   sheetToConfig('Config')
  });
}

// ── WRITES ────────────────────────────────────────────────────────────────────

function addChat(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Chat').appendRow([
    payload.author,
    payload.text,
    new Date().toISOString()
  ]);
  return ok();
}

function addComment(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Comments').appendRow([
    payload.itemId,
    payload.author,
    payload.text,
    new Date().toISOString()
  ]);
  return ok();
}

function addIdea(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Ideas').appendRow([
    Utilities.getUuid(),
    payload.author,
    payload.text,
    0,
    0
  ]);
  return ok();
}

function vote(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Votes').appendRow([
    payload.ideaId,
    payload.author,
    payload.direction,
    new Date().toISOString()
  ]);

  // Update running totals on the Ideas sheet
  const ideasSheet = ss.getSheetByName('Ideas');
  const rows = ideasSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(payload.ideaId)) {
      const col = payload.direction === 'up' ? 4 : 5; // D=ups, E=downs (1-indexed)
      ideasSheet.getRange(i + 1, col).setValue((rows[i][col - 1] || 0) + 1);
      break;
    }
  }
  return ok();
}

function uploadPhoto(payload) {
  // Drive folder ID is read from the Config sheet — never hardcoded.
  const config = sheetToConfig('Config');
  const folder = DriveApp.getFolderById(config.driveFolder);

  const blob = Utilities.newBlob(
    Utilities.base64Decode(payload.base64),
    payload.mimeType,
    payload.filename
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const driveUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Photos').appendRow([
    Utilities.getUuid(),
    payload.uploader,
    payload.caption || '',
    driveUrl,
    payload.day || ''
  ]);
  return ok({ driveUrl });
}

function addAgendaItem(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Agenda').appendRow([
    Utilities.getUuid(),
    payload.day,
    payload.time,
    payload.title,
    payload.desc,
    payload.emoji,
    payload.location
  ]);
  return ok();
}

function logDevice(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('DeviceLog').appendRow([
    new Date().toISOString(),
    payload.user,
    payload.deviceId,
    payload.fingerprint
  ]);
  return ok();
}

// ── BYÖRK BOT ────────────────────────────────────────────────────────────────
// Stub farewell function — do not modify.

function askByork(payload) {
  return ok();
}
