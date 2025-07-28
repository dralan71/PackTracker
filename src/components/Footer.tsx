import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer: React.FC = () => (
  <footer className="app-footer">
    <span>Copyright (c) 2025 Alan C &nbsp;|&nbsp; </span>
    <a
      href="https://github.com/dralan71/PackTracker"
      target="_blank"
      rel="noopener noreferrer"
      className="github-link"
      title="Contribute at GitHub"
    >
      <span className="github-link-text">Contribute</span>
      <FaGithub className="github-icon" />
    </a>
  </footer>
);

export default Footer;
