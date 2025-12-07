const RES_BASE = "/res";
const typewriterPhrases = [
  "modded survival (and vanilla survival soon) world to have fun in!",
  "try not to be a nuisance while playing...",
  "multiple worlds (hopefully coming soon!!) "
];


function startTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = typewriterPhrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      if (charIndex >= phrase.length + 8) {
        deleting = true;
      }
    } else {
      charIndex--;
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      }
    }

    el.textContent = phrase.slice(0, Math.max(0, charIndex));
    setTimeout(tick, deleting ? 40 : 70);
  };

  tick();
}

function setupCopyIP() {
  const btn = document.getElementById("copy-ip-btn");
  const ipSpan = document.getElementById("server-ip");
  const status = document.getElementById("copy-status");

  if (!btn || !ipSpan || !status) return;

  btn.addEventListener("click", async () => {
    try {
      const ip = ipSpan.textContent.trim();
      if (navigator.clipboard && ip) {
        await navigator.clipboard.writeText(ip);
        status.classList.add("visible");
        setTimeout(() => status.classList.remove("visible"), 900);
      }
    } catch (err) {
      console.error("Failed to copy IP:", err);
    }
  });
}

function setupRevealOnScroll() {
  const revealEls = document.querySelectorAll(".reveal:not(.reveal-bound)");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach(el => {
      el.classList.add("visible", "reveal-bound");
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    {
      root: null,
      threshold: 0.15
    }
  );

  revealEls.forEach(el => {
    el.classList.add("reveal-bound");
    observer.observe(el);
  });
}


function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}


function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function setYear() {
  const span = document.getElementById("year");
  if (span) {
    span.textContent = new Date().getFullYear();
  }
}

function setupAccordionInteractions(root = document) {
  const headers = root.querySelectorAll(".accordion-header");
  headers.forEach(header => {
    if (header.dataset.accordionBound === "1") return;
    header.dataset.accordionBound = "1";

    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      if (!item) return;
      item.classList.toggle("open");
    });
  });
}


function loadRulesIfNeeded() {
  const root = document.getElementById("rules-content");
  if (!root) return;

  fetch(`${RES_BASE}/rules.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load rules.json");
      return res.json();
    })
    .then(data => {
      renderRulesFromJSON(data, root);
      setupRevealOnScroll();
      setupAccordionInteractions(root);
    })
    .catch(err => {
      console.error(err);
      root.innerHTML =
        "<p class='content-error'>Could not load rules. Please try again later or contact a staff member.</p>";
    });
}


function renderRulesFromJSON(data, root) {
  const meta = data.meta || {};
  const sections = data.sections || [];

  const updatedEl = document.getElementById("rules-last-updated");
  const appliesEl = document.getElementById("rules-applies-to");

  if (updatedEl && meta.lastUpdated) {
    updatedEl.textContent = meta.lastUpdated;
  }
  if (appliesEl && meta.appliesTo) {
    appliesEl.textContent = meta.appliesTo;
  }

  const nav = document.getElementById("rules-nav");
  if (nav) nav.innerHTML = "";
  root.innerHTML = "";

  sections.forEach((section, sIndex) => {
    const sectionId = section.id || `rules-section-${sIndex + 1}`;
    const sectionNumber = section.number || sIndex + 1;
    const sectionTitle = section.title || `Section ${sectionNumber}`;
    const rules = section.rules || [];

    if (nav) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${sectionId}`;
      a.textContent = `${sectionNumber}. ${sectionTitle}`;
      li.appendChild(a);
      nav.appendChild(li);
    }

    const article = document.createElement("article");
    article.className = "rules-section reveal";
    article.id = sectionId;

    const h2 = document.createElement("h2");
    h2.textContent = `${sectionNumber}. ${sectionTitle}`;
    article.appendChild(h2);

    const list = document.createElement("ol");
    list.className = "rules-list";

    rules.forEach((rule, rIndex) => {
      const item = document.createElement("li");
      item.className = "accordion-item rule-item open";

      const header = document.createElement("button");
      header.type = "button";
      header.className = "accordion-header";

      const titleSpan = document.createElement("span");
      titleSpan.className = "rule-title";
      titleSpan.textContent = rule.title || `Rule ${sectionNumber}.${rIndex + 1}`;

      const toggleSpan = document.createElement("span");
      toggleSpan.className = "accordion-toggle";
      toggleSpan.innerHTML = "▾";

      header.appendChild(titleSpan);
      header.appendChild(toggleSpan);

      const bodyDiv = document.createElement("div");
      bodyDiv.className = "accordion-body";
      bodyDiv.textContent =
        rule.body ||
        "This rule has no description yet. Ask a staff member if you are unsure what it means.";

      item.appendChild(header);
      item.appendChild(bodyDiv);
      list.appendChild(item);
    });

    article.appendChild(list);
    root.appendChild(article);
  });
}


