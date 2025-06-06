const POWERAPPS_URL = "https://apps.powerapps.com/play/e/bd757d27-835c-44ca-8264-caa6e7f6b688/a/dfddecbe-1a47-423b-8828-d4bf2452ea46?tenantId=6c5697cc-1ece-4c48-8e3b-7c379c02aab6";

let tabCounter = 0, activeTabId = null, draggedTab = null, userId = "";

const tabsContainer = document.getElementById("tabs-container");
const contentsContainer = document.getElementById("contents-container");

function createTab(name = "Nová záložka", id = null, show = true) {
  if (!id) id = `tab-${tabCounter++}`;

  const tab = document.createElement("div");
  tab.className = "tab";
  tab.id = id;
  tab.draggable = true;
  tab.innerHTML = `<span>${name}</span>
    <span class="edit-btn" title="Přejmenovat">✎</span>
    <span class="paste-btn" title="Vložit název">📋</span>
    <span class="close-btn" title="Zavřít">✖</span>`;

  tab.onclick = e => {
    if (!["edit-btn", "close-btn", "paste-btn"].includes(e.target.className)) showTab(id);
  };

  tab.querySelector(".edit-btn").onclick = e => { e.stopPropagation(); renameTab(tab); };
  tab.querySelector(".paste-btn").onclick = async e => {
    e.stopPropagation();
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) tab.querySelector("span").textContent = text;
    } catch (err) { alert("Chyba schránky: " + err); }
  };
  tab.querySelector(".close-btn").onclick = e => { e.stopPropagation(); removeTab(id); };

  tabsContainer.appendChild(tab);

  const content = document.createElement("div");
  content.className = "tab-content";
  content.id = `content-${id}`;
  content.innerHTML = `<iframe src="${POWERAPPS_URL}"></iframe>`;
  contentsContainer.appendChild(content);

  if (show) showTab(id);
}

function showTab(id) {
  activeTabId = id;
  document.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `content-${id}`));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active-tab", t.id === id));
}

function removeTab(id) {
  document.getElementById(id)?.remove();
  document.getElementById(`content-${id}`)?.remove();
  if (activeTabId === id) {
    const remaining = document.querySelectorAll(".tab");
    if (remaining.length) showTab(remaining[remaining.length - 1].id);
  }
}

function renameTab(tab) {
  const label = tab.querySelector("span");
  const input = document.createElement("input");
  input.type = "text";
  input.value = label.textContent;
  tab.insertBefore(input, label);
  label.style.display = "none";
  input.focus();

  input.onblur = () => { label.textContent = input.value.trim() || "Nová záložka"; input.remove(); label.style.display = ""; };
  input.onkeydown = e => { if (["Enter", "Escape"].includes(e.key)) input.blur(); };
}

function createAddTabButton() {
  const addBtn = document.createElement("div");
  addBtn.className = "add-tab";
  addBtn.textContent = "+";
  addBtn.onclick = () => createTab();
  tabsContainer.appendChild(addBtn);
}

document.addEventListener("dragstart", e => { if (e.target.classList.contains("tab")) draggedTab = e.target; });
document.addEventListener("dragover", e => { if (e.target.classList.contains("tab")) e.preventDefault(); });
document.addEventListener("drop", e => {
  if (!draggedTab) return;
  const dropTarget = e.target.closest(".tab");
  if (dropTarget && dropTarget !== draggedTab) {
    tabsContainer.insertBefore(draggedTab, dropTarget.nextSibling);
  }
  draggedTab = null;
});

document.getElementById("info-btn").onclick = () => document.getElementById("modal-overlay").style.display = "flex";
document.querySelector(".close-modal").onclick = () => document.getElementById("modal-overlay").style.display = "none";
document.getElementById("modal-overlay").onclick = e => { if (e.target.id === "modal-overlay") e.target.style.display = "none"; };
document.addEventListener("keydown", e => { if (e.key === "Escape") document.getElementById("modal-overlay").style.display = "none"; });

document.getElementById("login-btn").onclick = () => {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (password === "admin" && username) {
    userId = username;
    document.getElementById("login-overlay").style.display = "none";
  } else {
    document.getElementById("login-error").style.display = "block";
  }
};

document.getElementById("login-password").onkeydown = e => { if (e.key === "Enter") document.getElementById("login-btn").click(); };

createAddTabButton();
createTab("Nová záložka", "default-tab");
