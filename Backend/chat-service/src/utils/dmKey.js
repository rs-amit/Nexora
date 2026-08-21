export const buildDmKey = (userIdA, userIdB) => {
  return [String(userIdA), String(userIdB)].sort().join("_");
};
