import React from "react";
import openExternalLink from "../helpers/open_external_link";

const GithubLink = () => {
  return (
    <footer className="github-container">
      Check out the code on{" "}
      <button
        className="github-button"
        onClick={(e) => {
          e.preventDefault();
          openExternalLink("https://github.com/peterbucci/VectorMathReact");
        }}
      >
        Github
      </button>
    </footer>
  );
};

export default GithubLink;
