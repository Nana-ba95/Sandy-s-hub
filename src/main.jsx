import React from "react";
import ReactDOM from "react-dom/client";
import BusinessApp from "./BusinessApp.jsx";

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 20, color: "red", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          {"NAME: " + this.state.error.name + "\n"}
          {"MESSAGE: " + this.state.error.message + "\n\n"}
          {"STACK:\n" + String(this.state.error.stack || "")}
        </pre>
      );
    }
    return this.props.children;
  }
}

// Also catch errors that happen outside React's render (e.g. during module load)
window.addEventListener("error", (e) => {
  document.getElementById("root").innerHTML =
    "<pre style='padding:20px;color:red;white-space:pre-wrap;font-family:monospace'>WINDOW ERROR: " +
    (e.message || "") + "\n" + (e.error && e.error.stack ? e.error.stack : "") +
    "</pre>";
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorCatcher>
      <BusinessApp />
    </ErrorCatcher>
  </React.StrictMode>
);
