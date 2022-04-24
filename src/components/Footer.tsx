import React from "react";
import Icon from "@material-ui/icons/ShowChartRounded";
import "../style/footer.scss";

export const Footer: React.FunctionComponent = () => {
  return (
    <footer className="footer">
      <a className="icon" href="/">
        <Icon />
      </a>
      <div className="links">
        <div className="item title">Graphing Calculator </div>
      </div>
    </footer>
  );
};
