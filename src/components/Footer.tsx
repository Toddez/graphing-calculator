import React from "react";
import Icon from "@material-ui/icons/ShowChart";
import "../style/footer.scss";

export const Footer: React.FunctionComponent = () => {
  return (
    <footer className="footer">
      <a className="icon" href="/">
        <Icon />
      </a>
      <div className="links">
        <div className="item copyright">
          &copy; {new Date().getFullYear()}{" "}
          <a href="https://github.com/Toddez">Teo Carlsson</a>
        </div>
      </div>
    </footer>
  );
};
