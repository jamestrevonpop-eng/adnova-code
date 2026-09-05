const state = {
  page: "home",
  settingsTab: "account",

  repositories: JSON.parse(
    localStorage.getItem(
      "adnova-code-repositories-v2"
    ) || "[]"
  ),

  codespaces: JSON.parse(
    localStorage.getItem(
      "adnova-code-codespaces-v2"
    ) || "[]"
  ),

  profile: JSON.parse(
    localStorage.getItem(
      "adnova-code-profile-v2"
    ) ||
    JSON.stringify({
      name: "Your Profile",
      username: "you"
    })
  )
};

const pageRoot =
  document.getElementById("page-root");

const breadcrumb =
  document.getElementById("breadcrumb");

const repositorySidebar =
  document.getElementById(
    "sidebar-repositories"
  );

const repositoryModal =
  document.getElementById(
    "repository-modal"
  );

const repositoryNameInput =
  document.getElementById(
    "repository-name"
  );

const repositoryDescriptionInput =
  document.getElementById(
    "repository-description"
  );

const repositoryReadmeInput =
  document.getElementById(
    "repository-readme"
  );

const repositoryVisibilityInput =
  document.getElementById(
    "repository-visibility"
  );

const toast =
  document.getElementById("toast");


function saveState() {
  localStorage.setItem(
    "adnova-code-repositories-v2",
    JSON.stringify(state.repositories)
  );

  localStorage.setItem(
    "adnova-code-codespaces-v2",
    JSON.stringify(state.codespaces)
  );

  localStorage.setItem(
    "adnova-code-profile-v2",
    JSON.stringify(state.profile)
  );
}


function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function showToast(message) {
  toast.textContent = message;

  toast.classList.remove(
    "hidden"
  );

  clearTimeout(
    showToast.timeout
  );

  showToast.timeout =
    setTimeout(() => {
      toast.classList.add(
        "hidden"
      );
    }, 3000);
}


function openRepositoryModal() {
  repositoryModal.classList.remove(
    "hidden"
  );

  repositoryNameInput.focus();
}


function closeRepositoryModal() {
  repositoryModal.classList.add(
    "hidden"
  );
}


function renderSidebarRepositories() {

  if (!state.repositories.length) {
    repositorySidebar.innerHTML = `
      <div class="empty-list">
        No repositories
      </div>
    `;

    return;
  }

  repositorySidebar.innerHTML =
    state.repositories
      .slice(0, 12)
      .map(repo => `
        <button
          class="repository-side-link"
          data-repository="${repo.id}"
        >
          ${repo.visibility === "public" ? "◉" : "●"}
          ${escapeHtml(repo.name)}
        </button>
      `)
      .join("");

  repositorySidebar
    .querySelectorAll(
      "[data-repository]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const repo =
            state.repositories.find(
              item =>
                item.id ===
                button.dataset.repository
            );

          if (!repo) return;

          state.page =
            "repository";

          renderRepository(repo);

        }
      );

    });
}


