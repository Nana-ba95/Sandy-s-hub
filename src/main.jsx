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
          {String(this.state.error.stack || this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorCatcher>
      <BusinessApp />
    </ErrorCatcher>
  </React.StrictMode>
);
