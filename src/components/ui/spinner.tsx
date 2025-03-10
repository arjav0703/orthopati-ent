import * as React from "react";

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${className}`}></div>
);

export { Spinner }; 