from __future__ import annotations

from homeassistant import config_entries

DOMAIN = "label_entity_selector"

class LabelEntitySelectorConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a Label Entity Selector config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        """Handle the initial setup."""
        
        # Only allow one instance of this integration to be installed
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title="Label Entity Selector Services",
                data={},
            )

        return self.async_show_form(step_id="user")

