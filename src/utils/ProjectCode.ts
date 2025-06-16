// utils/generateProjectCode.js
export const generateProjectCode = (projectName:string) => {
  const prefix = projectName
    .replace(/[^a-zA-Z]/g, "") // remove non-letter chars
    .toUpperCase()
    .slice(0, 3);

  const date = new Date();
  const dateStr = date
    .toISOString()
    .slice(2, 10) // 'YY-MM-DD'
    .replace(/-/g, "");

  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random number

  return `${prefix}-${dateStr}-${randomSuffix}`;
};
