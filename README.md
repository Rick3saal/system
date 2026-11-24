# BO Quick Actions — Call / SMS / Email from the leads list

The company's BO system masks phone numbers and emails. Today that means: click the number → click again to copy → open RingCentral → paste → call. Click the email → click again to copy → open Gmail → find a template → paste.

This repository contains a **browser-side overlay** that puts the missing one-click buttons directly in the Phone and Email columns:

| Button | What it does |
| --- | --- |
| 📞 **Call** (green) | Reveals the number using the site's own click behaviour, copies it, and hands it to RingCentral to call the client. |
| 💬 **Text** (yellow) | Same reveal + copy, then opens a new RingCentral SMS to that client. |
| ✉️ **Email** (red) | Reveals + copies the address and opens a menu of your email templates. Choosing one opens Gmail with the client's address, subject and message already filled in. |
| 📋 **Copy** (blue) | Just reveal + copy, no app opened. |
| ⚙️ **Settings** (bottom right) | Change the RingCentral links, country code, and edit the email templates. Saved in that browser only. |

**It does not change the company's website, its database, or anyone's account.** It only adds buttons inside your own browser window, using your existing login. Nothing is sent to any third party by the script.

---

## What are the options?

| Option | Who can install it | Effort to share | Pros | Cons |
| --- | --- | --- | --- | --- |
| **1. Userscript** (recommended here) | Any agent with Chrome/Edge/Firefox + Tampermonkey or Violentmonkey | One link + one click to install | Fastest to roll out; updates from one file; easy to customise per agent | Requires a free browser extension |
| **2. Chrome/Edge extension** in this repo | Chrome/Edge agents, no extra store extension | Copy this folder/ZIP, then *Load unpacked* | No userscript manager; uses normal Chrome extension permissions | Manual install/update; Chrome/Edge only |
| **3. Ask the vendor/IT to add the buttons to BO itself** | Vendor / company IT | Change request | Best long-term: everyone gets it automatically, no browser add-ons | Slowest; depends on the vendor and change approval |
| **4. Desktop automation** (AutoHotkey / Power Automate) | Windows agents | Install a script on every PC | Works even inside apps | Fragile: breaks when the screen or window changes; harder to support |

**Recommendation:** start with option 1 on 2–3 agents for a day, then share the link with the whole team. Long term, send the option 3 request to IT/vendor using this tool as the working specification.

---

## Option 1 — install the userscript (easiest)

1. Install the free extension [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Open the script file:
   - **From the link:** <https://raw.githubusercontent.com/Rick3saal/system/arena/c719edc7-system/bo-quick-actions.user.js> — then click **Install** / **Confirm installation**.
   - **Or from a file:** download [`bo-quick-actions.user.js`](bo-quick-actions.user.js), open Tampermonkey → *Dashboard* → *Utilities* → *Import script*, and choose the file.
3. Open the BO leads list and reload it. You will see the new buttons in the Phone and Email columns and a ⚙️ button at the bottom right.
4. The first time you press **Call** or **Text**, Chrome may ask *"Open RingCentral?"* — click **Open** (and allow it for future requests). RingCentral desktop must be installed and signed in.

> Once this work is merged to `main`, use `https://raw.githubusercontent.com/Rick3saal/system/main/bo-quick-actions.user.js` as the shared link instead.

## Option 2 — install the Chrome/Edge extension

1. Download or clone this repository and keep the `chrome-extension` folder together with its two files.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `chrome-extension` folder.
5. Reload the BO leads list. The buttons and ⚙️ appear.

If the userscript is edited, run `./build-extension.sh` to regenerate `chrome-extension/quick-actions.js`, then reload the extension at `chrome://extensions`.

---

## Settings and templates

Click the ⚙️ button at the bottom right of the BO page:

- **Country code** — used when the site shows a 10-digit number without a country code (default `1`).
- **Call link / SMS link** — the RingCentral deep links. Defaults:
  - Call: `rcapp://r/call?number={number}`
  - SMS: `rcapp://r/sms?type=new&number={number}`
  - `{number}` is digits only in E.164 style, e.g. `16025550123`. If your RingCentral version does not respond to `rcapp://`, change it to `rcmobile://call?number={number}` / `rcmobile://sms?number={number}` or the plain `tel:{number}` / `sms:{numberPlus}`.
- **Copy number/email before opening the app** — on by default, so even if RingCentral or Gmail fails to open, the value is already on your clipboard.
- **Email templates** — one per line: `Name | Subject | Body`. Use the literal characters `\n` for a new line in the body. Available placeholders: `{client}`, `{email}`, `{number}`, `{numberPlus}`, `{id}`.

These settings are stored per browser profile in `localStorage`. They are not shared between agents unless an agent sets them up on their own PC.

---

## How the RingCentral link works

RingCentral documents URI schemes that launch the desktop/mobile app directly:

- `rcmobile://call?number={phoneNumber}` and `rcmobile://sms?number={phoneNumber}` are the officially recommended schemes for desktop softphone URI dialling [1](https://developers.ringcentral.com/guide/voice/uri-scheme).
- RingCentral's scheme reference also lists `tel:`, `sms:`, `/r/call?number=...`, `/r/dialer?number=...`, and `/r/sms?type=new&number=...` [2](https://developers.ringcentral.com/guide/basics/uri-schemes).
- Google Chrome needs JavaScript navigation (`window.location.assign`) rather than a plain link for these custom schemes; that is what the script does [1](https://developers.ringcentral.com/guide/voice/uri-scheme).
- The `rcapp://r/sms?type=new&number=...` form is reported by RingCentral community users as working for prefilled SMS drafts [3](https://community.ringcentral.com/developer-platform-apis-integrations-5/is-there-a-uri-scheme-to-go-to-sms-conversation-in-rcapp-912). If it does not work in your version, switch the SMS link to `rcmobile://sms?number={number}` in ⚙️ settings.

---

## Before rolling out to the whole team

- Check your company's IT policy on browser extensions / scripts. Get approval if required.
- Test on one machine first: reveal one number, place one test call, send one test SMS, send one test email to yourself.
- The script uses the site's own reveal click — it does not bypass access controls. Agents can only reveal data the site already lets them reveal.
- The script makes no network requests of its own. Gmail and RingCentral are opened only when *you* press a button.
- The buttons are positioned by looking for the `Phone` and `Email` column headings. If the BO layout changes significantly, the buttons may stop appearing; update the selectors in `bo-quick-actions.user.js` and re-install.

## Files

- `bo-quick-actions.user.js` — the userscript and single source of truth.
- `chrome-extension/` — unpacked Chrome/Edge extension version (manifest + generated content script).
- `build-extension.sh` — regenerates the extension content script after userscript edits.
- `SHARE_WITH_TEAM.md` — a short message you can forward to other agents.
