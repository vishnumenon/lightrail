import prettier from "prettier/standalone";
import prettierBabelParser from "prettier/parser-babel";

export function sanitizeComponentName(name: string) {
  let sanitized = name.replaceAll(/\s/g, "");
  sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
  return sanitized;
}

export function formatComponentTree(code: string) {
  let formatted;
  try {
    formatted = prettier
      .format(code, {
        parser: "babel",
        semi: false,
        plugins: [prettierBabelParser],
      })
      .replace(/^;+|;+$/g, "");
  } catch (e) {
    console.error(e);
    formatted = code;
  }

  return formatted;
}