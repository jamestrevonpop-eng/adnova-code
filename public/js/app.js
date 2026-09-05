const $ = (selector) => document.querySelector(selector);

const createRepositoryButton = $("#create-repository");
const repositoryModal = $("#repository-modal");
const closeModal = $("#close-modal");
const createRepoConfirm = $("#create-repo-confirm");

const repoNameInput = $("#repo-name");
const repoReadmeInput = $("#repo-readme");
const repoVisibilityInput = $("#repo-visibility");

const projectList = $("#project-list");
const repositoryName = $("#repository-name");
const branchName = $("#branch-name");
const fileTree = $("#file-tree");
const currentFile = $("#current-file");
const editorContent = $("#editor-content");

const terminalInput = $("#terminal-command");
const terminalOutput = $("#terminal-output");

const aiInput = $("#ai-input");
const aiSend = $("#ai-send");
const aiMessages = $("#ai-messages");

const repositories = [];

function printTerminal(text) {
  const line = document.createElement("div");
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function openModal() {
  repositoryModal.classList.remove("hidden");
  repoNameInput.focus();
}

function closeRepositoryModal() {
  repositoryModal.classList.add("hidden");
}

function createRepository() {
  const name = repoNameInput.value.trim();

  if (!name) {
    repoNameInput.focus();
    return;
  }

  const repository = {
    id: crypto.randomUUID(),
    name,
    visibility: repoVisibilityInput.value,
    readme: repoReadmeInput.checked,
    branch: "main",
    files: repoReadmeInput.checked
      ? ["README.md"]
      : []
  };

  repositories.push(repository);

  repositoryName.textContent = repository.name;
  branchName.textContent = repository.branch;

  projectList.innerHTML = "";

  for (const item of repositories) {
    const button = document.createElement("button");

    button.textContent =
      `${item.visibility === "public" ? "◉" : "●"} ${item.name}`;

    button.style.cssText = `
      border:0;
      background:transparent;
      text-align:left;
      padding:8px;
      border-radius:7px;
      cursor:pointer;
    `;

    button.addEventListener("click", () => {
      repositoryName.textContent = item.name;
      branchName.textContent = item.branch;
      renderFiles(item);
    });

    projectList.appendChild(button);
  }

  renderFiles(repository);

  printTerminal(`Created repository: ${repository.name}`);
  printTerminal(`Visibility: ${repository.visibility}`);
  printTerminal(`Branch: ${repository.branch}`);

  closeRepositoryModal();
  repoNameInput.value = "";
}

function renderFiles(repository) {
  fileTree.innerHTML = "";

  if (!repository.files.length) {
    const empty = document.createElement("div");
    empty.className = "empty-files";
    empty.textContent = "No files.";
    fileTree.appendChild(empty);
    return;
  }

  for (const file of repository.files) {
    const button = document.createElement("button");

    button.textContent = `📄 ${file}`;
    button.style.cssText = `
      display:block;
      width:100%;
      border:0;
      background:transparent;
      text-align:left;
      padding:8px;
      border-radius:6px;
      cursor:pointer;
    `;

    button.addEventListener("click", () => {
      currentFile.textContent = file;
      editorContent.innerHTML = `
        <pre style="
          margin:0;
          padding:18px;
          font-family:ui-monospace,monospace;
          font-size:13px;
          line-height:1.6;
        ">${file === "README.md" ? "# " + repository.name + "\\n" : ""}</pre>
      `;
    });

    fileTree.appendChild(button);
  }
}

terminalInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  const command = terminalInput.value.trim();
  terminalInput.value = "";

  if (!command) return;

  printTerminal(`> ${command}`);

  if (command === "clear") {
    terminalOutput.innerHTML = "";
    return;
  }

  if (command === "pwd") {
    printTerminal("/projects");
    return;
  }

  if (command === "ls") {
    printTerminal(
      repositories.length
        ? repositories.map((repo) => repo.name).join("  ")
        : "(empty)"
    );
    return;
  }

  if (command === "help") {
    printTerminal("pwd  ls  clear  help");
    return;
  }

  printTerminal(`Command received: ${command}`);
});

async function sendCodingPrompt() {
  const prompt = aiInput.value.trim();

  if (!prompt) return;

  const userMessage = document.createElement("div");
  userMessage.className = "ai-message";
  userMessage.textContent = prompt;
  aiMessages.appendChild(userMessage);

  aiInput.value = "";

  try {
    const response = await fetch("/api/plugin/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        model: "adnova-5-sol",
        context: {
          repository: repositoryName.textContent,
          branch: branchName.textContent
        },
        attachments: []
      })
    });

    const data = await response.json();

    const answer = document.createElement("div");
    answer.className = "ai-message";

    answer.textContent = data.ok
      ? `Adnova Coding received your request for ${data.service}.`
      : (data.error || "Request failed.");

    aiMessages.appendChild(answer);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  } catch (error) {
    const answer = document.createElement("div");
    answer.className = "ai-message";
    answer.textContent = "Adnova Coding could not reach the workspace backend.";

    aiMessages.appendChild(answer);
  }
}

createRepositoryButton.addEventListener("click", openModal);
closeModal.addEventListener("click", closeRepositoryModal);
createRepoConfirm.addEventListener("click", createRepository);

aiSend.addEventListener("click", sendCodingPrompt);

aiInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendCodingPrompt();
  }
});

repoNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createRepository();
  }
});

printTerminal("Ready.");
