function getTemplate(templateId) {
  const template = document.getElementById(templateId);

  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Template ${templateId} was not found.`);
  }

  return template;
}

export function cloneTemplateRoot(templateId) {
  const template = getTemplate(templateId);
  const firstElement = template.content.firstElementChild;

  if (!firstElement) {
    throw new Error(`Template ${templateId} does not contain a root element.`);
  }

  return firstElement.cloneNode(true);
}

export function buildScoreHistoryContent(scores) {
  if (!scores.length) {
    return cloneTemplateRoot('score-history-empty-template');
  }

  const tableShell = cloneTemplateRoot('score-history-table-template');
  const tableBody = tableShell.querySelector('tbody');

  if (!tableBody) {
    return tableShell;
  }

  scores.forEach((score) => {
    const row = cloneTemplateRoot('score-history-row-template');
    const typeCell = row.querySelector('[data-score-field="type"]');
    const scoreCell = row.querySelector('[data-score-field="score"]');
    const triggeredCell = row.querySelector('[data-score-field="triggeredDate"]');

    if (typeCell) {
      typeCell.textContent = score.type;
    }

    if (scoreCell) {
      scoreCell.textContent = Number(score.score).toFixed(1);
    }

    if (triggeredCell) {
      triggeredCell.textContent = new Date(score.triggeredDate).toLocaleString();
    }

    tableBody.appendChild(row);
  });

  return tableShell;
}
