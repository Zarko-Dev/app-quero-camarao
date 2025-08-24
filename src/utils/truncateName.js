export const truncateName = (name, size = 20) =>
    `${name.substring(0, size)}${name.length < size ? "" : "..."}`;