function renderHome() {

  breadcrumb.textContent =
    "Home";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Welcome to Adnova Code</h1>

          <p>
            Your development home for repositories,
            Codespaces, branches and AI-assisted coding.
          </p>

        </div>

        <div class="page-actions">

          <button
            class="primary-button"
            id="home-new-repository"
          >
            + New repository
          </button>

        </div>

      </div>


      <div class="card-grid">

        <div class="card">
          <div class="stat-number">
            ${state.repositories.length}
          </div>

          <div class="stat-label">
            Repositories
          </div>
        </div>


        <div class="card">
          <div class="stat-number">
            ${state.codespaces.length}
          </div>

          <div class="stat-label">
            Codespaces
          </div>
        </div>


        <div class="card">
          <div class="stat-number">
            1
          </div>

          <div class="stat-label">
            Installed plugin
          </div>
        </div>

      </div>


      <div class="section">

        <div class="section-title">
          Recent repositories
        </div>

        ${
          state.repositories.length
            ? `
              <div class="repository-grid">

                ${state.repositories
                  .slice(0, 6)
                  .map(
                    renderRepositoryCard
                  )
                  .join("")}

              </div>
            `
            : `
              <div class="empty-state">

                <h2>
                  Your workspace is empty
                </h2>

                <p>
                  Create your first repository
                  and start building.
                </p>

                <button
                  class="primary-button"
                  id="empty-create-repository"
                >
                  Create repository
                </button>

              </div>
            `
        }

      </div>

    </div>
  `;

  document
    .getElementById(
      "home-new-repository"
    )
    ?.addEventListener(
      "click",
      openRepositoryModal
    );

  document
    .getElementById(
      "empty-create-repository"
    )
    ?.addEventListener(
      "click",
      openRepositoryModal
    );

  bindRepositoryCardButtons();
}


function renderRepositoryCard(
  repo
) {

  return `
    <div class="repository-card">

      <div class="repository-card-top">

        <div>

          <h3>
            ${
              repo.visibility === "public"
                ? "◉"
                : "●"
            }

            ${escapeHtml(repo.name)}
          </h3>

          <p>
            ${
              escapeHtml(
                repo.description ||
                "No description."
              )
            }
          </p>

        </div>

      </div>

      <div class="badges">

        <span class="badge">
          ${repo.visibility}
        </span>

        <span class="badge">
          ${repo.defaultBranch}
        </span>

        ${
          repo.readme
            ? `
              <span class="badge">
                README
              </span>
            `
            : ""
        }

      </div>


      <div class="repository-card-actions">

        <button
          class="secondary-button"
          data-open-repository="${repo.id}"
        >
          Open repository
        </button>

        <button
          class="primary-button"
          data-create-codespace="${repo.id}"
        >
          Create Codespace
        </button>

      </div>

    </div>
  `;
}


function bindRepositoryCardButtons() {

  pageRoot
    .querySelectorAll(
      "[data-open-repository]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const repo =
            state.repositories.find(
              item =>
                item.id ===
                button.dataset.openRepository
            );

          if (!repo) return;

          renderRepository(repo);

        }
      );

    });


  pageRoot
    .querySelectorAll(
      "[data-create-codespace]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const repo =
            state.repositories.find(
              item =>
                item.id ===
                button.dataset.createCodespace
            );

          if (!repo) return;

          createCodespace(repo);

        }
      );

    });
}


function renderRepositories() {

  breadcrumb.textContent =
    "Repositories";

  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Repositories</h1>

          <p>
            All of your Adnova Code projects.
          </p>

        </div>

        <button
          class="primary-button"
          id="repositories-new"
        >
          + New repository
        </button>

      </div>


      ${
        state.repositories.length
          ? `
            <div class="repository-grid">

              ${state.repositories
                .map(
                  renderRepositoryCard
                )
                .join("")}

            </div>
          `
          : `
            <div class="empty-state">

              <h2>
                No repositories yet
              </h2>

              <p>
                Your first project starts here.
              </p>

              <button
                class="primary-button"
                id="repositories-empty-create"
              >
                Create repository
              </button>

            </div>
          `
      }

    </div>
  `;


  document
    .getElementById(
      "repositories-new"
    )
    ?.addEventListener(
      "click",
      openRepositoryModal
    );


  document
    .getElementById(
      "repositories-empty-create"
    )
    ?.addEventListener(
      "click",
      openRepositoryModal
    );


  bindRepositoryCardButtons();
}


