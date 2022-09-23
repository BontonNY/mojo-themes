import React from "react";
import { render } from "react-dom";

if(document.getElementById("hello-world")) {
    render(<div>Hello, hello-world application!</div>, document.getElementById("hello-world"));
}
