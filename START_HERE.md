# START HERE — do these steps in order

## FIRST — the simplest test (no downloads)

Do this test before anything else. It takes one minute.

1. Show the bookmarks bar: press **Ctrl+Shift+B** (Mac: **Cmd+Shift+B**).
2. **Right-click** on an empty part of the bookmarks bar → click **Add page…** (or **Add bookmark…**).
3. In the **Name** box type: `TEST`
4. In the **URL** box, **type this exactly** (type it, don't paste):

   `javascript:alert('HI')`

5. Click **Save**. A bookmark called **TEST** appears in the bookmarks bar.
6. Click your BO leads tab, then click the **TEST** bookmark once.

**Tell me which one happened:**
- A popup appeared saying **HI** → bookmarks work; the earlier file just didn't save correctly. Tell me and I'll give you the fixed steps.
- **Nothing happened** → the BO site is blocking these bookmarks. Tell me and I'll give you the next solution (no more bookmark tests).

---

## PART 1 — Test if this computer allows the bookmark at all (older method)

### Step 1

In your Chrome, open this link:

https://github.com/Rick3saal/system/blob/arena/c719edc7-system/diagnose.html

### Step 2

On the GitHub page, look at the top-right area of the code box and click the word **Raw**.

(If you see a download icon instead, click that. Either way, you want to save the file.)

### Step 3

The browser now shows plain text. Press **Ctrl+S** (Mac: **Cmd+S**).

Save it to your Desktop with this exact name:

`diagnose.html`

Make sure it ends with `.html`, not `.txt`. If Chrome saves it as `diagnose.txt`, rename it to `diagnose.html`.

### Step 4

Close the GitHub tab. Find `diagnose.html` on your Desktop and **double-click it**. It opens in Chrome. You should see a page with a big red button that says **🧪 TEST bookmarklet**.

### Step 5

Show your bookmarks bar: press **Ctrl+Shift+B** (Mac: **Cmd+Shift+B**). A row of bookmarks appears under the address bar.

### Step 6

Click and **drag the big red TEST button** from the page up into that bookmarks bar. Let go. A new **TEST bookmarklet** bookmark appears there.

### Step 7

Click the BO tab at the top (the tab with the leads list, the one from your screenshot).

### Step 8

Click the new **TEST bookmarklet** in the bookmarks bar **once**.

### Step 9 — tell me what happened

- **The page got a thick red border and a popup said “BOOKMARKLET OK”** → the test passed. Go to Part 2.
- **Nothing happened at all** → STOP. Send me a message saying “test did nothing”. Do not do Part 2.

---

## PART 2 — only do this if Part 1 passed

### Step 10

Open this link:

https://github.com/Rick3saal/system/blob/arena/c719edc7-system/bookmarks.html

### Step 11

Click **Raw**, press **Ctrl+S**, and save it to your Desktop with this exact name:

`bookmarks.html`

### Step 12

In Chrome press **Ctrl+Shift+O**. The Bookmark Manager opens.

Click the **three dots (⋮)** in the top-right corner → **Import bookmarks** → choose the `bookmarks.html` file from your Desktop.

### Step 13

A bookmark called **📞 BO Quick Actions** appears in the bookmarks bar. If the bar is hidden, press **Ctrl+Shift+B**.

### Step 14

Stay on the BO leads page and click the **📞 BO Quick Actions** bookmark once.

You should see:

- a message at the bottom saying **“BO Quick Actions ready”**
- small green / yellow / red / blue buttons in the Phone and Email columns
- a **⚙️** button in the bottom-right corner

### Step 15

Click that bookmark **once after every full page reload**. When you just change filters inside BO, you do not need to click it again.

---

## If Part 2 does not show the buttons

Right-click the **📞 BO Quick Actions** bookmark → **Edit**. Look at the URL field.

- If it starts with `javascript:` → send me a screenshot of that edit window.
- If it does NOT start with `javascript:` → delete that bookmark and repeat Steps 10–13 using the file again.
