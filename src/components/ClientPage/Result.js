import React from "react";

const Result = React.forwardRef((title, ref) => (
  <div ref={ref}></div>
));

export default Result;
