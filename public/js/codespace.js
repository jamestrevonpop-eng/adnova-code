const params = new URLSearchParams(location.search);

const repository =
  params.get("repository") ||
  "project";

const branch =
  params.get("branch") ||
  "main";

const workspaceKey =
  `adnova-code-workspace-${repository}`;

const filesKey =
  `${workspaceKey}-files`;

const savedFiles =
  JSON.parse(
    localStorage.getItem(filesKey) ||
    "null"
  );

const files =
  savedFiles ||
  {
    "README.md":
      `# ${repository}\n\nAdnova Code workspace.\n\nBranch: ${branch}\n`,

    "package.json":
      `{\n  "name": "${repository}",\n  "version": "1.0.0"\n}\n`,

    "src/main.js":
      `console.log("Hello from ${repository}");\n`
  };

let currentFile = "README.md";

const terminals = [
  {
    id: crypto.randomUUID(),
    name: "Terminal 1",
    cwd: `/projects/${repository}`,
    running: false
  }
];

let activeTerminal =
  terminals[0].id;

let terminalPanel =
  "terminal";


const fileTree =
  document.getElementById(
    "file-tree"
  );

const editor =
  document.getElementById(
    "editor"
  );

const editorName =
  document.getElementById(
    "editor-name"
  );

const editorStatus =
  document.getElementById(
    "editor-status"
  );

const terminalTabs =
  document.getElementById(
    "terminal-tabs"
  );

const terminalOutput =
  document.getElementById(
    "terminal-output"
  );

const terminalInput =
  document.getElementById(
    "terminal-input"
  );

const aiPanel =
  document.getElementById(
    "ai-panel"
  );


function saveFiles() {

  localStorage.setItem(
    filesKey,
    JSON.stringify(files)
  );

}


function printTerminal(
  text,
  error = false
) {

  const line =
    document.createElement(
      "div"
    );

  line.className =
    "terminal-line" +
    (
      error
        ? " error"
        : ""
    );

  line.textContent =
    text;

  terminalOutput.appendChild(
    line
  );

  terminalOutput.scrollTop =
    terminalOutput.scrollHeight;

}


function currentTerminal() {

  return terminals.find(
    terminal =>
      terminal.id ===
      activeTerminal
  );

}


function renderTerminalTabs() {

  terminalTabs.innerHTML =
    terminals
      .map(
        terminal => `
          <button
            class="terminal-tab ${
              terminal.id ===
              activeTerminal
                ? "active"
                : ""
            }"
            data-terminal="${terminal.id}"
          >
            ${terminal.name}
          </button>
        `
      )
      .join("");


  terminalTabs
    .querySelectorAll(
      "[data-terminal]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            activeTerminal =
              button.dataset
                .terminal;

            renderTerminalTabs();

            printTerminal(
              `Switched to ${
                currentTerminal().name
              }`
            );

            terminalInput.focus();

          }
        );

      }
    );

}


function renderFiles() {

  const names =
    Object.keys(files)
      .sort();


  if (!names.length) {

    fileTree.innerHTML = `
      <div class="empty-files">
        No files yet.
      </div>
    `;

    return;
  }


  fileTree.innerHTML =
    names
      .map(
        name => {

          const folder =
            name.includes("/");


          return `
            <button
              class="file-item ${
                name ===
                currentFile
                  ? "active"
                  : ""
              }"
              data-file="${encodeURIComponent(name)}"
            >
              <span>
                ${
                  folder
                    ? "📄"
                    : "📄"
                }
              </span>

              ${name}
            </button>
          `;

        }
      )
      .join("");


  fileTree
    .querySelectorAll(
      "[data-file]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openFile(
              decodeURIComponent(
                button.dataset.file
              )
            );

          }
        );

      }
    );

}


function openFile(
  name
) {

  currentFile =
    name;

  editorName.textContent =
    name;

  editor.value =
    files[name] ||
    "";

  editorStatus.textContent =
    "Saved";

  renderFiles();

}