function renderRepository(
  repo
) {

  breadcrumb.textContent =
    `Repositories / ${repo.name}`;


  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>
            ${escapeHtml(repo.name)}
          </h1>

          <p>
            ${
              escapeHtml(
                repo.description ||
                "No description."
              )
            }
          </p>

          <div
            class="badges"
            style="margin-top:10px;"
          >

            <span class="badge">
              ${repo.visibility}
            </span>

            <span class="badge">
              ${repo.defaultBranch}
            </span>

            ${
              repo.readme
                ? `
                  <span class="badge">
                    README
                  </span>
                `
                : ""
            }

          </div>

        </div>


        <div class="page-actions">

          <button
            class="secondary-button"
            id="repository-back"
          >
            Back
          </button>

          <button
            class="primary-button"
            id="repository-codespace"
          >
            Create Codespace
          </button>

        </div>

      </div>


      <div class="card">

        <div class="section-title">
          Repository
        </div>

        <div class="setting-row">

          <span>
            Default branch
          </span>

          <strong>
            ${repo.defaultBranch}
          </strong>

        </div>

        <div class="setting-row">

          <span>
            Visibility
          </span>

          <strong>
            ${repo.visibility}
          </strong>

        </div>

        <div class="setting-row">

          <span>
            README
          </span>

          <strong>
            ${repo.readme ? "Enabled" : "Not added"}
          </strong>

        </div>

      </div>


      <div class="section">

        <div class="section-title">
          Codespaces
        </div>

        ${
          state.codespaces.filter(
            space =>
              space.repositoryId ===
              repo.id
          ).length
            ? `
              <div class="codespace-list">

                ${state.codespaces
                  .filter(
                    space =>
                      space.repositoryId ===
                      repo.id
                  )
                  .map(
                    renderCodespaceCard
                  )
                  .join("")}

              </div>
            `
            : `
              <div class="empty-state">

                <h2>
                  No Codespace yet
                </h2>

                <p>
                  Create a Codespace to open
                  this project in the coding workspace.
                </p>

                <button
                  class="primary-button"
                  id="repository-create-codespace-empty"
                >
                  Create Codespace
                </button>

              </div>
            `
        }

      </div>

    </div>
  `;


  document
    .getElementById(
      "repository-back"
    )
    ?.addEventListener(
      "click",
      renderRepositories
    );


  document
    .getElementById(
      "repository-codespace"
    )
    ?.addEventListener(
      "click",
      () =>
        createCodespace(repo)
    );


  document
    .getElementById(
      "repository-create-codespace-empty"
    )
    ?.addEventListener(
      "click",
      () =>
        createCodespace(repo)
    );


  pageRoot
    .querySelectorAll(
      "[data-open-codespace]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const space =
            state.codespaces.find(
              item =>
                item.id ===
                button.dataset.openCodespace
            );

          if (!space) return;

          openCodespace(
            space
          );

        }
      );

    });
}


function renderCodespaceCard(
  space
) {

  return `
    <div class="codespace-card">

      <div class="codespace-info">

        <h3>
          ${escapeHtml(space.name)}
        </h3>

        <p>
          ${escapeHtml(space.branch)}
          · ${escapeHtml(space.status)}
        </p>

      </div>

      <button
        class="primary-button"
        data-open-codespace="${space.id}"
      >
        Open
      </button>

    </div>
  `;
}


function createCodespace(
  repo
) {

  const existing =
    state.codespaces.find(
      space =>
        space.repositoryId ===
          repo.id &&
        space.branch ===
          repo.defaultBranch
    );

  if (existing) {

    showToast(
      "Codespace already exists."
    );

    setTimeout(() => {
      openCodespace(existing);
    }, 250);

    return;
  }


  const space = {
    id: crypto.randomUUID(),
    name:
      `${repo.name} Codespace`,
    repositoryId:
      repo.id,
    repository:
      repo.name,
    branch:
      repo.defaultBranch,
    status:
      "Ready",
    createdAt:
      Date.now()
  };


  state.codespaces.unshift(
    space
  );

  saveState();

  showToast(
    "Codespace created."
  );


  setTimeout(() => {
    openCodespace(space);
  }, 350);
}


function openCodespace(
  space
) {

  state.page =
    "codespace";

  breadcrumb.textContent =
    `${space.repository} / Codespace`;

  pageRoot.innerHTML = `
    <div class="code-workspace">

      <div class="code-workspace-topbar">

        <div class="workspace-path">

          <button
            class="workspace-back"
            id="workspace-back"
          >
            ‹
          </button>

          <div>

            <strong>
              ${escapeHtml(space.repository)}
            </strong>

            <span>
              ${escapeHtml(space.branch)}
            </span>

          </div>

        </div>


        <div class="workspace-actions">

          <button
            class="secondary-button"
            id="workspace-preview"
          >
            Preview
          </button>

          <button
            class="secondary-button"
            id="workspace-snapshot"
          >
            Snapshot
          </button>

          <button
            class="primary-button"
            id="workspace-save"
          >
            Save
          </button>

        </div>

      </div>


      <div class="code-workspace-body">

        <aside class="code-explorer">

          <div class="workspace-panel-header">
            Explorer
          </div>

          <div class="workspace-panel-subheader">
            ${escapeHtml(space.repository)}
          </div>

          <div class="workspace-file-tree">

            <button
              class="file-item active"
              data-file="README.md"
            >
              <span>📄</span>
              README.md
            </button>

            <button
              class="file-item"
              data-file="package.json"
            >
              <span>📄</span>
              package.json
            </button>

            <button
              class="file-item"
              data-file="src"
            >
              <span>▸</span>
              src
            </button>

          </div>

          <button
            class="explorer-add"
            id="explorer-add-file"
          >
            + New file
          </button>

        </aside>


        <section class="code-editor">

          <div class="editor-tab">

            <span id="editor-file-name">
              README.md
            </span>

            <span class="editor-unsaved">
              Saved
            </span>

          </div>

          <textarea
            id="code-editor-textarea"
            spellcheck="false"
          ># ${escapeHtml(space.repository)}

Welcome to your Adnova Code workspace.

Branch: ${escapeHtml(space.branch)}
          </textarea>

        </section>


        <aside class="coding-panel">

          <div class="coding-header">

            <div>
              <strong>
                Adnova Coding
              </strong>

              <span>
                Installed plugin
              </span>
            </div>

          </div>


          <div
            id="coding-messages"
            class="coding-messages"
          >

            <div class="coding-message">
              Tell Adnova Coding what you want
              to build, change or debug.
            </div>

          </div>


          <div class="coding-composer">

            <textarea
              id="coding-input"
              rows="3"
              placeholder="Ask Adnova Coding..."
            ></textarea>

            <button
              id="coding-send"
              class="coding-send"
            >
              ↑
            </button>

          </div>

        </aside>

      </div>


      <div class="workspace-terminal">

        <div class="terminal-header">

          <div>
            <strong>Terminal</strong>
            <span>/projects/${escapeHtml(space.repository)}</span>
          </div>

          <span class="terminal-status">
            Ready
          </span>

        </div>


        <div
          id="workspace-terminal-output"
          class="terminal-output"
        >
          <div>
            Adnova Code terminal
          </div>

          <div>
            Workspace:
            /projects/${escapeHtml(space.repository)}
          </div>

          <div>
            Branch:
            ${escapeHtml(space.branch)}
          </div>

          <br>
        </div>


        <div class="terminal-input">

          <span>›</span>

          <input
            id="workspace-terminal-input"
            autocomplete="off"
            spellcheck="false"
            placeholder="Type a command..."
          >

        </div>

      </div>

    </div>
  `;


  document
    .getElementById(
      "workspace-back"
    )
    .addEventListener(
      "click",
      () => {

        const repo =
          state.repositories.find(
            item =>
              item.id ===
              space.repositoryId
          );

        if (repo) {
          renderRepository(repo);
        } else {
          renderRepositories();
        }

      }
    );


  setupWorkspaceFileEditing(
    space
  );

  setupWorkspaceTerminal(
    space
  );

  setupCodingAI(
    space
  );


  document
    .getElementById(
      "workspace-preview"
    )
    .addEventListener(
      "click",
      () => {

        showToast(
          "Preview will open when the project has a running server."
        );

      }
    );


  document
    .getElementById(
      "workspace-snapshot"
    )
    .addEventListener(
      "click",
      () => {

        showToast(
          "Snapshot saved."
        );

      }
    );


  document
    .getElementById(
      "workspace-save"
    )
    .addEventListener(
      "click",
      () => {

        showToast(
          "Workspace saved."
        );

      }
    );
}


function setupWorkspaceFileEditing(
  space
) {

  const fileButtons =
    document.querySelectorAll(
      ".file-item"
    );

  const editor =
    document.getElementById(
      "code-editor-textarea"
    );

  const fileName =
    document.getElementById(
      "editor-file-name"
    );


  const files = {
    "README.md":
      `# ${space.repository}\n\nWelcome to Adnova Code.\n\nBranch: ${space.branch}\n`,

    "package.json":
      `{\n  "name": "${space.repository}",\n  "version": "1.0.0"\n}\n`,

    src:
      "// src directory\n"
  };


  fileButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const file =
            button.dataset.file;

          fileButtons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

          fileName.textContent =
            file;

          editor.value =
            files[file] ||
            "";

        }
      );

    }
  );


  editor.addEventListener(
    "input",
    () => {

      const status =
        document.querySelector(
          ".editor-unsaved"
        );

      if (status) {
        status.textContent =
          "Unsaved";
      }

    }
  );


  document
    .getElementById(
      "explorer-add-file"
    )
    .addEventListener(
      "click",
      () => {

        const name =
          prompt(
            "New file name"
          );

        if (!name) return;

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "file-item";

        button.dataset.file =
          name;

        button.innerHTML = `
          <span>📄</span>
          ${escapeHtml(name)}
        `;

        button.addEventListener(
          "click",
          () => {

            fileButtons.forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );

            button.classList.add(
              "active"
            );

            fileName.textContent =
              name;

            editor.value =
              "";

          }
        );

        document
          .querySelector(
            ".workspace-file-tree"
          )
          .appendChild(
            button
          );

        showToast(
          `${name} created.`
        );

      }
    );
}


