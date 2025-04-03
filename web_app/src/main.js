import './style.css';
import mammoth from "mammoth";

function getUserInput() {

  // Check if any files were uploaded.
  const fileInput = document.getElementById("fileInput");
  const folderInput = document.getElementById("folderInput");

  const inputFiles = fileInput.files;
  const inputFolder = folderInput.files;

  const allFiles = [...inputFiles, ...inputFolder];

  if (allFiles.length > 0) {

    for (const file of allFiles) {

      if (!file.name.endsWith(".txt") && !file.name.endsWith(".docx")) {
        continue;
      }

      const fileReader = new FileReader();

      // Handle TXT files
      if (file.name.endsWith(".txt")) {
        fileReader.onload = function() {
          console.log("TXT File Content:", fileReader.result);
          addMessageToHistory("Added TXT File: " + file.name + "\n" + fileReader.result, true);
        };
        fileReader.readAsText(file);
      }

      // Handle DOCX files
      else if (file.name.endsWith(".docx")) {
        fileReader.onload = function(event) {
          const arrayBuffer = event.target.result;
          mammoth.extractRawText({ arrayBuffer })
            .then(function(result) {
              console.log("Extracted DOCX Text:", result.value);
              addMessageToHistory("Added docx file: " + file.name, true);
            })
            .catch(function(err) {
              console.error("Error processing DOCX file:", err);
              addMessageToHistory("Error reading " + file.name, true);
            });
        };
        fileReader.readAsArrayBuffer(file);
      }
    }

    fileInput.value = null;
    folderInput.value = null;

    document.getElementById("fileCount").innerText = "0 Files Selected";
  }

  // Check if a message was sent
  const inputTextArea = document.getElementById("inputTextArea");
  const userMessage = inputTextArea.value.trim();

  // Add the user message to the history
  if (userMessage !== "") {
    addMessageToHistory(userMessage, true);
    inputTextArea.value = "";
  }
}

function addMessageToHistory(message, fromUser) {

  const messageContainer = document.getElementById("messageContainer");

  // Create a new message element.
  let newUserMessageElement = document.createElement("div");
  newUserMessageElement.innerText = message;

  if (fromUser) {
    newUserMessageElement.classList.add("userMessage");
  } else {
    newUserMessageElement.classList.add("chatbotMessage");
  }

  messageContainer.appendChild(newUserMessageElement);

}

function updateFileCount() {
  let fileCount = document.getElementById("fileInput").files.length;

  const folderInput = document.getElementById("folderInput").files;

  for (const file of folderInput) {

    // Check if the file is a valid selectable target.
    if (file.name.endsWith(".txt") || (file.name.endsWith(".docx"))) {
      fileCount++;
    }
  }

  console.log(fileCount)

  document.getElementById("fileCount").innerText = fileCount + " Files Selected";
}

document.querySelector("#submitUserQuery").addEventListener("click", getUserInput)
document.getElementById("fileInput").addEventListener("change", updateFileCount)
document.getElementById("folderInput").addEventListener("change", updateFileCount)

