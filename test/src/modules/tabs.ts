export function setupTabs(
  tabs: NodeListOf<HTMLButtonElement>,
  contents: NodeListOf<HTMLElement>,
): void {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTabId = tab.dataset.tab;
      if (!targetTabId) {
        return;
      }

      tabs.forEach((item) => item.classList.remove("active"));
      contents.forEach((content) => content.classList.remove("active"));

      tab.classList.add("active");
      const target = document.getElementById(`${targetTabId}-tab`);
      if (target) {
        target.classList.add("active");
      }
    });
  });
}