function setupWorkspaceTerminal(
  space
) {

  const input =
    document.getElementById(
      "workspace-terminal-input"
    );

  const output =
    document.getElementById(
      "workspace-terminal-output"
    );


  function print(text) {

    const line =
      document.createElement(
        "div"
      );

    line.textContent =
      text;

    output.appendChild(
      line
    );

    output.scrollTop =
      output.scrollHeight;
  }


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Enter"
      ) {
        return;
      }

      const command =
        input.value.trim();

      input.value =
        "";

      if (!command) {
        return;
      }

      print(`› ${command}`);


      if (
        command ===
        "pwd"
      ) {

        print(
          `/projects/${space.repository}`
        );

        return;
      }


      if (
        command ===
        "ls"
      ) {

        print(
          "README.md  package.json  src"
        );

        return;
      }


      if (
        command ===
        "clear"
      ) {

        output.innerHTML =
          "";

        return;
      }


      if (
        command ===
        "help"
      ) {

        print(
          "pwd   ls   clear   help"
        );

        return;
      }


      if (
        command ===
        "code ."
      ) {

        print(
          "Workspace already open."
        );

        return;
      }


      if (
        command.startsWith(
          "npm "
        )
      ) {

        print(
          `npm command queued: ${command}`
        );

        return;
      }


      print(
        `Command received: ${command}`
      );

    }
  );
}