function loadAnnouncementsIfNeeded() {
  const listRoot = document.getElementById("announcements-list");
  const modalRoot = document.getElementById("announcement-modal");

  if (!listRoot && !modalRoot) return;

  fetch(`${RES_BASE}/announcements.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load announcements.json");
      return res.json();
    })
    .then(data => {
      if (listRoot) {
        renderAnnouncementsFromJSON(data, listRoot);
        setupRevealOnScroll();
      }
      if (modalRoot) {
        maybeShowAnnouncementModal(data);
      }
    })
    .catch(err => {
      console.error(err);
      if (listRoot) {
        listRoot.innerHTML =
          "<p class='content-error'>Could not load announcements. Please try again later.</p>";
      }
    });
}


function renderAnnouncementsFromJSON(data, root) {
  const items = (data && data.announcements) ? [...data.announcements] : [];
  if (!items.length) {
    root.innerHTML = "<p class='content-lead'>No announcements right now. Check back later!</p>";
    return;
  }

  items.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  root.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "announcement-card reveal";

    const header = document.createElement("div");
    header.className = "announcement-header";

    if (item.pinned) {
      const badge = document.createElement("span");
      badge.className = "announcement-badge";
      badge.textContent = "Pinned";
      header.appendChild(badge);
    }

    const dateEl = document.createElement("span");
    dateEl.className = "announcement-date";
    dateEl.textContent = formatAnnouncementDateLabel(item);

    header.appendChild(dateEl);
    card.appendChild(header);

    const title = document.createElement("h2");
    title.className = "announcement-title";
    title.textContent = item.title || "Announcement";
    card.appendChild(title);

    if (item.summary) {
      const summary = document.createElement("p");
      summary.className = "announcement-summary";
      summary.textContent = item.summary;
      card.appendChild(summary);
    }

    if (item.body) {
      const body = document.createElement("p");
      body.className = "announcement-body";
      body.textContent = item.body;
      card.appendChild(body);
    }

    root.appendChild(card);
  });
}

function maybeShowAnnouncementModal(data) {
  const modal = document.getElementById("announcement-modal");
  if (!modal) return;

  const items = (data && data.announcements) || [];
  if (!items.length) return;

  const urgent = items.filter(a => a.showOnHomeModal);
  if (!urgent.length) return;

  const now = new Date();


  const contexts = [];
  for (const item of urgent) {
    const ctx = getAnnouncementWindowContext(item, now);
    if (ctx && ctx.inWindow) {
      contexts.push(ctx);
    }
  }
  if (!contexts.length) return;

  const todayKey = new Date().toISOString().slice(0, 10);


  const queue = [];
  for (const ctx of contexts) {
    const id = ctx.item.id || "default";
    const dismissKey = `cbhs_modal_dismiss_${id}_${todayKey}`;
    if (!window.localStorage || localStorage.getItem(dismissKey) !== "1") {
      queue.push({ ...ctx, dismissKey });
    }
  }
  if (!queue.length) return;


  queue.sort((a, b) => {
    if (a.item.pinned && !b.item.pinned) return -1;
    if (!a.item.pinned && b.item.pinned) return 1;
    const da = a.eventDate ? a.eventDate.getTime() : 0;
    const db = b.eventDate ? b.eventDate.getTime() : 0;
    return da - db;
  });

  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");
  const metaEl = document.getElementById("modal-meta");
  const badgeEl = document.getElementById("modal-badge");
  const closeBtn = document.getElementById("modal-close-btn");
  const okBtn = document.getElementById("modal-ok-btn");
  const dismissTodayBtn = document.getElementById("modal-dismiss-today");

  let currentIndex = 0;

  function showAt(index) {
    if (index >= queue.length) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      return;
    }

    const { item, eventDate, dismissKey } = queue[index];

    if (titleEl) titleEl.textContent = item.title || "Announcement";
    if (bodyEl) bodyEl.textContent = item.body || item.summary || "";
    if (metaEl) {
      if (eventDate) {
        metaEl.textContent = "When: " + formatShortDateTime(eventDate);
      } else {
        metaEl.textContent = "";
      }
    }
    if (badgeEl) {
      badgeEl.textContent = item.level === "warning" ? "Maintenance" : "Announcement";
    }

    const hideAndNext = (dismissToday) => {
      if (dismissToday && window.localStorage && dismissKey) {
        localStorage.setItem(dismissKey, "1");
      }
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      showAt(index + 1);
    };

    if (closeBtn) closeBtn.onclick = () => hideAndNext(false);
    if (okBtn) okBtn.onclick = () => hideAndNext(false);
    if (dismissTodayBtn) dismissTodayBtn.onclick = () => hideAndNext(true);

    modal.onclick = (e) => {
      if (e.target === modal) hideAndNext(false);
    };

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  showAt(0);
}

function getAnnouncementWindowContext(item, now) {
  if (item.weekly) {
    const weekly = item.weekly;
    const eventDate = nextWeeklyOccurrence(weekly, now);
    const windowMinutes =
      typeof weekly.windowMinutes === "number" ? weekly.windowMinutes : 240;
    const diffMinutes = (eventDate - now) / 60000;
    const inWindow = diffMinutes >= 0 && diffMinutes <= windowMinutes;
    return { item, eventDate, inWindow };
  } else {
    const res = oneTimeAnnouncementWindow(item, now);
    return { item, eventDate: res.eventDate, inWindow: res.inWindow };
  }
}

function oneTimeAnnouncementWindow(item, now) {
  const fromStr = item.modalFrom || item.date;
  const untilStr = item.modalUntil || null;
  let inWindow = false;
  let eventDate = null;

  if (item.date) {
    const d = new Date(item.date);
    if (!isNaN(d)) eventDate = d;
  }

  if (fromStr) {
    const from = new Date(fromStr);
    const until = untilStr ? new Date(untilStr) : null;
    if (!isNaN(from)) {
      if (!until || isNaN(until)) {
        inWindow = now >= from;
      } else {
        inWindow = now >= from && now <= until;
      }
    }
  }

  return { inWindow, eventDate };
}


function loadUpdatesIfNeeded() {
  const root = document.getElementById("updates-list");
  if (!root) return;

  fetch(`${RES_BASE}/updates.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load updates.json");
      return res.json();
    })
    .then(data => {
      renderUpdatesFromJSON(data, root);
      setupRevealOnScroll();
    })
    .catch(err => {
      console.error(err);
      root.innerHTML =
        "<p class='content-error'>Could not load updates. Please try again later.</p>";
    });
}


