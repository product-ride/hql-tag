export const isNode = (node) => {
  if (typeof node === "object" || Array.isArray(node)) {
    return true;
  }
};