function executeCommand(
  raw
) {

  const command =
    raw.trim();

  if (!command) {
    return;
  }


  printTerminal(
    `› ${command}`
  );


  const terminal =
    currentTerminal();


  if (
    command ===
    "clear"
  ) {

    terminalOutput.innerHTML =
      "";

    return;

  }


  if (
    command ===
    "pwd"
  ) {

    printTerminal(
      terminal.cwd
    );

    return;

  }


  if (
    command ===
    "ls" ||
    command ===
    "ls -la"
  ) {

    const prefix =
      terminal.cwd
        .replace(
          `/projects/${repository}`,
          ""
        )
        .replace(
          /^\//,
          ""
        );


    const visible =
      Object.keys(files)
        .filter(
          file =>
            !prefix ||
            file.startsWith(
              prefix
            )
        );


    if (!visible.length) {

      printTerminal(
        "(empty)"
      );

    } else {

      visible.forEach(
        file =>
          printTerminal(
            file
          )
      );

    }

    return;

  }


  if (
    command.startsWith(
      "cd "
    )
  ) {

    const target =
      command
        .slice(3)
        .trim();


    if (
      target ===
      ".."
    ) {

      terminal.cwd =
        terminal.cwd
          .replace(
            /\/[^/]+$/,
            ""
          );

      printTerminal(
        terminal.cwd
      );

      return;

    }


    terminal.cwd =
      target.startsWith(
        "/"
      )
        ? target
        : `${terminal.cwd}/${target}`;


    printTerminal(
      terminal.cwd
    );

    return;

  }


  if (
    command.startsWith(
      "mkdir "
    )
  ) {

    const folder =
      command
        .slice(6)
        .trim();


    if (!folder) {
      return;
    }


    const marker =
      folder.endsWith("/")
        ? folder
        : `${folder}/`;


    files[
      `${marker}.gitkeep`
    ] =
      "";


    saveFiles();
    renderFiles();


    printTerminal(
      `Created folder ${folder}`
    );

    return;

  }


  if (
    command.startsWith(
      "touch "
    )
  ) {

    const name =
      command
        .slice(6)
        .trim();


    if (!name) {
      return;
    }


    files[name] =
      "";


    saveFiles();
    renderFiles();


    openFile(
      name
    );


    printTerminal(
      `Created ${name}`
    );

    return;

  }


  if (
    command.startsWith(
      "echo "
    )
  ) {

    printTerminal(
      command.slice(5)
    );

    return;

  }


  if (
    command ===
    "npm install"
  ) {

    terminal.running =
      true;


    printTerminal(
      "npm install"
    );

    printTerminal(
      "Resolving packages..."
    );


    setTimeout(
      () => {

        terminal.running =
          false;

        printTerminal(
          "Packages installed."
        );

      },
      900
    );

    return;

  }


  if (
    command ===
    "npm start"
  ) {

    if (
      terminal.running
    ) {

      printTerminal(
        "A process is already running."
      );

      return;

    }


    terminal.running =
      true;


    printTerminal(
      "Starting project..."
    );


    printTerminal(
      "Server running."
    );


    return;

  }


  if (
    command ===
    "npm test"
  ) {

    terminal.running =
      true;


    printTerminal(
      "Running tests..."
    );


    setTimeout(
      () => {

        terminal.running =
          false;

        printTerminal(
          "Test run complete."
        );

      },
      800
    );

    return;

  }


  if (
    command ===
    "node --version"
  ) {

    printTerminal(
      "Node.js"
    );

    return;

  }


  if (
    command ===
    "npm --version"
  ) {

    printTerminal(
      "npm"
    );

    return;

  }


  if (
    command ===
    "git status"
  ) {

    printTerminal(
      "On branch " +
      branch
    );

    printTerminal(
      "working tree available"
    );

    return;

  }


  if (
    command ===
    "help"
  ) {

    [
      "pwd",
      "ls",
      "ls -la",
      "cd <folder>",
      "cd ..",
      "mkdir <folder>",
      "touch <file>",
      "echo <text>",
      "clear",
      "npm install",
      "npm start",
      "npm test",
      "node --version",
      "npm --version",
      "git status"
    ]
    .forEach(
      item =>
        printTerminal(
          item
        )
    );

    return;

  }


  printTerminal(
    `Command not implemented in the workspace prototype: ${command}`,
    true
  );

}


function newTerminal() {

  const terminal = {

    id:
      crypto.randomUUID(),

    name:
      `Terminal ${
        terminals.length + 1
      }`,

    cwd:
      `/projects/${repository}`,

    running:
      false

  };


  terminals.push(
    terminal
  );


  activeTerminal =
    terminal.id;


  renderTerminalTabs();


  printTerminal(
    `${terminal.name} created.`
  );


  terminalInput.focus();

}


document
  .getElementById(
    "new-terminal"
  )
  .addEventListener(
    "click",
    newTerminal
  );


terminalInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      executeCommand(
        terminalInput.value
      );

      terminalInput.value =
        "";

      return;

    }


    if (
      event.ctrlKey &&
      event.key.toLowerCase() ===
        "c"
    ) {

      const terminal =
        currentTerminal();


      if (
        terminal.running
      ) {

        terminal.running =
          false;

        printTerminal(
          "^C"
        );

        printTerminal(
          "Process interrupted."
        );

      } else {

        printTerminal(
          "^C"
        );

      }

    }

  }
);