function renderUpdatesFromJSON(data, root) {
  const updates = (data && data.updates) ? [...data.updates] : [];
  if (!updates.length) {
    root.innerHTML = "<p class='content-lead'>No updates logged yet.</p>";
    return;
  }

  updates.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  root.innerHTML = "";

  updates.forEach(update => {
    const card = document.createElement("article");
    card.className = "update-card reveal";

    const header = document.createElement("div");
    header.className = "update-header";

    if (update.version) {
      const versionEl = document.createElement("span");
      versionEl.className = "update-version";
      versionEl.textContent = update.version;
      header.appendChild(versionEl);
    }

    const dateEl = document.createElement("span");
    dateEl.className = "update-date";
    if (update.date) {
      dateEl.textContent = formatShortDateTime(new Date(update.date));
    }
    header.appendChild(dateEl);

    card.appendChild(header);

    const titleEl = document.createElement("h2");
    titleEl.className = "update-title";
    titleEl.textContent = update.title || "Update";
    card.appendChild(titleEl);

    if (update.summary) {
      const summaryEl = document.createElement("p");
      summaryEl.className = "update-summary";
      summaryEl.textContent = update.summary;
      card.appendChild(summaryEl);
    }

    const changes = update.changes || [];
    if (changes.length) {
      const list = document.createElement("ul");
      list.className = "update-changes";
      changes.forEach(change => {
        const li = document.createElement("li");
        li.textContent = change;
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    root.appendChild(card);
  });
}


function loadVotingIfNeeded() {
  const card = document.getElementById("vote-card");
  if (!card) return;

  fetch(`${RES_BASE}/vote.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load vote.json");
      return res.json();
    })
    .then(data => {
      renderVoteFromJSON(data);
    })
    .catch(err => {
      console.error(err);
      const descEl = document.getElementById("vote-description");
      const noteEl = document.getElementById("vote-note");
      if (descEl) {
        descEl.textContent = "Could not load voting info. Please try again later.";
      }
      if (noteEl) {
        noteEl.textContent = "";
      }
    });
}


function renderVoteFromJSON(data) {
  const title = data.title || "CBHS Minecraft Server Voting";
  const desc =
    data.description ||
    "Use these polls to vote on events, features, and other server decisions.";
  const polls = data.polls || [];

  const titleEl = document.getElementById("vote-title");
  const descEl = document.getElementById("vote-description");
  const pollsRoot = document.getElementById("vote-polls");
  const noteEl = document.getElementById("vote-note");

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (!pollsRoot) return;

  pollsRoot.innerHTML = "";

  if (!polls.length) {
    if (noteEl) {
      noteEl.textContent = "No available polls right now. Check back later.";
    }
    return;
  }

  let openCount = 0;

  polls.forEach((poll, index) => {
    const isOpen = !!poll.open;
    if (isOpen) openCount++;

    const wrapper = document.createElement("article");
    wrapper.className = "vote-poll-card";

    const header = document.createElement("div");
    header.className = "vote-header-line";

    const nameEl = document.createElement("h3");
    nameEl.className = "vote-poll-title";
    nameEl.textContent = poll.label || `Poll ${index + 1}`;
    header.appendChild(nameEl);

    const statusEl = document.createElement("span");
    statusEl.className = "vote-status";
    statusEl.textContent = isOpen ? "Open" : "Closed";
    statusEl.classList.toggle("vote-status-open", isOpen);
    statusEl.classList.toggle("vote-status-closed", !isOpen);
    header.appendChild(statusEl);

    wrapper.appendChild(header);

    if (poll.description) {
      const descP = document.createElement("p");
      descP.className = "vote-poll-desc";
      descP.textContent = poll.description;
      wrapper.appendChild(descP);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary";
    btn.textContent = "Go to Google Form";
    const url = poll.formUrl || "#";
    btn.disabled = !isOpen || !url || url === "#";
    btn.addEventListener("click", () => {
      if (!btn.disabled) {
        window.location.href = url;
      }
    });

    wrapper.appendChild(btn);

    const noteP = document.createElement("p");
    noteP.className = "vote-poll-note";

    const autoSeconds =
      typeof poll.autoRedirectSeconds === "number" ? poll.autoRedirectSeconds : 0;

    if (isOpen && autoSeconds > 0 && url && url !== "#" && openCount === 1 && index === 0) {
      noteP.textContent = `You will be redirected in about ${autoSeconds} seconds…`;
      setTimeout(() => {
        window.location.href = url;
      }, autoSeconds * 1000);
    } else if (!isOpen) {
      noteP.textContent = "This poll is closed.";
    }

    wrapper.appendChild(noteP);

    pollsRoot.appendChild(wrapper);
  });

  if (noteEl) {
    if (openCount === 0) {
      noteEl.textContent = "No available polls right now. All polls are currently closed.";
    } else {
      noteEl.textContent = "";
    }
  }
}

function loadPlayersIfNeeded() {
  const listRoot = document.getElementById("players-list");
  if (!listRoot) return; 

  const switchRoot = document.getElementById("players-server-switch");

  fetch(`${RES_BASE}/players.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load players.json");
      return res.json();
    })
    .then(data => {
      const servers = data.servers || [];
      const players = data.players || [];
      setupPlayersUI(servers, players, switchRoot, listRoot);
      setupRevealOnScroll();
    })
    .catch(err => {
      console.error(err);
      listRoot.innerHTML =
        "<p class='content-error'>Could not load players list. Please try again later.</p>";
    });
}

function setupPlayersUI(servers, players, switchRoot, listRoot) {
  if (!switchRoot) return;

  const state = {
    servers,
    allPlayers: players,
    activeServerId:
      servers.find(s => s.default)?.id ||
      servers[0]?.id ||
      "all"
  };

  switchRoot.innerHTML = "";

  const options = [{ id: "all", name: "All Servers" }, ...servers];

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "players-server-btn";
    btn.textContent = option.name;
    btn.dataset.serverId = option.id;

    if (option.id === state.activeServerId) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      state.activeServerId = option.id;
      updatePlayersUI(state, switchRoot, listRoot);
    });

    switchRoot.appendChild(btn);
  });

  updatePlayersUI(state, switchRoot, listRoot);
}

