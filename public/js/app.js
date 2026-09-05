const state = {
  page: "overview",
  settingsTab: "account",
  repositories: JSON.parse(
    localStorage.getItem("adnova-code-repositories") || "[]"
  ),
  codespaces: JSON.parse(
    localStorage.getItem("adnova-code-codespaces") || "[]"
  ),
  profile: JSON.parse(
    localStorage.getItem("adnova-code-profile") ||
    JSON.stringify({
      name: "Your Profile",
      username: "you"
    })
  )
};

const pageRoot = document.getElementById("page-root");
const pageBreadcrumb = document.getElementById("page-breadcrumb");
const repositoryList = document.getElementById("repository-list");

const repositoryModal =
  document.getElementById("repository-modal");

const repositoryNameInput =
  document.getElementById("repository-name-input");

const repositoryDescriptionInput =
  document.getElementById("repository-description-input");

const repositoryReadmeInput =
  document.getElementById("repository-readme-input");

const repositoryVisibilityInput =
  document.getElementById("repository-visibility-input");

const toast = document.getElementById("toast");

function saveState() {
  localStorage.setItem(
    "adnova-code-repositories",
    JSON.stringify(state.repositories)
  );

  localStorage.setItem(
    "adnova-code-codespaces",
    JSON.stringify(state.codespaces)
  );

  localStorage.setItem(
    "adnova-code-profile",
    JSON.stringify(state.profile)
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateProfileUI() {
  document.getElementById("profile-name").textContent =
    state.profile.name;

  document.getElementById("profile-name").nextElementSibling
    .textContent = `@${state.profile.username}`;
}

function renderRepositoryList() {
  if (!state.repositories.length) {
    repositoryList.innerHTML = `
      <div class="empty-list">
        No repositories yet.
      </div>
    `;
    return;
  }

  repositoryList.innerHTML = state.repositories
    .map(repo => `
      <button
        class="repository-button"
        data-repository-id="${repo.id}"
      >
        ${repo.visibility === "public" ? "◉" : "●"}
        ${escapeHtml(repo.name)}
      </button>
    `)
    .join("");

  repositoryList
    .querySelectorAll(".repository-button")
    .forEach(button => {
      button.addEventListener("click", () => {
        const repo = state.repositories.find(
          item => item.id === button.dataset.repositoryId
        );

        if (!repo) return;

        renderRepository(repo);
      });
    });
}

function renderOverview() {
  pageBreadcrumb.textContent = "Overview";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">
        <div class="page-title">
          <h1>Welcome to Adnova Code</h1>
          <p>
            Your development home for repositories,
            Codespaces, branches and AI-assisted coding.
          </p>
        </div>

        <button
          class="primary-button"
          id="overview-create-repository"
        >
          + New repository
        </button>
      </div>

      <div class="card-grid">

        <div class="card stat-card">
          <strong>${state.repositories.length}</strong>
          <span>Repositories</span>
        </div>

        <div class="card stat-card">
          <strong>${state.codespaces.length}</strong>
          <span>Codespaces</span>
        </div>

        <div class="card stat-card">
          <strong>1</strong>
          <span>Installed plugins</span>
        </div>

      </div>

      <div class="section">

        <div class="section-header">
          <h2>Your repositories</h2>
        </div>

        ${
          state.repositories.length
            ? `
              <div class="repository-grid">
                ${state.repositories.slice(0, 6).map(renderRepositoryCard).join("")}
              </div>
            `
            : `
              <div class="empty-state">
                <h2>Create your first repository</h2>
                <div>
                  Start with a name, README choice and
                  public/private visibility.
                </div>
              </div>
            `
        }

      </div>

    </div>
  `;

  document
    .getElementById("overview-create-repository")
    .addEventListener("click", openRepositoryModal);
}

function renderRepositoryCard(repo) {
  return `
    <div class="repository-card">

      <h3>
        ${repo.visibility === "public" ? "◉" : "●"}
        ${escapeHtml(repo.name)}
      </h3>

      <p>
        ${escapeHtml(
          repo.description || "No description provided."
        )}
      </p>

      <div class="repository-meta">
        <span class="badge">
          ${repo.visibility}
        </span>

        <span class="badge">
          ${repo.defaultBranch}
        </span>

        <span class="badge">
          ${repo.readme ? "README" : "No README"}
        </span>
      </div>

    </div>
  `;
}

function renderRepositories() {
  pageBreadcrumb.textContent = "Repositories";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">
        <div class="page-title">
          <h1>Repositories</h1>
          <p>
            Create, organize and reopen your projects.
          </p>
        </div>

        <button
          class="primary-button"
          id="repositories-create"
        >
          + New repository
        </button>
      </div>

      ${
        state.repositories.length
          ? `
            <div class="repository-grid">
              ${state.repositories.map(renderRepositoryCard).join("")}
            </div>
          `
          : `
            <div class="empty-state">
              <h2>No repositories yet</h2>
              <div>Create one to start building.</div>
            </div>
          `
      }

    </div>
  `;

  document
    .getElementById("repositories-create")
    .addEventListener("click", openRepositoryModal);
}

function renderCodespaces() {
  pageBreadcrumb.textContent = "Codespaces";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">
        <div class="page-title">
          <h1>Codespaces</h1>
          <p>
            Create and reopen isolated development environments
            for your repositories.
          </p>
        </div>
      </div>

      ${
        state.codespaces.length
          ? `
            <div class="code-space-grid">
              ${state.codespaces.map(space => `
                <div class="codespace-card">

                  <div>
                    <h3>${escapeHtml(space.name)}</h3>
                    <p>
                      ${escapeHtml(space.repository)}
                      · ${escapeHtml(space.branch)}
                    </p>
                  </div>

                  <button
                    class="secondary-button"
                    data-open-codespace="${space.id}"
                  >
                    Open
                  </button>

                </div>
              `).join("")}
            </div>
          `
          : `
            <div class="empty-state">
              <h2>No Codespaces yet</h2>
              <div>
                Open a repository and create a workspace from it.
              </div>
            </div>
          `
      }

    </div>
  `;

  pageRoot
    .querySelectorAll("[data-open-codespace]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const space = state.codespaces.find(
          item => item.id === button.dataset.openCodespace
        );

        if (!space) return;

        showToast(
          `Opening ${space.name}...`
        );
      });
    });
}

function renderBranches() {
  pageBreadcrumb.textContent = "Branches";

  const branches = [];

  for (const repo of state.repositories) {
    branches.push({
      repository: repo.name,
      branch: repo.defaultBranch
    });
  }

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">
        <div class="page-title">
          <h1>Branches</h1>
          <p>
            Manage project branches independently from repositories.
          </p>
        </div>
      </div>

      ${
        branches.length
          ? `
            <div class="code-space-grid">
              ${branches.map(item => `
                <div class="codespace-card">
                  <div>
                    <h3>${escapeHtml(item.branch)}</h3>
                    <p>${escapeHtml(item.repository)}</p>
                  </div>

                  <span class="badge">
                    Default branch
                  </span>
                </div>
              `).join("")}
            </div>
          `
          : `
            <div class="empty-state">
              <h2>No branches yet</h2>
              <div>Create a repository first.</div>
            </div>
          `
      }

    </div>
  `;
}

function renderRepository(repo) {
  pageBreadcrumb.textContent =
    `Repositories / ${repo.name}`;

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">

        <div class="page-title">
          <h1>${escapeHtml(repo.name)}</h1>

          <p>
            ${escapeHtml(
              repo.description ||
              "No description provided."
            )}
          </p>

          <div class="repository-meta">
            <span class="badge">
              ${repo.visibility}
            </span>

            <span class="badge">
              ${repo.defaultBranch}
            </span>
          </div>
        </div>

        <div style="display:flex;gap:8px;">
          <button
            class="secondary-button"
            id="open-codespace-for-repo"
          >
            Create Codespace
          </button>
        </div>

      </div>

      <div class="card">

        <h2 style="margin-top:0;">
          Repository workspace
        </h2>

        <p style="color:#71717a;">
          Explorer, editor, terminal, preview and
          Adnova Coding will live here.
        </p>

        <div class="repository-meta">
          ${
            repo.readme
              ? `<span class="badge">README.md</span>`
              : ""
          }

          <span class="badge">main</span>
          <span class="badge">Adnova Coding</span>
        </div>

      </div>

    </div>
  `;

  document
    .getElementById("open-codespace-for-repo")
    .addEventListener("click", () => {
      const space = {
        id: crypto.randomUUID(),
        name: `${repo.name} Codespace`,
        repository: repo.name,
        branch: repo.defaultBranch
      };

      state.codespaces.push(space);
      saveState();

      showToast(
        `${space.name} created.`
      );

      renderCodespaces();
    });
}

function renderPlugins() {
  pageBreadcrumb.textContent = "Plugins";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">

        <div class="page-title">
          <h1>Plugins</h1>
          <p>
            Extend Adnova Code through installed integrations.
          </p>
        </div>

      </div>

      <div class="plugin-card">

        <div class="plugin-icon">
          A
        </div>

        <div class="plugin-card-main">
          <strong>Adnova Coding</strong>

          <span>
            Connects Adnova AI with Adnova Code
            for remote coding assistance.
          </span>
        </div>

        <span class="connected-pill">
          Installed
        </span>

      </div>

    </div>
  `;
}

function renderSettings() {
  pageBreadcrumb.textContent = "Settings";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-title-row">
        <div class="page-title">
          <h1>Settings</h1>
          <p>
            Manage your profile, repositories, Codespaces,
            plugins and workspace preferences.
          </p>
        </div>
      </div>

      <div class="settings-layout">

        <div class="settings-nav">

          ${[
            ["account", "Account"],
            ["repositories", "Repositories"],
            ["codespaces", "Codespaces"],
            ["plugins", "Plugins"],
            ["workspace", "Workspace"]
          ].map(([id, label]) => `
            <button
              class="settings-tab ${
                state.settingsTab === id
                  ? "active"
                  : ""
              }"
              data-settings-tab="${id}"
            >
              ${label}
            </button>
          `).join("")}

        </div>

        <div class="settings-content">
          ${renderSettingsTab()}
        </div>

      </div>

    </div>
  `;

  pageRoot
    .querySelectorAll("[data-settings-tab]")
    .forEach(button => {
      button.addEventListener("click", () => {
        state.settingsTab =
          button.dataset.settingsTab;

        renderSettings();
      });
    });
}

function renderSettingsTab() {
  if (state.settingsTab === "repositories") {
    return `
      <div class="settings-card">
        <h2>Repositories</h2>
        <p>
          Default repository behavior.
        </p>

        <div class="setting-row">
          <span>Default branch</span>
          <strong>main</strong>
        </div>

        <div class="setting-row">
          <span>Repository count</span>
          <strong>${state.repositories.length}</strong>
        </div>
      </div>
    `;
  }

  if (state.settingsTab === "codespaces") {
    return `
      <div class="settings-card">
        <h2>Codespaces</h2>
        <p>
          Workspace defaults and saved environments.
        </p>

        <div class="setting-row">
          <span>Codespaces</span>
          <strong>${state.codespaces.length}</strong>
        </div>

        <div class="setting-row">
          <span>Terminal</span>
          <strong>Integrated</strong>
        </div>
      </div>
    `;
  }

  if (state.settingsTab === "plugins") {
    return `
      <div class="settings-card">
        <h2>Plugin management</h2>
        <p>
          Installed integrations for Adnova Code.
        </p>

        <div class="plugin-card">

          <div class="plugin-icon">
            A
          </div>

          <div class="plugin-card-main">
            <strong>Adnova Coding</strong>
            <span>Installed and available.</span>
          </div>

          <span class="connected-pill">
            Active
          </span>

        </div>
      </div>
    `;
  }

  if (state.settingsTab === "workspace") {
    return `
      <div class="settings-card">
        <h2>Workspace</h2>
        <p>
          Editor and terminal preferences.
        </p>

        <div class="setting-row">
          <span>Terminal location</span>
          <strong>Integrated</strong>
        </div>

        <div class="setting-row">
          <span>Preview</span>
          <strong>Enabled</strong>
        </div>

        <div class="setting-row">
          <span>AI assistant</span>
          <strong>Adnova Coding</strong>
        </div>
      </div>
    `;
  }

  return `
    <div class="settings-card">
      <h2>Account</h2>
      <p>
        Your Adnova Code profile.
      </p>

      <div class="setting-row">
        <span>Name</span>
        <strong>${escapeHtml(state.profile.name)}</strong>
      </div>

      <div class="setting-row">
        <span>Username</span>
        <strong>@${escapeHtml(state.profile.username)}</strong>
      </div>
    </div>
  `;
}

function renderPage() {
  document
    .querySelectorAll(".nav-item")
    .forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === state.page
      );
    });

  if (state.page === "overview") {
    renderOverview();
    return;
  }

  if (state.page === "repositories") {
    renderRepositories();
    return;
  }

  if (state.page === "codespaces") {
    renderCodespaces();
    return;
  }

  if (state.page === "branches") {
    renderBranches();
    return;
  }

  if (state.page === "plugins") {
    renderPlugins();
    return;
  }

  if (state.page === "settings") {
    renderSettings();
  }
}

function openRepositoryModal() {
  repositoryModal.classList.remove("hidden");
  repositoryNameInput.focus();
}

function closeRepositoryModal() {
  repositoryModal.classList.add("hidden");
}

function createRepository() {
  const name = repositoryNameInput.value.trim();

  if (!name) {
    repositoryNameInput.focus();
    return;
  }

  const repository = {
    id: crypto.randomUUID(),
    name,
    description:
      repositoryDescriptionInput.value.trim(),
    visibility:
      repositoryVisibilityInput.value,
    readme:
      repositoryReadmeInput.checked,
    defaultBranch: "main",
    createdAt: Date.now()
  };

  state.repositories.unshift(repository);

  saveState();
  renderRepositoryList();
  closeRepositoryModal();

  repositoryNameInput.value = "";
  repositoryDescriptionInput.value = "";
  repositoryReadmeInput.checked = true;
  repositoryVisibilityInput.value = "public";

  showToast(
    `${repository.name} created.`
  );

  state.page = "repositories";
  renderPage();
}

document
  .querySelectorAll(".nav-item")
  .forEach(button => {
    button.addEventListener("click", () => {

      state.page =
        button.dataset.page || "overview";

      renderPage();
    });
  });

document
  .getElementById("create-repository-button")
  .addEventListener(
    "click",
    openRepositoryModal
  );

document
  .getElementById("close-repository-modal")
  .addEventListener(
    "click",
    closeRepositoryModal
  );

document
  .getElementById("confirm-repository-button")
  .addEventListener(
    "click",
    createRepository
  );

document
  .getElementById("repository-name-input")
  .addEventListener("keydown", event => {
    if (event.key === "Enter") {
      createRepository();
    }
  });

document
  .getElementById("profile-button")
  .addEventListener("click", () => {
    state.page = "settings";
    state.settingsTab = "account";
    renderPage();
  });

document
  .getElementById("top-profile-button")
  .addEventListener("click", () => {
    state.page = "settings";
    state.settingsTab = "account";
    renderPage();
  });

document
  .getElementById("mobile-menu-button")
  .addEventListener("click", () => {
    document
      .querySelector(".sidebar")
      .classList.toggle("mobile-open");
  });

updateProfileUI();
renderRepositoryList();
renderPage();
