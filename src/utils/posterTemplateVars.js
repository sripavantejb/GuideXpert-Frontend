/**
 * Replace `{{token}}` placeholders using a variables object. Unknown keys keep the original token.
 * @param {string} str
 * @param {Record<string, string | number | null | undefined>} [variables]
 */
export function applyTemplateVars(str, variables = {}) {
  if (str == null) return '';
  const s = String(str);
  if (!variables || typeof variables !== 'object') return s;
  return s.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, rawKey) => {
    const key = String(rawKey).trim();
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const v = variables[key];
      return v != null ? String(v) : '';
    }
    return `{{${key}}}`;
  });
}