editor.addEventListener(
  "input",
  () => {

    editorStatus.textContent =
      "Unsaved";

  }
);


document
  .getElementById(
    "save-button"
  )
  .addEventListener(
    "click",
    () => {

      files[currentFile] =
        editor.value;

      saveFiles();

      editorStatus.textContent =
        "Saved";

    }
  );


document
  .getElementById(
    "new-file"
  )
  .addEventListener(
    "click",
    () => {

      const name =
        prompt(
          "New file name"
        );

      if (!name) {
        return;
      }

      files[name] =
        "";

      saveFiles();
      renderFiles();
      openFile(name);

    }
  );


document
  .getElementById(
    "new-folder"
  )
  .addEventListener(
    "click",
    () => {

      const name =
        prompt(
          "New folder name"
        );

      if (!name) {
        return;
      }

      files[
        `${name}/.gitkeep`
      ] =
        "";

      saveFiles();
      renderFiles();

      printTerminal(
        `Created folder ${name}`
      );

    }
  );


document
  .getElementById(
    "preview-button"
  )
  .addEventListener(
    "click",
    () => {

      window.open(
        location.origin +
        "/",
        "_blank"
      );

    }
  );


document
  .getElementById(
    "ai-button"
  )
  .addEventListener(
    "click",
    () => {

      aiPanel.classList.remove(
        "hidden-panel"
      );

    }
  );


document
  .getElementById(
    "close-ai"
  )
  .addEventListener(
    "click",
    () => {

      aiPanel.classList.add(
        "hidden-panel"
      );

    }
  );


document
  .querySelectorAll(
    ".terminal-panel"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          terminalPanel =
            button.dataset
              .terminalPanel;


          document
            .querySelectorAll(
              ".terminal-panel"
            )
            .forEach(
              item =>
                item.classList.toggle(
                  "active",
                  item ===
                    button
                )
            );


          terminalOutput.innerHTML =
            "";


          if (
            terminalPanel ===
            "ports"
          ) {

            printTerminal(
              "No forwarded ports."
            );

          } else if (
            terminalPanel ===
            "debug"
          ) {

            printTerminal(
              "Debug Console ready."
            );

          } else if (
            terminalPanel ===
            "output"
          ) {

            printTerminal(
              "Output panel ready."
            );

          } else if (
            terminalPanel ===
            "problems"
          ) {

            printTerminal(
              "No problems detected."
            );

          }

        }
      );

    }
  );


async function sendAI() {

  const input =
    document.getElementById(
      "ai-input"
    );

  const messages =
    document.getElementById(
      "ai-messages"
    );


  const prompt =
    input.value.trim();


  if (!prompt) {
    return;
  }


  const user =
    document.createElement(
      "div"
    );

  user.className =
    "ai-message user";

  user.textContent =
    prompt;

  messages.appendChild(
    user
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
              prompt,
              model:
                "adnova-5-sol",

              context: {
                repository,
                branch,
                currentFile
              },

              attachments:
                []
            })
        }
      );


    const data =
      await response.json();


    const answer =
      document.createElement(
        "div"
      );

    answer.className =
      "ai-message";


    answer.textContent =
      data.ok
        ? "Adnova Coding received the request."
        : (
            data.error ||
            "Request failed."
          );


    messages.appendChild(
      answer
    );


  } catch {

    const answer =
      document.createElement(
        "div"
      );

    answer.className =
      "ai-message";

    answer.textContent =
      "The Coding plugin service is unavailable.";

    messages.appendChild(
      answer
    );

  }

}


document
  .getElementById(
    "ai-send"
  )
  .addEventListener(
    "click",
    sendAI
  );


document
  .getElementById(
    "ai-input"
  )
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendAI();

      }

    }
  );


document
  .getElementById(
    "workspace-back"
  )
  .addEventListener(
    "click",
    () => {

      window.close();

      setTimeout(
        () => {
          location.href =
            "/";
        },
        100
      );

    }
  );


document
  .getElementById(
    "workspace-repository"
  )
  .textContent =
    repository;


document
  .getElementById(
    "workspace-branch"
  )
  .textContent =
    branch;


document
  .getElementById(
    "workspace-path"
  )
  .textContent =
    `/projects/${repository}`;


renderTerminalTabs();

renderFiles();

openFile(
  currentFile
);

printTerminal(
  `Adnova Code workspace: ${repository}`
);

printTerminal(
  `Branch: ${branch}`
);

printTerminal(
  "Type help for available commands."
);

terminalInput.focus();
