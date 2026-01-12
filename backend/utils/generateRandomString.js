const generateRandomString = (length) => {
  return [...Array(length)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join('');
};

export default generateRandomString;