function setupCodingAI(
  space
) {

  const input =
    document.getElementById(
      "coding-input"
    );

  const send =
    document.getElementById(
      "coding-send"
    );

  const messages =
    document.getElementById(
      "coding-messages"
    );


  async function submit() {

    const promptText =
      input.value.trim();

    if (!promptText) {
      return;
    }


    const userMessage =
      document.createElement(
        "div"
      );

    userMessage.className =
      "coding-message user";

    userMessage.textContent =
      promptText;

    messages.appendChild(
      userMessage
    );

    input.value =
      "";


    try {

      const response =
        await fetch(
          "/api/plugin/prompt",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                prompt:
                  promptText,

                model:
                  "adnova-5-sol",

                context: {
                  repository:
                    space.repository,

                  branch:
                    space.branch
                },

                attachments:
                  []
              })
          }
        );


      const data =
        await response.json();


      const assistant =
        document.createElement(
          "div"
        );

      assistant.className =
        "coding-message";


      assistant.textContent =
        data.ok
          ? "Adnova Coding received the request. The real coding agent will use this workspace context."
          : (
              data.error ||
              "Request failed."
            );


      messages.appendChild(
        assistant
      );


      messages.scrollTop =
        messages.scrollHeight;


    } catch {

      const assistant =
        document.createElement(
          "div"
        );

      assistant.className =
        "coding-message";

      assistant.textContent =
        "Adnova Coding could not reach the plugin service.";

      messages.appendChild(
        assistant
      );

    }

  }


  send.addEventListener(
    "click",
    submit
  );


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        submit();

      }

    }
  );
}


