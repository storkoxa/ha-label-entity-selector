class LabelEntitySelectorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.search = "";
    this.config = {};
    this.domInitialized = false;
  }

  setConfig(config) {
    if (!config.all_label || !config.selected_label) {
      throw new Error("You must define both all_label and selected_label");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.domInitialized) {
      this.initDOM();
      this.domInitialized = true;
    }
    this.updateColumns();
  }

  getCardSize() {
    return 8;
  }

  // 1. Get ALL entities that have the base label (e.g., alarm_sensor)
  getEntities() {
    if (!this._hass || !this._hass.entities) return [];

    return Object.values(this._hass.entities).filter((entity) => {
      const labels = entity.labels || [];
      return labels.includes(this.config.all_label);
    });
  }

  // 2. Check if they ALSO have the selected label (e.g., alarm_home)
  isSelected(entity) {
    const labels = entity.labels || [];
    return labels.includes(this.config.selected_label);
  }

  async moveEntity(entityId, currentlySelected) {
    await this._hass.callService(
      "label_entity_selector",
      currentlySelected ? "remove_label" : "add_label",
      {
        entity_id: entityId,
        label_id: this.config.selected_label,
      }
    );
  }

  initDOM() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: var(--ha-card-background, var(--card-background-color));
          border-radius: var(--ha-card-border-radius, 12px);
          padding: 16px;
          box-shadow: var(--ha-card-box-shadow);
          color: var(--primary-text-color);
        }
        .header { margin-bottom: 16px; }
        .title { font-size: 1.2em; font-weight: 500; }
        .subtitle { color: var(--secondary-text-color); font-size: 0.9em; }
        .search {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 10px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          margin-bottom: 16px;
          outline: none;
        }
        .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .column {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 8px;
          min-height: 200px;
        }
        .column-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px; padding: 0 4px;
        }
        .column-title { font-size: 0.9em; font-weight: 600; color: var(--secondary-text-color); }
        .count {
          background: var(--primary-color); color: var(--text-primary-color);
          border-radius: 12px; padding: 2px 8px; font-size: 0.8em; font-weight: 600;
        }
        .entity {
          display: flex; align-items: center; gap: 12px;
          padding: 10px; margin-bottom: 8px; border-radius: 6px;
          background: var(--card-background-color);
          cursor: pointer; transition: background 0.2s;
        }
        .entity:hover { background: var(--divider-color); }
        .icon { font-size: 1.2em; width: 24px; text-align: center; }
        .name { flex: 1; font-size: 0.95em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .empty { text-align: center; color: var(--secondary-text-color); padding: 20px; font-size: 0.9em; }
        @media (max-width: 600px) { .columns { grid-template-columns: 1fr; } }
      </style>

      <div class="card">
        <div class="header">
          <div class="title">${this.config.title || "Label Entity Selector"}</div>
          <div class="subtitle">${this.config.subtitle || ""}</div>
        </div>
        <input class="search" placeholder="Search entities..." />
        <div class="columns" id="columns-container"></div>
      </div>
    `;

    const searchInput = this.shadowRoot.querySelector(".search");
    searchInput.addEventListener("input", (e) => {
      this.search = e.target.value.toLowerCase();
      this.updateColumns();
    });
  }

  updateColumns() {
    if (!this._hass || !this.config) return;

    const entities = this.getEntities();
    
    const filtered = entities.filter((entity) => {
      const stateObj = this._hass.states[entity.entity_id];
      const name = stateObj?.attributes?.friendly_name || entity.name || entity.original_name || entity.entity_id;
      return name.toLowerCase().includes(this.search);
    });

    const available = filtered.filter((entity) => !this.isSelected(entity));
    const selected = filtered.filter((entity) => this.isSelected(entity));

    const container = this.shadowRoot.getElementById("columns-container");
    
    container.innerHTML = `
      <div class="column">
        <div class="column-header">
          <span class="column-title">Selected</span>
          <span class="count">${selected.length}</span>
        </div>
        ${selected.length ? selected.map(e => this.entityTemplate(e, true)).join("") : `<div class="empty">No entities selected</div>`}
      </div>
      <div class="column">
        <div class="column-header">
          <span class="column-title">Available</span>
          <span class="count">${available.length}</span>
        </div>
        ${available.length ? available.map(e => this.entityTemplate(e, false)).join("") : `<div class="empty">No available entities</div>`}
      </div>
    `;

    this.shadowRoot.querySelectorAll(".entity").forEach((el) => {
      el.addEventListener("click", () => {
        this.moveEntity(el.dataset.entity, el.dataset.selected === "true");
      });
    });
  }

  entityTemplate(entity, isSelected) {
    const stateObj = this._hass.states[entity.entity_id];
    const name = stateObj?.attributes?.friendly_name || entity.name || entity.original_name || entity.entity_id;

    return `
      <div class="entity" data-entity="${entity.entity_id}" data-selected="${isSelected}" title="${isSelected ? "Remove label" : "Add label"}">
        <div class="icon">${isSelected ? "－" : "＋"}</div>
        <div class="name">${name}</div>
      </div>
    `;
  }

  // Required for UI Editor
  static getConfigElement() {
    return document.createElement("label-entity-selector-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Alarm Setup",
      all_label: "alarm_sensor",
      selected_label: "alarm_home",
    };
  }
}

// Visual Form Editor Class for Lovelace UI popup
class LabelEntitySelectorCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  render() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.shadowRoot.innerHTML = `
      <style>
        .form { display: flex; flex-direction: column; gap: 16px; padding: 8px; }
        .row { display: flex; flex-direction: column; gap: 6px; }
        label { font-weight: 500; font-size: 0.9em; color: var(--secondary-text-color); }
        input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 1em;
          outline: none;
        }
      </style>
      <div class="form">
        <div class="row">
          <label>Card Title</label>
          <input type="text" id="title" value="${this._config?.title || ""}" />
        </div>
        <div class="row">
          <label>Subtitle</label>
          <input type="text" id="subtitle" value="${this._config?.subtitle || ""}" />
        </div>
        <div class="row">
          <label>Base Pool Label ID (e.g., alarm_sensor)</label>
          <input type="text" id="all_label" value="${this._config?.all_label || ""}" />
        </div>
        <div class="row">
          <label>Selected Toggle Label ID (e.g., alarm_home)</label>
          <input type="text" id="selected_label" value="${this._config?.selected_label || ""}" />
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (e) => {
        if (!this._config) return;
        const newConfig = {
          ...this._config,
          [e.target.id]: e.target.value,
        };
        this._config = newConfig;
        const event = new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    });
  }
}

// Register both custom elements safely
if (!customElements.get("label-entity-selector-card")) {
  customElements.define("label-entity-selector-card", LabelEntitySelectorCard);
}

if (!customElements.get("label-entity-selector-card-editor")) {
  customElements.define("label-entity-selector-card-editor", LabelEntitySelectorCardEditor);
}

window.customCards = window.customCards || [];
const cardExists = window.customCards.some(card => card.type === "label-entity-selector-card");

if (!cardExists) {
  window.customCards.push({
    type: "label-entity-selector-card",
    name: "Label Entity Selector",
    description: "Two-column entity selector based on Home Assistant labels",
  });
}