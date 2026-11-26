// ==UserScript==
// @name         BO Quick Actions — Call / SMS / Email templates
// @namespace    https://github.com/Rick3saal/system
// @version      1.0.0
// @description  Adds one-click Call, SMS and Email-template buttons to the masked Phone / Email columns of the BO leads list. Reveals the value using the site's own click behaviour, copies it, then hands it to RingCentral or Gmail.
// @author       Internal tooling
// @match        https://bo.travelbusinessclass.com/*
// @match        https://www.bo.travelbusinessclass.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
 * HOW IT WORKS
 * 1. Finds the Phone / Email columns by their column headings, then adds small
 *    buttons inside those cells. It does NOT change the company's website or
 *    its database — everything runs in your own browser.
 * 2. When you press Call / Text / Email, it first simulates the same click you
 *    would make on the masked number/address to reveal it (no bypass: it uses
 *    the site's normal UI and your own logged-in session).
 * 3. It copies the revealed value, then opens the configured RingCentral
 *    deep link (call or SMS) or a Gmail compose window with your template.
 *
 * All settings are stored in this browser only, under localStorage key
 * "bqa_settings_v1". No data is sent anywhere by this script.
 */

(function () {
  'use strict';

  if (window.__bqaLoaded) return;
  window.__bqaLoaded = true;

  var STORE_KEY = 'bqa_settings_v1';

  var DEFAULT_TEMPLATES = [
    {
      name: 'Follow up',
      subject: 'Following up on your travel request',
      body: 'Hi {client},\n\nJust following up on your request. Do you have updated travel dates or anything else I can help with?\n\nBest regards'
    },
    {
      name: 'Quote ready',
      subject: 'Your travel quote is ready',
      body: 'Hi {client},\n\nYour quote is ready. Let me know a good time to go over it and I will walk you through the details.\n\nBest regards'
    },
    {
      name: 'Documents needed',
      subject: 'Documents needed to continue your booking',
      body: 'Hi {client},\n\nCould you please send the required documents so we can continue with your booking?\n\nBest regards'
    },
    {
      name: 'Checking in',
      subject: 'Checking in on your plans',
      body: 'Hi {client},\n\nI wanted to check in and see if you are still planning to travel with us. Happy to help with any changes.\n\nBest regards'
    }
  ];

  var DEFAULTS = {
    countryCode: '1',
    // RingCentral deep links. {number} = E.164 digits, e.g. 16025550123.
    // Other built-in placeholders: {numberPlus} (+16025550123), {raw},
    // {client}, {email}, {id}, {subject}, {body}.
    callUrl: 'rcapp://r/call?number={number}',
    smsUrl: 'rcapp://r/sms?type=new&number={number}',
    copyFirst: true,
    revealTimeoutMs: 2500,
    templates: DEFAULT_TEMPLATES
  };

  var EMAIL_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i;
  var MASK_RE = /[•*…]|\.\.\./;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getSettings() {
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { stored = {}; }
    var out = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      out[key] = Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : DEFAULTS[key];
    });
    if (!Array.isArray(out.templates) || !out.templates.length) out.templates = DEFAULT_TEMPLATES.slice();
    return out;
  }

  function saveSettings(value) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  function hasMask(text) { return MASK_RE.test(String(text || '')); }

  function cellText(cell) {
    return String(cell && cell.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function completeEmail(text) {
    if (hasMask(text)) return null;
    var match = EMAIL_RE.exec(String(text || '').trim());
    return match ? match[1] : null;
  }

  function completePhone(text) {
    if (hasMask(text)) return null;
    var digits = String(text || '').replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 ? String(text).trim() : null;
  }

  // The site may keep the full value in an attribute even while showing ****.
  function valueFromAttributes(cell, kind) {
    var names = ['title', 'data-email', 'data-phone', 'data-value', 'data-original', 'aria-label'];
    for (var i = 0; i < names.length; i++) {
      var raw = cell.getAttribute ? cell.getAttribute(names[i]) : '';
      if (!raw) continue;
      var found = kind === 'email' ? completeEmail(raw) : completePhone(raw);
      if (found) return found;
    }
    var links = cell.querySelectorAll ? cell.querySelectorAll('a[href]') : [];
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href') || '';
      if (kind === 'email' && /^mailto:/i.test(href)) {
        var foundMail = completeEmail(decodeURIComponent(href.replace(/^mailto:/i, '')));
        if (foundMail) return foundMail;
      }
      if (kind === 'phone' && /^tel:/i.test(href)) {
        var foundTel = completePhone(href.replace(/^tel:/i, ''));
        if (foundTel) return foundTel;
      }
    }
    return null;
  }

  function findValue(cell, kind) {
    var text = cellText(cell);
    return (kind === 'email' ? completeEmail(text) : completePhone(text)) || valueFromAttributes(cell, kind);
  }

  // Find the exact element holding the masked text so we click the number /
  // address itself, never the site's phone icon or the row link.
  function findRevealTarget(cell, kind) {
    var walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var text = String(node.nodeValue || '').trim();
      if (!text) continue;
      var parent = node.parentElement;
      if (!parent || parent.closest('.bqa-btn, .bqa-menu, .bqa-settings, script, style')) continue;
      if (kind === 'phone' && /[+0-9(]/.test(text) && /[0-9•*]/.test(text) && text.length < 80) return parent;
      if (kind === 'email' && (text.indexOf('@') > -1 || /[•*]{2,}/.test(text)) && text.length < 120) return parent;
    }
    return cell;
  }

  function nativeClick(element) {
    var types = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
    types.forEach(function (type) {
      var Ctor = /pointer/.test(type) && window.PointerEvent ? window.PointerEvent : window.MouseEvent;
      try {
        element.dispatchEvent(new Ctor(type, {
          bubbles: true, cancelable: true, composed: true, view: window, button: 0, detail: 1
        }));
      } catch (e) {
        try { element.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true })); } catch (ignore) {}
      }
    });
  }

  function reveal(cell, kind, timeout) {
    return new Promise(function (resolve) {
      var value = findValue(cell, kind);
      if (value) return resolve(value);

      var target = findRevealTarget(cell, kind);
      nativeClick(target);

      var started = Date.now();
      function poll(deadline, onTimeout) {
        var found = findValue(cell, kind);
        if (found) return resolve(found);
        if (Date.now() >= deadline) return onTimeout();
        setTimeout(function () { poll(deadline, onTimeout); }, 70);
      }
      poll(Date.now() + (timeout || 2500), function () {
        if (target !== cell) {
          // Some builds reveal only when the whole cell is clicked.
          nativeClick(cell);
          poll(Date.now() + 900, function () { resolve(null); });
        } else {
          resolve(null);
        }
      });
    });
  }

  function normalizePhone(value, countryCode) {
    var raw = String(value || '').trim();
    var hadPlus = /^\+/.test(raw);
    var digits = raw.replace(/\D/g, '');
    if (digits.indexOf('00') === 0) digits = digits.slice(2);
    if (digits.length === 10 && !hadPlus) digits = String(countryCode || '1') + digits;
    return { e164: digits, plus: '+' + digits, raw: raw };
  }

  function fill(template, context) {
    return String(template == null ? '' : template).replace(/\{(\w+)\}/g, function (whole, key) {
      return Object.prototype.hasOwnProperty.call(context, key) ? String(context[key]) : whole;
    });
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { resolve(true); }, function () { fallback(); });
      } else {
        fallback();
      }
      function fallback() {
        try {
          var area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
          document.body.appendChild(area);
          area.focus(); area.select();
          var ok = document.execCommand('copy');
          area.remove();
          resolve(!!ok);
        } catch (e) { resolve(false); }
      }
    });
  }

  // Chrome needs a real navigation (not a popup) for custom URI schemes.
  function openExternal(url) {
    if (!url) return false;
    try {
      var win = (window.parent && window.parent !== window) ? window.parent : window;
      win.location.assign(url);
      return true;
    } catch (e) {
      try {
        var link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(function () { link.remove(); }, 1000);
        return true;
      } catch (e2) { return false; }
    }
  }

  var toastTimer;
  function toast(message, isError) {
    var box = document.getElementById('bqa-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bqa-toast';
      box.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;' +
        'padding:10px 16px;border-radius:8px;background:#111827;color:#fff;font:13px/1.4 Arial,sans-serif;' +
        'box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:min(520px,90vw);text-align:center;pointer-events:none';
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.style.background = isError ? '#7f1d1d' : '#111827';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { if (box.parentNode) box.remove(); }, 3500);
  }

  var menu;
  function closeMenu() {
    if (menu && menu.parentNode) menu.remove();
    menu = null;
  }

  function showMenu(anchor, items) {
    closeMenu();
    menu = document.createElement('div');
    menu.className = 'bqa-menu';
    menu.style.cssText = 'position:fixed;z-index:2147482999;min-width:230px;max-width:340px;' +
      'background:#111827;color:#e5e7eb;border:1px solid #374151;border-radius:10px;' +
      'box-shadow:0 12px 32px rgba(0,0,0,.45);padding:6px;font:13px/1.4 Arial,sans-serif';
    items.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.style.cssText = 'display:block;width:100%;text-align:left;border:0;background:transparent;color:inherit;' +
        'padding:9px 10px;border-radius:6px;cursor:pointer;font:inherit';
      button.addEventListener('mouseenter', function () { button.style.background = '#1f2937'; });
      button.addEventListener('mouseleave', function () { button.style.background = 'transparent'; });
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        closeMenu();
        item.run();
      });
      menu.appendChild(button);
    });
    document.body.appendChild(menu);
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth;
    var height = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + 'px';
    menu.style.top = (rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6)) + 'px';
  }

  document.addEventListener('click', function (event) {
    if (menu && !menu.contains(event.target) && !event.target.closest('.bqa-btn')) closeMenu();
  }, true);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });

  function headerMap() {
    var rows = document.querySelectorAll('tr, [role="row"]');
    for (var r = 0; r < Math.min(rows.length, 5); r++) {
      var cells = rows[r].querySelectorAll('th, td, [role="columnheader"], [role="cell"]');
      var map = {};
      for (var c = 0; c < cells.length; c++) {
        var label = cellText(cells[c]).toLowerCase();
        if (/^phone$|phone\s*\/\s*spgs/.test(label)) map.phone = c;
        if (/^e-?mail$/.test(label)) map.email = c;
        if (/^client$/.test(label)) map.client = c;
        if (/^#|^id$/.test(label)) map.id = c;
      }
      if (map.phone != null || map.email != null) return map;
    }
    return {};
  }

  function rowCells(row) {
    return row.querySelectorAll('td, [role="cell"]');
  }

  function rowContext(cell, map) {
    var row = cell.closest('tr, [role="row"]');
    if (!row) return {};
    var cells = rowCells(row);
    return {
      client: map.client != null && cells[map.client] ? cellText(cells[map.client]) : '',
      id: map.id != null && cells[map.id] ? cellText(cells[map.id]) : ''
    };
  }

  function svg(name) {
    var paths = {
      call: '<path d="M6.6 10.8a15 15 0 0 0 5.5 5.5l1.6-1.6c.4-.4.9-.5 1.4-.3 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.9 21 3 14.1 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.5 0 1-.4 1.3L6.6 10.8z"/>',
      sms: '<path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>',
      mail: '<path d="M2 5h20v14H2z"/><path d="m2 6 10 7 10-7" fill="none" stroke="currentColor" stroke-width="2" fill-opacity="0"/>',
      copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V4h12" fill="none" stroke="currentColor" stroke-width="2"/>',
      gear: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4 2 1.6-2 3.4-2.4-.8a8 8 0 0 1-1.7 1L16.6 20h-4l-.4-2.8a8 8 0 0 1-1.7-1l-2.4.8-2-3.4L8.2 12l-2-1.6 2-3.4 2.4.8a8 8 0 0 1 1.7-1L12.7 4h4l.4 2.8a8 8 0 0 1 1.7 1l2.4-.8 2 3.4-2.2 2.6z"/>'
    };
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">' + paths[name] + '</svg>';
  }

  function makeButton(kind, title, color, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bqa-btn';
    button.title = title;
    button.setAttribute('aria-label', title);
    button.innerHTML = svg(kind);
    button.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;' +
      'padding:0;margin:0 2px 0 0;border:1px solid ' + color + ';border-radius:6px;' +
      'background:rgba(255,255,255,.08);color:' + color + ';cursor:pointer;vertical-align:middle;' +
      'line-height:1;box-shadow:none;transition:background .12s ease';
    button.addEventListener('mouseenter', function () { button.style.background = color; button.style.color = '#0b1220'; });
    button.addEventListener('mouseleave', function () { button.style.background = 'rgba(255,255,255,.08)'; button.style.color = color; });
    ['pointerdown', 'mousedown', 'dblclick'].forEach(function (type) {
      button.addEventListener(type, function (event) { event.stopPropagation(); });
    });
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      onClick(button);
    });
    return button;
  }

  function runAction(cell, kind, map, options) {
    options = options || {};
    var settings = getSettings();
    // Open the Gmail tab now, while the click is still a real user gesture.
    var mailWindow = kind === 'email' && options.compose !== false ? window.open('', '_blank') : null;

    reveal(cell, kind, settings.revealTimeoutMs).then(function (value) {
      if (!value) {
        if (mailWindow) mailWindow.close();
        toast('Could not reveal the ' + (kind === 'email' ? 'email' : 'number') +
          '. Click the ' + (kind === 'email' ? 'address' : 'number') + ' once by hand, then try again.', true);
        return;
      }

      var row = rowContext(cell, map);
      var phone = kind === 'phone' ? normalizePhone(value, settings.countryCode) : null;
      var context = {
        number: phone ? phone.e164 : '',
        numberPlus: phone ? phone.plus : '',
        raw: value,
        email: kind === 'email' ? value : '',
        client: row.client || '',
        id: row.id || ''
      };

      if (settings.copyFirst) {
        copyText(phone ? phone.plus : value).then(function (ok) {
          toast(ok ? 'Copied ' + value : 'Revealed ' + value + ' (clipboard was blocked — copy it manually)');
        });
      }

      if (kind === 'phone') {
        if (!options.copyOnly) {
          var uri = fill(settings[options.sms ? 'smsUrl' : 'callUrl'], context);
          if (!openExternal(uri)) toast('Browser blocked the RingCentral link. The number is on your clipboard.', true);
        }
        return;
      }

      var template = options.template;
      context.subject = template ? fill(template.subject, context) : '';
      context.body = template ? fill(template.body, context) : '';

      var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(value) +
        '&su=' + encodeURIComponent(context.subject) +
        '&body=' + encodeURIComponent(context.body);
      if (mailWindow) {
        try { mailWindow.location.href = gmail; } catch (e) { window.open(gmail, '_blank'); }
      } else {
        window.open(gmail, '_blank');
      }
    });
  }

  function decorate(cell, map) {
    var wrapper = document.createElement('span');
    wrapper.className = 'bqa-actions';
    wrapper.style.cssText = 'display:inline-flex;align-items:center;vertical-align:middle;margin-left:8px;white-space:nowrap';

    wrapper.appendChild(makeButton('copy', 'Copy the revealed number', '#93c5fd', function (button) {
      runAction(cell, 'phone', map, { copyOnly: true });
    }));
    wrapper.appendChild(makeButton('call', 'Call in RingCentral', '#4ade80', function (button) {
      runAction(cell, 'phone', map, {});
    }));
    wrapper.appendChild(makeButton('sms', 'Text in RingCentral', '#facc15', function (button) {
      runAction(cell, 'phone', map, { sms: true });
    }));

    cell.appendChild(wrapper);
    cell.setAttribute('data-bqa-done', '1');
  }

  function decorateEmail(cell, map) {
    var wrapper = document.createElement('span');
    wrapper.className = 'bqa-actions';
    wrapper.style.cssText = 'display:inline-flex;align-items:center;vertical-align:middle;margin-left:8px;white-space:nowrap';

    wrapper.appendChild(makeButton('mail', 'Email templates', '#f87171', function (button) {
      var settings = getSettings();
      var items = settings.templates.map(function (template) {
        return { label: template.name, run: function () { runAction(cell, 'email', map, { template: template }); } };
      });
      items.push({
        label: 'Copy email address only',
        run: function () { runAction(cell, 'email', map, { compose: false }); }
      });
      showMenu(button, items);
    }));
    wrapper.appendChild(makeButton('copy', 'Copy the revealed email', '#93c5fd', function (button) {
      runAction(cell, 'email', map, { compose: false });
    }));

    cell.appendChild(wrapper);
    cell.setAttribute('data-bqa-done', '1');
  }

  function inject() {
    var map = headerMap();
    if (map.phone == null && map.email == null) return;

    var rows = document.querySelectorAll('tr, [role="row"]');
    for (var i = 0; i < rows.length; i++) {
      var cells = rowCells(rows[i]);
      if (!cells.length || cells[0].querySelector('th')) continue;

      if (map.phone != null) {
        var phoneCell = cells[map.phone];
        if (phoneCell && !phoneCell.hasAttribute('data-bqa-done') &&
            /[+0-9(•*]/.test(cellText(phoneCell))) decorate(phoneCell, map);
      }
      if (map.email != null) {
        var emailCell = cells[map.email];
        if (emailCell && !emailCell.hasAttribute('data-bqa-done') &&
            (/@/.test(cellText(emailCell)) || hasMask(cellText(emailCell)))) decorateEmail(emailCell, map);
      }
    }
  }

  var scheduled = false;
  function scheduleInject() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; inject(); });
  }

  function settingsPanel() {
    var panel = document.createElement('div');
    panel.className = 'bqa-settings';
    panel.style.cssText = 'position:fixed;right:16px;bottom:60px;z-index:2147482998;width:min(520px,calc(100vw - 32px));' +
      'max-height:calc(100vh - 90px);overflow:auto;background:#111827;color:#e5e7eb;border:1px solid #374151;' +
      'border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.5);padding:18px;font:13px/1.5 Arial,sans-serif';
    var s = getSettings();
    var templateLines = s.templates.map(function (t) {
      return t.name + ' | ' + t.subject + ' | ' + t.body.split('\n').join('\\n');
    }).join('\n');

    panel.innerHTML =
      '<h2 style="margin:0 0 4px;font-size:16px">BO Quick Actions — settings</h2>' +
      '<p style="margin:0 0 14px;color:#9ca3af">Saved in this browser only. Use <code>\\n</code> for a new line in an email body.</p>' +
      '<label style="display:block;margin-bottom:10px">Country code for 10-digit numbers' +
      '<input id="bqa-country" value="' + esc(s.countryCode) + '" style="width:100%;box-sizing:border-box;margin-top:4px;padding:7px;background:#1f2937;color:#fff;border:1px solid #374151;border-radius:6px"></label>' +
      '<label style="display:block;margin-bottom:10px">Call link' +
      '<input id="bqa-call" value="' + esc(s.callUrl) + '" style="width:100%;box-sizing:border-box;margin-top:4px;padding:7px;background:#1f2937;color:#fff;border:1px solid #374151;border-radius:6px"></label>' +
      '<label style="display:block;margin-bottom:10px">SMS link' +
      '<input id="bqa-sms" value="' + esc(s.smsUrl) + '" style="width:100%;box-sizing:border-box;margin-top:4px;padding:7px;background:#1f2937;color:#fff;border:1px solid #374151;border-radius:6px"></label>' +
      '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px">' +
      '<input type="checkbox" id="bqa-copy"' + (s.copyFirst ? ' checked' : '') + '> Copy number/email before opening the app</label>' +
      '<label style="display:block;margin-bottom:6px">Email templates — one per line: <b>Name | Subject | Body</b></label>' +
      '<textarea id="bqa-templates" rows="10" style="width:100%;box-sizing:border-box;padding:8px;background:#1f2937;color:#fff;border:1px solid #374151;border-radius:6px;font:12px/1.5 monospace">' + esc(templateLines) + '</textarea>' +
      '<p style="color:#9ca3af;margin:8px 0 14px">Placeholders: <code>{client}</code>, <code>{email}</code>, <code>{number}</code>, <code>{numberPlus}</code>, <code>{id}</code></p>' +
      '<div style="display:flex;gap:8px">' +
      '<button id="bqa-save" style="flex:1;padding:9px;border:0;border-radius:6px;background:#2563eb;color:#fff;cursor:pointer;font-weight:bold">Save</button>' +
      '<button id="bqa-reset" style="padding:9px 12px;border:1px solid #4b5563;border-radius:6px;background:transparent;color:#e5e7eb;cursor:pointer">Reset</button>' +
      '<button id="bqa-close" style="padding:9px 12px;border:1px solid #4b5563;border-radius:6px;background:transparent;color:#e5e7eb;cursor:pointer">Close</button>' +
      '</div>';

    function parseTemplates(text) {
      return String(text || '').split('\n').map(function (line) {
        if (!line.trim()) return null;
        var parts = line.split('|');
        return {
          name: (parts[0] || 'Template').trim(),
          subject: (parts[1] || '').trim(),
          body: (parts.slice(2).join('|') || '').trim().split('\\n').join('\n')
        };
      }).filter(Boolean);
    }

    panel.querySelector('#bqa-save').addEventListener('click', function () {
      var next = {
        countryCode: panel.querySelector('#bqa-country').value.trim(),
        callUrl: panel.querySelector('#bqa-call').value.trim(),
        smsUrl: panel.querySelector('#bqa-sms').value.trim(),
        copyFirst: panel.querySelector('#bqa-copy').checked,
        revealTimeoutMs: s.revealTimeoutMs,
        templates: parseTemplates(panel.querySelector('#bqa-templates').value)
      };
      if (!next.templates.length) next.templates = DEFAULT_TEMPLATES.slice();
      saveSettings(next);
      panel.remove();
      toast('Quick Actions settings saved');
    });
    panel.querySelector('#bqa-reset').addEventListener('click', function () {
      saveSettings(DEFAULTS);
      panel.remove();
      toast('Settings reset to defaults');
    });
    panel.querySelector('#bqa-close').addEventListener('click', function () { panel.remove(); });
    return panel;
  }

  function addGear() {
    var gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'bqa-btn';
    gear.title = 'BO Quick Actions settings';
    gear.innerHTML = svg('gear');
    gear.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147482998;width:36px;height:36px;' +
      'border:1px solid #60a5fa;border-radius:50%;background:#111827;color:#60a5fa;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4)';
    gear.addEventListener('click', function (event) {
      event.stopPropagation();
      var existing = document.querySelector('.bqa-settings');
      if (existing) { existing.remove(); return; }
      closeMenu();
      document.body.appendChild(settingsPanel());
    });
    document.body.appendChild(gear);
  }

  function start() {
    inject();
    addGear();
    toast('BO Quick Actions ready — use ⚙️ to edit email templates');
    if (window.MutationObserver) {
      new MutationObserver(scheduleInject).observe(document.body, { childList: true, subtree: true });
    }
    // Safety net for pages that swap rows without triggering DOM mutations we see.
    setInterval(scheduleInject, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