function updatePlayersUI(state, switchRoot, listRoot) {
  const { servers, allPlayers, activeServerId } = state;

  switchRoot.querySelectorAll(".players-server-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.serverId === activeServerId);
  });

  const filtered = allPlayers.filter(player => {
    const serverList = Array.isArray(player.servers)
      ? player.servers
      : player.servers
      ? [player.servers]
      : [];

    if (activeServerId === "all" || !activeServerId) return true;
    return serverList.includes(activeServerId);
  });

  renderPlayerCards(filtered, listRoot);
}

function renderPlayerCards(players, root) {
  root.innerHTML = "";

  if (!players.length) {
    root.innerHTML = "<p class='content-lead'>No players found for this server yet.</p>";
    return;
  }

  players.forEach(p => {
    const card = document.createElement("article");
    card.className = "player-card reveal";

    const img = document.createElement("img");
    img.className = "player-avatar";
    img.alt = `Head of ${p.username}`;
    img.loading = "lazy";
    img.src = `https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/48`;

    const main = document.createElement("div");
    main.className = "player-main";

    const line1 = document.createElement("div");
    line1.className = "player-line";

    const nameEl = document.createElement("span");
    nameEl.className = "player-name";
    nameEl.textContent = p.firstName || p.username;

    const userEl = document.createElement("span");
    userEl.className = "player-username";
    userEl.textContent = `@${p.username}`;

    line1.appendChild(nameEl);
    line1.appendChild(userEl);
    main.appendChild(line1);

    if (p.pronouns) {
      const pronounsEl = document.createElement("span");
      pronounsEl.className = "player-pronouns";
      pronounsEl.textContent = p.pronouns;
      main.appendChild(pronounsEl);
    }

    card.appendChild(img);
    card.appendChild(main);

    root.appendChild(card);
  });

  setupRevealOnScroll();
}


