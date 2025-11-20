type OptionView = {
  option: HTMLOptionElement;
  item: HTMLLIElement;
};

const enhancedRegistry = new Set<HTMLElement>();
let listenersReady = false;

function closeAll(except?: HTMLElement) {
  enhancedRegistry.forEach((wrapper) => {
    if (wrapper !== except) {
      wrapper.classList.remove("is-open");
      const trigger = wrapper.querySelector<HTMLButtonElement>(".select-trigger");
      trigger?.setAttribute("aria-expanded", "false");
    }
  });
}

function ensureGlobalListeners() {
  if (listenersReady) {
    return;
  }
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !target.closest(".enhanced-select")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
  listenersReady = true;
}

function buildOptionList(
  select: HTMLSelectElement,
  listEl: HTMLUListElement,
  onSelect: (option: HTMLOptionElement) => void,
): OptionView[] {
  const views: OptionView[] = [];
  Array.from(select.options).forEach((option) => {
    const item = document.createElement("li");
    item.className = "select-option";
    item.setAttribute("role", "option");
    item.dataset.value = option.value;
    item.textContent = option.textContent?.trim() ?? option.value;

    if (option.disabled) {
      item.setAttribute("aria-disabled", "true");
    } else {
      item.addEventListener("click", () => onSelect(option));
    }

    listEl.appendChild(item);
    views.push({ option, item });
  });

  return views;
}

function syncSelection(select: HTMLSelectElement, views: OptionView[]) {
  const selectedOption = select.selectedOptions[0] ?? select.options[0];
  views.forEach(({ option, item }) => {
    item.classList.toggle("selected", option === selectedOption);
  });
  return selectedOption;
}

function updateDisabledState(
  select: HTMLSelectElement,
  wrapper: HTMLElement,
  trigger: HTMLButtonElement,
) {
  if (select.disabled) {
    wrapper.classList.add("is-disabled");
    trigger.setAttribute("aria-disabled", "true");
    trigger.disabled = true;
    closeAll(wrapper);
  } else {
    wrapper.classList.remove("is-disabled");
    trigger.removeAttribute("aria-disabled");
    trigger.disabled = false;
  }
}

function handleKeyboardSelection(
  event: KeyboardEvent,
  select: HTMLSelectElement,
  views: OptionView[],
  onSelect: (option: HTMLOptionElement) => void,
  wrapper: HTMLElement,
) {
  if (select.disabled) {
    return;
  }

  const selectableOptions = views.filter(({ option }) => !option.disabled);
  if (!selectableOptions.length) {
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    const currentIndex = selectableOptions.findIndex(
      ({ option }) => option.value === select.value,
    );
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + step + selectableOptions.length) %
          selectableOptions.length;
    onSelect(selectableOptions[nextIndex].option);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (wrapper.classList.contains("is-open")) {
      closeAll();
    } else {
      closeAll(wrapper);
      wrapper.classList.add("is-open");
      const trigger = wrapper.querySelector<HTMLButtonElement>(".select-trigger");
      trigger?.setAttribute("aria-expanded", "true");
    }
  }
}

export function enhanceSelect(select: HTMLSelectElement) {
  if (select.dataset.enhanced === "true") {
    return;
  }

  ensureGlobalListeners();

  const wrapper = document.createElement("div");
  wrapper.className = "enhanced-select";
  wrapper.setAttribute("role", "combobox");
  wrapper.setAttribute("aria-haspopup", "listbox");
  wrapper.dataset.targetSelect = select.id;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const valueDisplay = document.createElement("span");
  valueDisplay.className = "select-value";
  trigger.appendChild(valueDisplay);

  const dropdown = document.createElement("div");
  dropdown.className = "select-dropdown";
  const list = document.createElement("ul");
  list.className = "select-options";
  list.setAttribute("role", "listbox");
  dropdown.appendChild(list);

  wrapper.append(trigger, dropdown);
  select.insertAdjacentElement("afterend", wrapper);
  select.dataset.enhanced = "true";
  select.classList.add("is-enhanced-select");
  enhancedRegistry.add(wrapper);

  const views = buildOptionList(select, list, (option) => {
    if (option.disabled) return;
    const changed = select.value !== option.value;
    select.value = option.value;
    syncSelection(select, views);
    valueDisplay.textContent = option.textContent?.trim() ?? option.value;
    closeAll();
    if (changed) {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  const initial = syncSelection(select, views);
  valueDisplay.textContent =
    initial?.textContent?.trim() ?? initial?.value ?? "请选择";

  trigger.addEventListener("click", () => {
    if (select.disabled) {
      return;
    }
    const willOpen = !wrapper.classList.contains("is-open");
    closeAll(willOpen ? wrapper : undefined);
    if (willOpen) {
      wrapper.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    } else {
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  wrapper.addEventListener("keydown", (event) =>
    handleKeyboardSelection(event, select, views, (option) => {
      const changed = select.value !== option.value;
      select.value = option.value;
      syncSelection(select, views);
      valueDisplay.textContent = option.textContent?.trim() ?? option.value;
      if (changed) {
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, wrapper),
  );

  select.addEventListener("change", () => {
    const current = syncSelection(select, views);
    valueDisplay.textContent =
      current?.textContent?.trim() ?? current?.value ?? "请选择";
  });

  const observer = new MutationObserver(() =>
    updateDisabledState(select, wrapper, trigger),
  );
  observer.observe(select, { attributes: true, attributeFilter: ["disabled"] });
  updateDisabledState(select, wrapper, trigger);
}

export function enhanceSelectGroup(selects: HTMLSelectElement[]) {
  selects.forEach((select) => enhanceSelect(select));
}

