# Ready-to-send IT / vendor request

Copy the text below into an email or ticket and send it to whoever manages Chrome policy and the BO system.

**Short version, if you prefer to keep it simple:**

> Hi IT, our agents spend a lot of time copying masked phone numbers and emails from the BO leads list into RingCentral and Gmail. Could you either ask the BO vendor to add Call / Text / Email buttons, or approve a small approved extension/user script on our Chrome profiles? Happy to share details.

**Full version below.**

---

**Subject: Request to enable one-click Call / Text / Email buttons for the BO leads list**

Hello,

Our agents handle leads in the BO system at `bo.travelbusinessclass.com/leads/list`. The phone numbers and email addresses there are masked. For every lead, an agent currently has to:

1. click the masked number/address to reveal it,
2. click again to copy it,
3. switch to RingCentral or Gmail,
4. paste the value, and
5. find and insert the right email template.

This is slow and leads to copy/paste mistakes. We have a working prototype of the buttons we need: a **Call** button, a **Text** button, and an **Email** button with our follow-up templates. It was verified against a mock of the leads table and is documented here:

- Working code and details: https://github.com/Rick3saal/system/pull/1
- Short description of the buttons: https://github.com/Rick3saal/system/blob/arena/c719edc7-system/README.md

**We cannot deploy it ourselves because of the current browser restrictions on our PCs:**

- Chrome Web Store and userscript managers (Tampermonkey / Violentmonkey / alternatives) are blocked.
- Chrome Developer mode (`chrome://extensions` → Load unpacked) is disabled.
- DevTools (F12) is disabled.
- `javascript:` bookmarks are blocked — even a one-line test bookmark that only shows an alert does nothing on the BO page.

**Please do one of the following:**

- **Option A (preferred):** ask the BO vendor to add these three buttons to the Phone and Email columns. The prototype can be used as the specification.
- **Option B:** allow one of these on the agents' Chrome profiles:
  - **force-install** Tampermonkey (or our own extension) through Chrome's enterprise policy — this is the supported admin method and does not require Developer mode to be turned on for users, **or**
  - Chrome Developer mode so we can load our own small extension from a folder, **or**
  - a policy/CSP exemption for `bo.travelbusinessclass.com` that permits our bookmarklet.

Security notes: the prototype uses each agent's existing login, changes nothing on the company server, stores settings locally in the browser, and sends no data to third parties. It only opens RingCentral and Gmail when the agent presses a button.

Please let us know which option is possible so we can roll this out to the team.

Thanks,
[Your name]

---

## What to do next

- Send the text above.
- Tell me what IT replies, and I'll adjust the solution to fit whatever they allow.
- If they force-install Tampermonkey, or allow it → use `bo-quick-actions.user.js` from the repository.
- If they force-install our extension, or allow Developer mode → use the `chrome-extension/` folder.
- If they agree to a CSP exemption → use `bookmarks.html` or the bookmarklet.
- If they ask the vendor to build it → send them the README/PR as the spec.
