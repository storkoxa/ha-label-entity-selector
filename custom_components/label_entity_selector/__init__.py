from __future__ import annotations

import logging
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er
from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

DOMAIN = "label_entity_selector"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Label Entity Selector component from YAML (optional)."""
    _LOGGER.info(">>> [Label Entity Selector] async_setup called")
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Label Entity Selector from a config entry."""
    _LOGGER.info(">>> [Label Entity Selector] async_setup_entry called for entry %s", entry.entry_id)

    async def handle_add_label(call: ServiceCall) -> None:
        _LOGGER.info(">>> [Label Entity Selector] Service called: add_label with data: %s", call.data)
        entity_ids = call.data["entity_id"]
        label_id = call.data["label_id"]

        if isinstance(entity_ids, str):
            entity_ids = [entity_ids]

        registry = er.async_get(hass)
        for entity_id in entity_ids:
            entity = registry.async_get(entity_id)
            if entity:
                new_labels = set(entity.labels)
                new_labels.add(label_id)
                registry.async_update_entity(entity_id, labels=new_labels)

    async def handle_remove_label(call: ServiceCall) -> None:
        _LOGGER.info(">>> [Label Entity Selector] Service called: remove_label with data: %s", call.data)
        entity_ids = call.data["entity_id"]
        label_id = call.data["label_id"]

        if isinstance(entity_ids, str):
            entity_ids = [entity_ids]

        registry = er.async_get(hass)
        for entity_id in entity_ids:
            entity = registry.async_get(entity_id)
            if entity and label_id in entity.labels:
                new_labels = set(entity.labels)
                new_labels.discard(label_id)
                registry.async_update_entity(entity_id, labels=new_labels)

    # Register services and log success
    hass.services.async_register(DOMAIN, "add_label", handle_add_label)
    hass.services.async_register(DOMAIN, "remove_label", handle_remove_label)
    _LOGGER.info(">>> [Label Entity Selector] Services 'add_label' and 'remove_label' successfully registered!")

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info(">>> [Label Entity Selector] async_unload_entry called")
    hass.services.async_remove(DOMAIN, "add_label")
    hass.services.async_remove(DOMAIN, "remove_label")
    return True