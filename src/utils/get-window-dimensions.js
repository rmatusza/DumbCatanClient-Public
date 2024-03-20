const getWindowDimensions = (window) => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default getWindowDimensions;