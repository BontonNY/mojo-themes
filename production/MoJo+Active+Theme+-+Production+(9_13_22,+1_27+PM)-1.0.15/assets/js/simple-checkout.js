/* eslint-disable */
import Log from "./utils/Log";
import BaseCheckout from "./utils/base-checkout";
const SimpleCheckout = new BaseCheckout();

SimpleCheckout.Initialize = () => {
  Log("Event Manager:", "Initialize");
};

SimpleCheckout.Customer = () => {
  Log("Event Manager:", "Customer");
};

SimpleCheckout.Shipping = () => {
  Log("Event Manager:", "Shipping");
};

SimpleCheckout.Billing = () => {
  Log("Event Manager:", "Billing");
};

SimpleCheckout.Payment = () => {
  Log("Event Manager:", "Payment");
};

SimpleCheckout.Confirmation = () => {
  Log("Event Manager:", "Confirmation");
};
