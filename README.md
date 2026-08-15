# Label Entity Selector for Home Assistant

A powerful two-column dashboard card and backend integration for Home Assistant that lets you dynamically manage entity membership using **Labels**.

---

## Features

* **Dynamic Multi-Card Support:** Install the backend services once, and create as many independent dashboard cards as you want using different label combinations (e.g., Alarm Home vs. Alarm Away).
* **Two-Column Interface:** View your active/selected entities on the left and available options on the right at a glance.
* **Instant Registry Updates:** Clicking an entity instantly updates Home Assistant's Entity Registry via backend services without requiring a system restart.
* **Built-in Search:** Easily filter through large lists of entities directly within the card.
* **Fully Responsive:** Adapts seamlessly to mobile screens and dashboards.

---

## Installation
[![HACS Default](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=storkoxa&repository=ha-label-entity-selector&category=plugin)


### 1. Backend Integration (Manual)
1. Copy the `custom_components/label_entity_selector` folder into your Home Assistant `config/custom_components/` directory.
2. Restart Home Assistant.
3. Go to **Settings > Devices & Services > Add Integration**, search for **Label Entity Selector**, and click submit.

### 2. Frontend Card (Manual / HACS)
1. Ensure the `label-entity-selector-card.js` file is placed in your `config/www/` directory.
2. Go to **Settings > Dashboards > Resources**, click **Add Resource**, and use:
   * **URL:** `/local/label-entity-selector-card.js`
   * **Resource Type:** `JavaScript Module`
3. Refresh your browser cache (`Ctrl+F5`).

---

## Example Usage

Add a manual card to your Lovelace dashboard with your desired label IDs:

```yaml
type: custom:label-entity-selector-card
title: Alarm - Home Mode
subtitle: Entities assigned to the home alarm
all_label: alarm_sensor
selected_label: alarm_home
