# BWapp Setup Guide

## How it works

One master Google Sheet ("BWapp Directory") holds a row per year. Its deployed script returns the full directory as JSON. `index.html` fetches this on load to discover the live year's script URL — `MASTER_SCRIPT_URL` in the HTML is the **only** hardcoded URL.

Each year has its own Google Sheet with its own deployed Apps Script. All reads and writes for that year go through that script.

---

## One-time: create the BWapp Directory Sheet

1. Create a new Google Sheet. Name it **BWapp Directory** — the tab within the sheet should also be called **BWapp Directory** (Google names it after the file by default when importing CSV).
2. In row 1, add these headers (A–G):

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | Name | Year | Location | ScriptURL | Status | StartDate | EndDate |

4. Open **Extensions → Apps Script**.
5. Delete any existing code, paste the contents of `MASTER_SCRIPT.gs`, and save.
6. Click **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**, authorise, and copy the web app URL.
8. In `index.html`, replace `PASTE_MASTER_SCRIPT_URL_HERE` with that URL.

---

## One-time: update the existing BYörk 2026 Sheet

1. Open the BYörk 2026 Google Sheet.
2. Add a new tab called **Config** with two columns: `Key` and `Value`.
3. Add these rows (fill in your actual values):

   | Key | Value |
   |-----|-------|
   | eventName | BYörk |
   | eventYear | 2026 |
   | location | York |
   | adminUser | Bob |
   | sessionKey | bwapp_2026 |
   | driveFolder | *(your Google Drive folder ID for photos)* |

4. Open **Extensions → Apps Script** in that Sheet.
5. Replace the existing script with the contents of `YEAR_SCRIPT.gs` and save.
6. Click **Deploy → Manage deployments**, then edit the existing deployment and click **Deploy** (new version). Copy the web app URL.
7. In the BWapp Directory Sheet, add a row for 2026:

   | Name | Year | Location | ScriptURL | Status | StartDate | EndDate |
   |------|------|----------|-----------|--------|-----------|---------|
   | BYörk | 2026 | York | *(script URL from step 6)* | live | 2026-05-08 | 2026-05-12 |

   > **StartDate** is midnight on the first night (Friday).  
   > **EndDate** is midnight after the last morning (exclusive end — e.g. if the weekend ends Monday, EndDate is Tuesday's date).

---

## Adding a new year

1. In the BYörk 2026 Google Sheet, go to **File → Make a copy**. Name it e.g. **BYörk 2027**.
2. Clear the data from all tabs: Users (keep headers), Agenda, Chat, Ideas, Photos, Comments, Places, Votes, DeviceLog.
3. Update the **Config** tab values (`eventName`, `eventYear`, `location`, `sessionKey`, `driveFolder`, etc.) for the new year.
4. Open **Extensions → Apps Script** in the new Sheet. The script is already there from the copy. Click **Deploy → New deployment** (same settings as before). Copy the new web app URL.
5. In the **BWapp Directory** Sheet:
   - Set the current `live` row's **Status** to `archive`.
   - Add a new row for the new year with **Status** = `live` and the new script URL.
6. That's it. No code changes needed — the app reads the directory on every load.

---

## Config tab keys

| Key | Description |
|-----|-------------|
| `eventName` | Short name shown in the header and gate (e.g. `BYörk`) |
| `eventYear` | Four-digit year (e.g. `2026`) |
| `location` | City shown as the Map section title (e.g. `York`) |
| `adminUser` | Username who sees the Admin tab (e.g. `Bob`) |
| `sessionKey` | `sessionStorage` key for login persistence — use a unique value per year (e.g. `bwapp_2026`) so sessions don't carry over |
| `driveFolder` | Google Drive folder ID for photo uploads — find it in the folder's URL |

---

## Directory sheet columns

| Column | Key | Notes |
|--------|-----|-------|
| A | Name | e.g. `BYörk` |
| B | Year | e.g. `2026` (used for display only) |
| C | Location | e.g. `York` |
| D | ScriptURL | Deployed web app URL for that year's Sheet |
| E | Status | `live` or `archive` — exactly one row should be `live` at all times |
| F | StartDate | `YYYY-MM-DD` — midnight at the start of the first day (assumed BST) |
| G | EndDate | `YYYY-MM-DD` — midnight after the last day (exclusive end) |
