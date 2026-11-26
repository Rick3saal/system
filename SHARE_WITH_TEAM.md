# Forward this to the other agents

---

**Subject: Free 1-click Call / Text / Email buttons for the BO leads list (no extension needed)**

Hi team — I found a small browser trick that removes the copy-paste steps from the leads list. It adds:

- **Call** — reveals the number, copies it, and opens RingCentral already dialling the client.
- **Text** — reveals + copies the number and opens a new RingCentral text to the client.
- **Email** — reveals + copies the address, then shows our follow-up templates; picking one opens Gmail with the subject and message already filled in.
- A **⚙️** button at the bottom right to edit the email templates or switch the RingCentral links if needed.

**Setup — no software, no extension and no Developer mode (about 1 minute, once per PC):**

1. Download [`bookmarks.html`](https://github.com/Rick3saal/system/raw/arena/c719edc7-system/bookmarks.html) from the shared folder.
2. In Chrome/Edge press `Ctrl+Shift+O` (`Cmd+Shift+O` on Mac) to open the Bookmark Manager, click the **⋮** menu → **Import bookmarks**, and select that file.
3. Show the bookmarks bar with `Ctrl+Shift+B` (`Cmd+Shift+B` on Mac). You will see a **📞 BO Quick Actions** bookmark.
4. Open the BO leads list and click that bookmark once. You should see a green/black **“BO Quick Actions ready”** message, the new buttons in the Phone and Email columns, and a ⚙️ at the bottom right. If you don't, tell me — don't assume it worked.
5. Click it once again after every full page reload.

**If importing is not allowed:** open [`bookmarklet.html`](https://github.com/Rick3saal/system/blob/arena/c719edc7-system/bookmarklet.html) and drag the blue button onto the bookmarks bar. If that also fails, right-click the bookmarks bar → **Add page…**, name it `BO Quick Actions`, and paste the whole line from `bookmarklet.txt` into the URL field. If `javascript:` bookmarks are blocked entirely, the README has a DevTools Snippet backup method that needs no bookmark at all.

**If the bookmark does nothing:** right-click it → Edit and check the URL starts with `javascript:`. If it does, import the small [`diagnose-bookmarks.html`](https://github.com/Rick3saal/system/raw/arena/c719edc7-system/diagnose-bookmarks.html) file and click the red **TEST** bookmark on the BO page. A red border + popup means bookmarklets are fine and I can fix the main one; no reaction means the BO site is blocking all bookmarklets and I need to take a different approach. Tell me which result you get.

Notes:
- Nothing is changed on the company's system or database — the buttons only run in your own browser with your own login.
- Settings and template edits are saved per PC, in your browser.
- Test it with one call/email first. If Call or Text does nothing, open ⚙️ and change the RingCentral link to `rcmobile://call?number={number}` / `rcmobile://sms?number={number}` (or `tel:{number}` / `sms:{numberPlus}`), then save.
- The first time Chrome asks **“Open RingCentral?”**, click **Open / Allow**.

---
