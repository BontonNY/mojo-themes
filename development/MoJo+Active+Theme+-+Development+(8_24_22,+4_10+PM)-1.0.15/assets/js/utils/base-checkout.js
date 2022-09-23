/* eslint-disable */
import Log from "./Log";

export default class BaseCheckout {

    _LastActiveStep = null

    constructor() {
        this.Initialize();
        setInterval(() => { this._RunEventManager() }, 500);
    }

    async Initialize() {
        Log("Event Manager:", "Initialize");
    }

    Customer() {
        Log("Event Manager:", "Customer");
    }

    Shipping() {
        Log("Event Manager:", "Shipping");
    }

    Billing() {
        Log("Event Manager:", "Billing");
    }

    Payment() {
        Log("Event Manager:", "Payment");
    }

    Confirmation() {
        Log("Event Manager:", "Confirmation");
    }

    _RunEventManager() {
        var isCustomerStep = $("#checkout-customer-continue").is(':visible');
        var isShippingStep = $("legend:contains('Shipping Method')").is(':visible');
        var isBillingStep = $("legend:contains('Billing Address')").is(':visible');
        var isPaymentStep = $(".checkout-step--payment .checkout-view-content").is(':visible');
        var isConfirmationStep = $("h1:contains('Thank you!')").is(':visible');
    
        isCustomerStep ? this._Change('Customer') : null;
        isShippingStep ? this._Change('Shipping') : null;
        isBillingStep ? this._Change('Billing') : null;
        isPaymentStep ? this._Change('Payment') : null;
        isConfirmationStep ? this._Change('Confirmation') : null;
    }

    _Change(step) {
        if(step in this && this._LastActiveStep !== step) {
            Log("Event Manager:", "Changing Step to", step);
            this[step]();
            this._LastActiveStep = step;
        }
    }

}