function renderCodespaces() {

  breadcrumb.textContent =
    "Codespaces";


  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Codespaces</h1>

          <p>
            Your saved Adnova Code development environments.
          </p>

        </div>

      </div>


      ${
        state.codespaces.length
          ? `
            <div class="codespace-list">

              ${state.codespaces
                .map(
                  renderCodespaceCard
                )
                .join("")}

            </div>
          `
          : `
            <div class="empty-state">

              <h2>
                No Codespaces yet
              </h2>

              <p>
                Create one from a repository.
              </p>

              <button
                class="primary-button"
                id="codespaces-go-repositories"
              >
                View repositories
              </button>

            </div>
          `
      }

    </div>
  `;


  document
    .getElementById(
      "codespaces-go-repositories"
    )
    ?.addEventListener(
      "click",
      () => {

        state.page =
          "repositories";

        renderPage();

      }
    );


  pageRoot
    .querySelectorAll(
      "[data-open-codespace]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const space =
            state.codespaces.find(
              item =>
                item.id ===
                button.dataset.openCodespace
            );

          if (!space) {
            return;
          }

          openCodespace(
            space
          );

        }
      );

    });
}


function renderBranches() {

  breadcrumb.textContent =
    "Branches";


  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Branches</h1>

          <p>
            Keep development work separated and organized.
          </p>

        </div>

      </div>


      ${
        state.repositories.length
          ? `
            <div class="codespace-list">

              ${state.repositories
                .map(
                  repo => `
                    <div
                      class="codespace-card"
                    >

                      <div
                        class="codespace-info"
                      >

                        <h3>
                          main
                        </h3>

                        <p>
                          ${escapeHtml(
                            repo.name
                          )}
                        </p>

                      </div>

                      <span class="badge">
                        Default
                      </span>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
          : `
            <div class="empty-state">

              <h2>
                No branches
              </h2>

              <p>
                Create a repository first.
              </p>

            </div>
          `
      }

    </div>
  `;
}


function renderPlugins() {

  breadcrumb.textContent =
    "Plugins";


  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Plugins</h1>

          <p>
            Installed integrations available to Adnova Code.
          </p>

        </div>

      </div>


      <div class="plugin-card">

        <div class="plugin-icon">
          A
        </div>

        <div class="plugin-copy">

          <strong>
            Adnova Coding
          </strong>

          <span>
            The bridge between Adnova AI
            and Adnova Code.
          </span>

        </div>

        <span class="plugin-status">
          Installed
        </span>

      </div>

    </div>
  `;
}


function renderSettings() {

  breadcrumb.textContent =
    "Settings";


  pageRoot.innerHTML = `
    <div class="page">

      <div class="page-header">

        <div class="page-title">

          <h1>Settings</h1>

          <p>
            Manage your Adnova Code workspace.
          </p>

        </div>

      </div>


      <div class="settings-layout">

        <div class="settings-navigation">

          <button
            class="settings-tab ${
              state.settingsTab === "account"
                ? "active"
                : ""
            }"
            data-settings-tab="account"
          >
            Account
          </button>

          <button
            class="settings-tab ${
              state.settingsTab === "repositories"
                ? "active"
                : ""
            }"
            data-settings-tab="repositories"
          >
            Repositories
          </button>

          <button
            class="settings-tab ${
              state.settingsTab === "codespaces"
                ? "active"
                : ""
            }"
            data-settings-tab="codespaces"
          >
            Codespaces
          </button>

          <button
            class="settings-tab ${
              state.settingsTab === "plugins"
                ? "active"
                : ""
            }"
            data-settings-tab="plugins"
          >
            Plugin management
          </button>

          <button
            class="settings-tab ${
              state.settingsTab === "workspace"
                ? "active"
                : ""
            }"
            data-settings-tab="workspace"
          >
            Workspace
          </button>

        </div>


        <div>

          ${renderSettingsContent()}

        </div>

      </div>

    </div>
  `;


  pageRoot
    .querySelectorAll(
      "[data-settings-tab]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.settingsTab =
            button.dataset.settingsTab;

          renderSettings();

        }
      );

    });
}


function renderSettingsContent() {

  if (
    state.settingsTab ===
    "repositories"
  ) {

    return `
      <div class="settings-card">

        <h2>
          Repositories
        </h2>

        <p>
          Repository defaults.
        </p>

        <div class="setting-row">
          <span>Repositories</span>
          <strong>${state.repositories.length}</strong>
        </div>

        <div class="setting-row">
          <span>Default branch</span>
          <strong>main</strong>
        </div>

      </div>
    `;

  }


  if (
    state.settingsTab ===
    "codespaces"
  ) {

    return `
      <div class="settings-card">

        <h2>
          Codespaces
        </h2>

        <p>
          Workspace environment defaults.
        </p>

        <div class="setting-row">
          <span>Saved Codespaces</span>
          <strong>${state.codespaces.length}</strong>
        </div>

        <div class="setting-row">
          <span>Terminal</span>
          <strong>Integrated</strong>
        </div>

      </div>
    `;

  }


  if (
    state.settingsTab ===
    "plugins"
  ) {

    return `
      <div class="settings-card">

        <h2>
          Plugin management
        </h2>

        <p>
          Manage integrations available to this workspace.
        </p>

        <div class="plugin-card">

          <div class="plugin-icon">
            A
          </div>

          <div class="plugin-copy">

            <strong>
              Adnova Coding
            </strong>

            <span>
              Installed.
            </span>

          </div>

          <span class="plugin-status">
            Active
          </span>

        </div>

      </div>
    `;

  }


  if (
    state.settingsTab ===
    "workspace"
  ) {

    return `
      <div class="settings-card">

        <h2>
          Workspace
        </h2>

        <p>
          Development workspace defaults.
        </p>

        <div class="setting-row">
          <span>Editor</span>
          <strong>Enabled</strong>
        </div>

        <div class="setting-row">
          <span>Terminal</span>
          <strong>Integrated</strong>
        </div>

        <div class="setting-row">
          <span>Preview</span>
          <strong>Enabled</strong>
        </div>

        <div class="setting-row">
          <span>Coding AI</span>
          <strong>Adnova Coding</strong>
        </div>

      </div>
    `;

  }


  return `
    <div class="settings-card">

      <h2>
        Account
      </h2>

      <p>
        Your Adnova Code profile.
      </p>

      <div class="setting-row">
        <span>Name</span>
        <strong>
          ${escapeHtml(state.profile.name)}
        </strong>
      </div>

      <div class="setting-row">
        <span>Username</span>
        <strong>
          @${escapeHtml(state.profile.username)}
        </strong>
      </div>

    </div>
  `;
}


function createRepository() {

  const name =
    repositoryNameInput.value.trim();

  if (!name) {

    repositoryNameInput.focus();

    return;
  }


  const repository = {

    id:
      crypto.randomUUID(),

    name,

    description:
      repositoryDescriptionInput
        .value
        .trim(),

    readme:
      repositoryReadmeInput
        .checked,

    visibility:
      repositoryVisibilityInput
        .value,

    defaultBranch:
      "main",

    createdAt:
      Date.now()

  };


  state.repositories.unshift(
    repository
  );

  saveState();

  renderSidebarRepositories();

  closeRepositoryModal();


  repositoryNameInput.value =
    "";

  repositoryDescriptionInput.value =
    "";

  repositoryReadmeInput.checked =
    true;

  repositoryVisibilityInput.value =
    "public";


  showToast(
    `${repository.name} created.`
  );


  state.page =
    "repository";

  renderRepository(
    repository
  );
}


function updateNavigation() {

  document
    .querySelectorAll(
      ".nav-link[data-page]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page ===
          state.page
      );

    });

}


function renderPage() {

  updateNavigation();

  if (
    state.page ===
    "home"
  ) {

    renderHome();

    return;
  }


  if (
    state.page ===
    "repositories"
  ) {

    renderRepositories();

    return;
  }


  if (
    state.page ===
    "codespaces"
  ) {

    renderCodespaces();

    return;
  }


  if (
    state.page ===
    "branches"
  ) {

    renderBranches();

    return;
  }


  if (
    state.page ===
    "plugins"
  ) {

    renderPlugins();

    return;
  }


  if (
    state.page ===
    "settings"
  ) {

    renderSettings();

    return;
  }


  renderHome();
}


document
  .querySelectorAll(
    ".nav-link[data-page]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        state.page =
          button.dataset.page;

        renderPage();

      }
    );

  });


document
  .getElementById(
    "create-repository-button"
  )
  .addEventListener(
    "click",
    openRepositoryModal
  );


document
  .getElementById(
    "close-modal"
  )
  .addEventListener(
    "click",
    closeRepositoryModal
  );


document
  .getElementById(
    "create-repository-confirm"
  )
  .addEventListener(
    "click",
    createRepository
  );


repositoryNameInput
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        createRepository();

      }

    }
  );


document
  .getElementById(
    "profile-button"
  )
  .addEventListener(
    "click",
    () => {

      state.page =
        "settings";

      state.settingsTab =
        "account";

      renderSettings();

    }
  );


document
  .getElementById(
    "top-avatar-button"
  )
  .addEventListener(
    "click",
    () => {

      state.page =
        "settings";

      state.settingsTab =
        "account";

      renderSettings();

    }
  );


document
  .getElementById(
    "mobile-menu-button"
  )
  .addEventListener(
    "click",
    () => {

      document
        .querySelector(
          ".sidebar"
        )
        .classList.toggle(
          "mobile-open"
        );

    }
  );


document
  .getElementById(
    "repository-modal"
  )
  .addEventListener(
    "click",
    event => {

      if (
        event.target ===
        repositoryModal
      ) {

        closeRepositoryModal();

      }

    }
  );


document
  .getElementById(
    "profile-name"
  )
  .textContent =
    state.profile.name;


document
  .getElementById(
    "profile-handle"
  )
  .textContent =
    `@${state.profile.username}`;


renderSidebarRepositories();
renderPage();