function loadStatusIfNeeded() {
  const pillEl = document.getElementById("status-pill");
  const dotEl = document.getElementById("status-dot");
  const labelEl = document.getElementById("status-label");
  const countEl = document.getElementById("fake-player-count");
  const tagEl = document.getElementById("status-tag");
  const seasonEl = document.getElementById("status-season");
  const totalEl = document.getElementById("status-total-players");
  const motdEl = document.getElementById("status-motd");


  if (
    !pillEl &&
    !dotEl &&
    !labelEl &&
    !countEl &&
    !tagEl &&
    !seasonEl &&
    !totalEl &&
    !motdEl
  ) return;

  fetch(`${RES_BASE}/status.json`, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load status.json");
      return res.json();
    })
    .then(data => {
      const baseStatus = (data.status || "").toLowerCase();
      const label = data.label || inferStatusLabel(baseStatus);
      const playersOnline =
        typeof data.playersOnline === "number" ? data.playersOnline : null;
      const maxPlayers =
        typeof data.maxPlayers === "number" ? data.maxPlayers : null;

      if (pillEl) applyStatusPill(pillEl, baseStatus);
      if (dotEl) applyStatusDot(dotEl, baseStatus);
      if (labelEl) labelEl.textContent = label;

      if (countEl) {
        if (playersOnline !== null && maxPlayers !== null) {
          countEl.textContent = `${playersOnline} / ${maxPlayers}`;
        } else if (playersOnline !== null) {
          countEl.textContent = `${playersOnline} online`;
        } else {
          countEl.textContent = "-- / --";
        }
      }

      if (tagEl) {
        tagEl.textContent = statusTagText(baseStatus);
      }

      if (seasonEl && data.snapshot && data.snapshot.season) {
        seasonEl.textContent = data.snapshot.season;
      }

      if (
        totalEl &&
        data.snapshot &&
        typeof data.snapshot.totalPlayersJoined === "number"
      ) {
        totalEl.textContent = String(data.snapshot.totalPlayersJoined);
      }

      if (motdEl) {
        if (data.motd) {
          motdEl.textContent = data.motd;
        } else {
          motdEl.textContent = "";
        }
      }

      pingMinecraftLiveStatus(baseStatus, {
        pillEl,
        dotEl,
        labelEl,
        countEl,
        tagEl,
        motdEl
      });
    })
    .catch(err => {
      console.error(err);
      const fallbackLabel = "status unavailable";
      if (labelEl) labelEl.textContent = fallbackLabel;
      if (pillEl) applyStatusPill(pillEl, "offline");
      if (dotEl) applyStatusDot(dotEl, "offline");
      if (tagEl) tagEl.textContent = statusTagText("offline");
    });
}
function pingMinecraftLiveStatus(baseStatus, els) {
  const { pillEl, dotEl, labelEl, countEl, tagEl, motdEl } = els;
  const address = "mc.cbhs.online";

  fetch(`https://api.mcstatus.io/v2/status/java/${address}`)
    .then(res => {
      if (!res.ok) throw new Error("mcstatus API error");
      return res.json();
    })
    .then(resp => {
      const isOnline = !!resp.online;
      const players = resp.players || {};
      const onlineCount =
        typeof players.online === "number" ? players.online : null;
      const maxCount =
        typeof players.max === "number" ? players.max : null;


      let motdText = "";
      if (resp.motd) {

        motdText = resp.motd.clean || resp.motd.text || resp.motd.raw || "";
      }
      if (motdEl && motdText) {
        motdEl.textContent = motdText;
      }

      if (countEl && onlineCount !== null) {
        if (maxCount !== null) {
          countEl.textContent = `${onlineCount} / ${maxCount}`;
        } else {
          countEl.textContent = `${onlineCount} online`;
        }
      }

      if (baseStatus === "maintenance") {
        return;
      }

      const status = isOnline ? "online" : "offline";

      if (pillEl) applyStatusPill(pillEl, status);
      if (dotEl) applyStatusDot(dotEl, status);
      if (labelEl) labelEl.textContent = inferStatusLabel(status);
      if (tagEl) tagEl.textContent = statusTagText(status);
    })
    .catch(err => {
      console.error("Live status ping failed", err);
    });
}
function setupIpModal() {
  const openBtn = document.getElementById("open-ip-modal");
  const backdrop = document.getElementById("ip-modal");
  if (!openBtn || !backdrop) return;

  const closeBtn = document.getElementById("ip-modal-close");
  const okBtn = document.getElementById("ip-modal-ok");

  const open = () => {
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (okBtn) okBtn.addEventListener("click", close);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });


  backdrop.querySelectorAll("[data-copy-ip]").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-copy-ip");
      if (!value) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).catch(() => {});
      }
      const original = btn.textContent;
      btn.textContent = "copied";
      setTimeout(() => {
        btn.textContent = original || "copy";
      }, 1200);
    });
  });
}

function inferStatusLabel(status) {
  switch (status) {
    case "online":
      return "online";
    case "maintenance":
      return "under maintenance";
    case "offline":
      return "offline";
    default:
      return "unknown";
  }
}

