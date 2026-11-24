# Forward this to the other agents

---

**Subject: Free 1-click Call / Text / Email buttons for the BO leads list (no extension needed)**

Hi team — I found a small browser trick that removes the copy-paste steps from the leads list. It adds:

- **Call** — reveals the number, copies it, and opens RingCentral already dialling the client.
- **Text** — reveals + copies the number and opens a new RingCentral text to the client.
- **Email** — reveals + copies the address, then shows our follow-up templates; picking one opens Gmail with the subject and message already filled in.
- A **⚙️** button at the bottom right to edit the email templates or switch the RingCentral links if needed.

**Setup — no software to install (about 1 minute, once per PC):**

1. Download and open [`bookmarklet.html`](https://github.com/Rick3saal/system/blob/arena/c719edc7-system/bookmarklet.html) (or open it straight from the shared folder).
2. Show your bookmarks bar with `Ctrl+Shift+B`.
3. **Drag the blue “📞 BO Quick Actions” button onto the bookmarks bar.**
4. Open the BO leads list and click the new bookmark once. The buttons appear.
5. Click that bookmark once again after every full page reload.

If dragging is blocked: right-click the bookmarks bar → **Add page…**, name it `BO Quick Actions`, and paste the whole line from `bookmarklet.txt` into the URL field. If that fails too, the README has a DevTools Snippet backup method that needs no extension or bookmark.

**Alternative if your PC does allow extensions but the Web Store is blocked:** open `chrome://extensions`, switch on **Developer mode**, click **Load unpacked**, and select the `chrome-extension` folder from the shared folder. No store download needed.

Notes:
- Nothing is changed on the company's system or database — the buttons only run in your own browser with your own login.
- Settings and template edits are saved per PC, in your browser.
- Test it with one call/email first. If Call or Text does nothing, open ⚙️ and change the RingCentral link to `rcmobile://call?number={number}` / `rcmobile://sms?number={number}` (or `tel:{number}` / `sms:{numberPlus}`), then save.
- The first time Chrome asks **“Open RingCentral?”**, click **Open / Allow**.

---
