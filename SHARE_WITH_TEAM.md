# Forward this to the other agents

---

**Subject: Free 1-click Call / Text / Email buttons for the BO leads list**

Hi team — I found a small browser add-on that removes the copy-paste steps from the leads list. It adds:

- **Call** — reveals the number, copies it, and opens RingCentral already dialling the client.
- **Text** — reveals + copies the number and opens a new RingCentral text to the client.
- **Email** — reveals + copies the address, then shows our follow-up templates; picking one opens Gmail with the subject and message already filled in.
- A **⚙️** button at the bottom right to edit the email templates or switch the RingCentral links if needed.

**Setup (2 minutes, once per PC):**

1. Install Tampermonkey in Chrome/Edge: <https://www.tampermonkey.net/> (the free version is fine).
2. Open this link and click **Install**: <https://raw.githubusercontent.com/Rick3saal/system/arena/c719edc7-system/bo-quick-actions.user.js>
3. Reload the BO leads page. You will see the new buttons next to Phone and Email.
4. The first time Chrome asks **“Open RingCentral?”**, click **Open / Allow**. Make sure RingCentral desktop is installed and signed in.

If you prefer not to use Tampermonkey, ask me for the `chrome-extension` folder: open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select that folder.

Notes:
- Nothing is changed on the company's system or database — the buttons only run in your own browser with your own login.
- Settings and template edits are saved per PC, in your browser.
- Test it with one call/email first. If the Call or Text button does nothing, open ⚙️ and change the RingCentral link to `rcmobile://call?number={number}` / `rcmobile://sms?number={number}` (or `tel:{number}` / `sms:{numberPlus}`), then save.

---