function statusTagText(status) {
  switch (status) {
    case "online":
      return "Open";
    case "maintenance":
      return "Maintenance";
    case "offline":
      return "Closed";
    default:
      return "Unknown";
  }
}

function applyStatusPill(pillEl, status) {
  pillEl.classList.remove(
    "pill-status-online",
    "pill-status-maintenance",
    "pill-status-offline"
  );

  if (status === "online") {
    pillEl.classList.add("pill-status-online");
  } else if (status === "maintenance") {
    pillEl.classList.add("pill-status-maintenance");
  } else {
    pillEl.classList.add("pill-status-offline");
  }
}

function applyStatusDot(dotEl, status) {
  dotEl.classList.remove("dot-online", "dot-offline", "dot-maintenance");
  dotEl.classList.add("dot"); 

  if (status === "online") {
    dotEl.classList.add("dot-online");
  } else if (status === "maintenance") {
    dotEl.classList.add("dot-maintenance");
  } else {
    dotEl.classList.add("dot-offline");
  }
}


function loadEventsIfNeeded() {
  const bannerRoot = document.getElementById("event-banner");
  const seasonRoot = document.getElementById("season-countdown");
  const maintenanceSummaryEl = document.getElementById("maintenance-summary");
  const eventsListRoot = document.getElementById("events-list");

  if (!bannerRoot && !seasonRoot && !maintenanceSummaryEl && !eventsListRoot) {
    return;
  }

  fetch(`${RES_BASE}/events.json`, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load events.json");
      return res.json();
    })
    .then((data) => {
      const now = new Date();


      if (seasonRoot) {
        const seasonCtx = getNextSeasonContext(data.seasons || [], now);
        renderSeasonCountdown(seasonRoot, seasonCtx);
      }


      if (maintenanceSummaryEl) {
        renderMaintenanceSummary(maintenanceSummaryEl, data.maintenance || null);
      }


      if (eventsListRoot) {
        renderEventsList(eventsListRoot, data.events || []);
      }


      if (bannerRoot) {
        initEventBanner(bannerRoot, data, now);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function getNextSeasonContext(seasons, now) {
  if (!Array.isArray(seasons) || seasons.length === 0) return null;

  let best = null;

  seasons.forEach((s) => {
    if (!s.startsAt) return;
    const t = new Date(s.startsAt);
    if (isNaN(t.getTime())) return;

    if (t.getTime() <= now.getTime()) {
      return;
    }

    if (!best || t.getTime() < best.target.getTime()) {
      best = {
        season: s,
        target: t,
        diffMs: t.getTime() - now.getTime(),
      };
    }
  });

  return best;
}

function renderSeasonCountdown(root, ctx) {
  if (!ctx) {
    root.innerHTML =
      "<p class='content-lead'>No upcoming seasons are scheduled yet.</p>";
    return;
  }

  const { season, target } = ctx;
  root.innerHTML = "";

  const title = document.createElement("div");
  title.className = "season-countdown-title";
  title.textContent = `${season.name || "Next Season"} starts at ${formatShortDateTime(
    target
  )}`;

  const desc = document.createElement("p");
  desc.className = "content-lead";
  desc.style.margin = "2px 0 4px";
  desc.textContent =
    season.description ||
    "Get ready to hop on around launch time with everyone else.";

  const timer = document.createElement("div");
  timer.className = "season-countdown-timer";
  timer.id = "season-countdown-timer";

  root.appendChild(title);
  root.appendChild(desc);
  root.appendChild(timer);

  startCountdownTimer(timer, target, "starts in", "live now!");
}

function renderMaintenanceSummary(el, maintenance) {
  if (!maintenance || !maintenance.enabled) {
    el.textContent = "No recurring maintenance schedule is configured.";
    return;
  }

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const wd = typeof maintenance.weekday === "number" ? maintenance.weekday : 6;
  const label =
    maintenance.label || "Weekly Maintenance";

  const duration =
    typeof maintenance.durationMinutes === "number"
      ? maintenance.durationMinutes
      : 30;

  const timeStr = `${pad2(maintenance.hour || 0)}:${pad2(
    maintenance.minute || 0
  )} AM`;

  el.textContent = `${label}: Every ${weekdayNames[wd]} at around ${timeStr} for about ${duration} minutes (Central time).`;
}

function renderEventsList(root, events) {
  root.innerHTML = "";

  if (!events || events.length === 0) {
    root.innerHTML =
      "<p class='content-lead'>No special events are scheduled right now.</p>";
    return;
  }

  const items = [...events].filter((e) => e.date).sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return da - db;
  });

  const now = new Date();

  items.forEach((evt) => {
    const card = document.createElement("article");
    card.className = "event-card reveal";

    const title = document.createElement("div");
    title.className = "event-card-title";
    title.textContent = evt.title || "Event";

    const meta = document.createElement("div");
    meta.className = "event-card-meta";

    const dt = new Date(evt.date);
    let whenText = "Date: TBD";
    if (!isNaN(dt.getTime())) {
      const prefix = dt.getTime() < now.getTime() ? "Happened" : "On";
      whenText = `${prefix} ${formatShortDateTime(dt)}`;
    }
    meta.textContent = whenText;

    const desc = document.createElement("p");
    desc.className = "event-card-desc";
    desc.textContent =
      evt.description || "Details coming soon.";

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);

    root.appendChild(card);
  });
}

