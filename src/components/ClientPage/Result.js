import React from "react";

const Result = ({ title, htmlResult }) => {
  return (
    <div className="container mx-auto">
      <h1 className="title text-4xl">{title}</h1>
      <div dangerouslySetInnerHTML={htmlResult} />
    </div>
  );
};

export default Result;
