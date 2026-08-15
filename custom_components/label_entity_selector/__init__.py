from __future__ import annotations

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er
from homeassistant.config_entries import ConfigEntry

DOMAIN = "label_entity_selector"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Label Entity Selector component."""

    async def handle_add_label(call: ServiceCall) -> None:
        """Add a label to entities via Entity Registry."""
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
        """Remove a label from entities via Entity Registry."""
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

    hass.services.async_register(DOMAIN, "add_label", handle_add_label)
    hass.services.async_register(DOMAIN, "remove_label", handle_remove_label)

    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry."""
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return True