function initEventBanner(root, data, now) {
  const badgeEl = document.getElementById("event-banner-badge");
  const textEl = document.getElementById("event-banner-text");
  const countdownEl = document.getElementById("event-banner-countdown");

  const maintenance = data.maintenance || null;
  const seasons = data.seasons || [];

  let chosen = null;

  const maintCtx = maintenance
    ? getMaintenanceContext(maintenance, now)
    : null;
  const seasonCtx = getNextSeasonContext(seasons, now);

  if (maintCtx && maintCtx.isOngoing) {
    chosen = { type: "maintenance", ctx: maintCtx };
  } else if (maintCtx && maintCtx.timeUntilMs <= 48 * 60 * 60 * 1000) {
    chosen = { type: "maintenance", ctx: maintCtx };
  } else if (seasonCtx) {
    chosen = { type: "season", ctx: seasonCtx };
  }

  if (!chosen) {
    root.classList.add("hidden");
    return;
  }

  root.classList.remove("hidden");

  if (chosen.type === "maintenance") {
    const { nextStart, nextEnd, label } = chosen.ctx;
    if (badgeEl) badgeEl.textContent = "Maintenance";
    if (textEl) {
      const nowMs = now.getTime();
      if (nowMs >= nextStart.getTime() && nowMs <= nextEnd.getTime()) {
        textEl.textContent =
          (label || "Weekly Maintenance") + " is currently in progress.";
      } else {
        textEl.textContent =
          (label || "Weekly Maintenance") + " starts soon.";
      }
    }
    if (countdownEl) {
      startCountdownTimer(
        countdownEl,
        nextStart,
        "in",
        "now!"
      );
    }
  } else if (chosen.type === "season" && chosen.ctx) {
    const { season, target } = chosen.ctx;
    if (badgeEl) badgeEl.textContent = "Season Launch";
    if (textEl)
      textEl.textContent = `${season.name || "Next Season"} starts at ${formatShortDateTime(
        target
      )}`;
    if (countdownEl) {
      startCountdownTimer(
        countdownEl,
        target,
        "in",
        "live now!"
      );
    }
  }
}

function getMaintenanceContext(maintenance, now) {
  if (!maintenance || !maintenance.enabled) return null;

  const weekday = typeof maintenance.weekday === "number"
    ? maintenance.weekday
    : 6;
  const hour = typeof maintenance.hour === "number" ? maintenance.hour : 1;
  const minute =
    typeof maintenance.minute === "number" ? maintenance.minute : 0;
  const durationMinutes =
    typeof maintenance.durationMinutes === "number"
      ? maintenance.durationMinutes
      : 30;


  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);


  const currentW = now.getDay();
  let diffDays = weekday - currentW;
  if (diffDays < 0) diffDays += 7;
  target.setDate(target.getDate() + diffDays);


  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }

  const end = new Date(target.getTime() + durationMinutes * 60 * 1000);
  const timeUntilMs = target.getTime() - now.getTime();
  const isOngoing =
    now.getTime() >= target.getTime() &&
    now.getTime() <= end.getTime();

  return {
    nextStart: target,
    nextEnd: end,
    timeUntilMs,
    isOngoing,
    label: maintenance.label || "Weekly Maintenance",
  };
}

