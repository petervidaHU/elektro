import { createTheme, type MantineThemeOverride } from "@mantine/core";

/**
 * Touch-first theme: every learning interaction must work on a phone, with
 * touch only and no keyboard.
 *
 * - `MIN_TOUCH_TARGET` is the minimum hit area for anything interactive.
 * - Default component sizes are one step larger than Mantine's defaults, so a
 *   control is comfortable to hit without zooming.
 */
export const MIN_TOUCH_TARGET = "44px";

export const theme: MantineThemeOverride = createTheme({
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  primaryColor: "blue",
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: { size: "md" },
      styles: { root: { minHeight: MIN_TOUCH_TARGET } },
    },
    ActionIcon: {
      defaultProps: { size: "lg" },
      styles: { root: { minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET } },
    },
    NumberInput: {
      defaultProps: {
        size: "md",
        // Steppers let a value be changed without a keyboard.
        hideControls: false,
        step: 1,
      },
      styles: { input: { minHeight: MIN_TOUCH_TARGET, fontSize: "1rem" } },
    },
    TextInput: {
      defaultProps: { size: "md" },
      styles: { input: { minHeight: MIN_TOUCH_TARGET, fontSize: "1rem" } },
    },
    PasswordInput: {
      defaultProps: { size: "md" },
      styles: { input: { minHeight: MIN_TOUCH_TARGET, fontSize: "1rem" } },
    },
    Select: {
      defaultProps: { size: "md" },
      styles: { input: { minHeight: MIN_TOUCH_TARGET, fontSize: "1rem" } },
    },
    SegmentedControl: {
      defaultProps: { size: "md", fullWidth: true },
      styles: { label: { minHeight: MIN_TOUCH_TARGET, display: "flex", alignItems: "center", justifyContent: "center" } },
    },
    Anchor: {
      styles: { root: { minHeight: MIN_TOUCH_TARGET, display: "inline-flex", alignItems: "center" } },
    },
  },
});
