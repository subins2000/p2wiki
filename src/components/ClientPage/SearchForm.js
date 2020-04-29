import React from "react";

const SearchForm = ({ query, handleChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <div style={{ textAlign: "center" }} className="control">
          <input
            className="input is-rounded"
            id="query"
            type="Text"
            placeholder="🔍 Search for an article"
            onChange={handleChange}
            name="query"
            value={query}
          />
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