function startCountdownTimer(el, targetDate, prefix, doneText) {
  function update() {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      el.textContent = doneText || "now!";
      clearInterval(timerId);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const rem1 = totalSeconds - days * 24 * 3600;
    const hours = Math.floor(rem1 / 3600);
    const rem2 = rem1 - hours * 3600;
    const minutes = Math.floor(rem2 / 60);
    const seconds = rem2 - minutes * 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${pad2(hours)}h`);
    parts.push(`${pad2(minutes)}m`);
    parts.push(`${pad2(seconds)}s`);

    el.textContent = `${prefix ? prefix + " " : ""}${parts.join(" ")}`;
  }

  update();
  const timerId = setInterval(update, 1000);
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

function formatShortDateTime(d) {
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hours = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());
  return `${month}/${day} ${hours}:${minutes}`;
}


function applySeasonTheme() {
  const now = new Date();
  const month = now.getMonth(); 

  let season = "winter";
  if (month >= 2 && month <= 4) {
    season = "spring"; 
  } else if (month >= 5 && month <= 7) {
    season = "summer"; 
  } else if (month >= 8 && month <= 10) {
    season = "fall";   
  } else {
    season = "winter"; 
  }

  //document.body.classList.add(`season-${season}`);

  const chip = document.getElementById("hero-season-chip");
  if (!chip) return;

  let emoji = "❄";
  let message = "winter timeee, when christmas arrives, i hope you have a good one";

  if (season === "spring") {
    emoji = "🌸";
    message = "spring timeee.";
  } else if (season === "summer") {
    emoji = "☀️";
    message = "summer timeee.";
  } else if (season === "fall") {
    emoji = "🍂";
    message = "falllll timeeee.";
  }

  chip.innerHTML = `
    <span class="season-chip-emoji">${emoji}</span>
    <span class="season-chip-text">${message}</span>
  `;
}


function initSeasonalBackgroundEffects() {
  const canvas = document.getElementById("bg-season-canvas");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const isWinter = document.body.classList.contains("season-winter");
  const isSpring = document.body.classList.contains("season-spring");
  const isSummer = document.body.classList.contains("season-summer");
  const isFall = document.body.classList.contains("season-fall");

  let particles = [];
  let animationId = null;

  function resetCanvasSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", () => {
    resetCanvasSize();
    spawnParticles(); 
  });

  function spawnParticles() {
    particles = [];
    let count = 60;

    if (isWinter) count = 90;
    if (isFall) count = 70;
    if (isSummer || isSpring) count = 50;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const baseSpeed = isWinter ? 0.4 : isFall ? 0.25 : 0.15;

      particles.push({
        x,
        y,
        radius: isWinter
          ? 1.3 + Math.random() * 2.2
          : isFall
          ? 1.4 + Math.random() * 2.6
          : 1 + Math.random() * 1.6,
        vy: baseSpeed + Math.random() * (baseSpeed * 1.5),
        vx: (Math.random() - 0.5) * 0.3,
        drift: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: 0.5 + Math.random() * 0.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.angle += p.spin;
      p.x += p.vx + Math.sin(p.angle) * p.drift;
      p.y += p.vy;

      if (p.y - p.radius > height) {
        p.y = -p.radius;
        p.x = Math.random() * width;
      }
      if (p.x + p.radius < 0) p.x = width + p.radius;
      if (p.x - p.radius > width) p.x = -p.radius;

      if (isWinter) {
        // snowflakes
        ctx.fillStyle = `rgba(224, 244, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (isFall) {
        // "leaves" 
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * 0.6);
        ctx.fillStyle = `rgba(255, 181, 102, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.4, p.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (isSpring) {
        // soft green-ish dust
        ctx.fillStyle = `rgba(164, 255, 190, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else if (isSummer) {
        // firefly-ish specks
        const glow = p.radius * 3;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, glow);
        ctx.save();
        ctx.translate(p.x, p.y);
        grd.addColorStop(0, `rgba(255, 255, 166, ${p.alpha})`);
        grd.addColorStop(1, "rgba(255, 255, 166, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(200, 200, 255, ${p.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  resetCanvasSize();
  spawnParticles();
  draw();

}


// ----- Helpers -----

function nextWeeklyOccurrence(weekly, now) {
  const weekday = typeof weekly.weekday === "number" ? weekly.weekday : 0;
  const hour = typeof weekly.hour === "number" ? weekly.hour : 0;
  const minute = typeof weekly.minute === "number" ? weekly.minute : 0;

  const eventDate = new Date(now);
  const dayDiff = (weekday - eventDate.getDay() + 7) % 7;
  eventDate.setDate(eventDate.getDate() + dayDiff);
  eventDate.setHours(hour, minute, 0, 0);

  if (eventDate < now) {
    eventDate.setDate(eventDate.getDate() + 7);
  }

  return eventDate;
}

function formatShortDateTime(d) {
  if (!(d instanceof Date) || isNaN(d)) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatAnnouncementDateLabel(item) {
  if (item.weekly) {
    return formatWeeklyLabel(item.weekly);
  }
  if (item.date) {
    return formatShortDateTime(new Date(item.date));
  }
  return "";
}

function formatWeeklyLabel(weekly) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = typeof weekly.weekday === "number" ? weekly.weekday : 0;
  const hour = typeof weekly.hour === "number" ? weekly.hour : 0;
  const minute = typeof weekly.minute === "number" ? weekly.minute : 0;

  const fakeDate = new Date();
  fakeDate.setHours(hour, minute, 0, 0);

  const timePart = fakeDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return `Weekly • ${days[weekday]} • ${timePart}`;
}

// ----- Init -----

document.addEventListener("DOMContentLoaded", () => {
  applySeasonTheme();
  initSeasonalBackgroundEffects();
  startTypewriter();
  setupCopyIP();
  setupRevealOnScroll();
  setupNavToggle();
  setupSmoothScroll();
  setYear();

  loadStatusIfNeeded();
  loadRulesIfNeeded();
  loadAnnouncementsIfNeeded();
  loadUpdatesIfNeeded();
  loadVotingIfNeeded();
  loadPlayersIfNeeded();
  loadEventsIfNeeded();
  setupAccordionInteractions();
   setupIpModal();
});
