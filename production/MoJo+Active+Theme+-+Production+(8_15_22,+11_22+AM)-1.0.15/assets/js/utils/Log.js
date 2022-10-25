/* eslint-disable */
export default (...messages) => /localhost|mybigcommerce|sandbox/.test(window.location.host) ? console.log(...messages) : () => {};
