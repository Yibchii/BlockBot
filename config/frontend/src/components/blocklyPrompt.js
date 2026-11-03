import * as Blockly from "blockly";
import "./blocklyPrompt.css";

export function installBlocklyPrompt() {
  let dismiss = null;

  Blockly.dialog.setPrompt((message, defaultValue, callback) => {
    dismiss?.();

    const previousFocus = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "blockbot-prompt";
    dialog.setAttribute("aria-labelledby", "blockbot-prompt-title");

    const form = document.createElement("form");
    const title = document.createElement("h2");
    title.id = "blockbot-prompt-title";
    title.textContent = "Edit name";

    const label = document.createElement("label");
    label.htmlFor = "blockbot-prompt-input";
    label.textContent = message;

    const input = document.createElement("input");
    input.id = "blockbot-prompt-input";
    input.type = "text";
    input.value = defaultValue;
    input.autocomplete = "off";

    const actions = document.createElement("div");
    actions.className = "blockbot-prompt-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";

    const save = document.createElement("button");
    save.type = "submit";
    save.className = "blockbot-prompt-save";
    save.textContent = "Save";

    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      dismiss = null;
      dialog.close();
      dialog.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
      callback(value);
    };

    dismiss = () => finish(null);
    cancel.addEventListener("click", () => finish(null));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    dialog.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Blockly retains responsibility for validating the supplied name.
      finish(input.value);
    });

    actions.append(cancel, save);
    form.append(title, label, input, actions);
    dialog.append(form);
    document.body.append(dialog);
    dialog.showModal();
    input.focus();
    input.select();
  });

  return () => {
    Blockly.dialog.setPrompt();
    dismiss?.();
  };
}
