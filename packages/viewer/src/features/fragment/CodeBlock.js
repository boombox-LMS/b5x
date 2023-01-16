import React, { useState, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import he from "he";

export const CodeBlock = ({ fragment }) => {
  const [textToCopy, setTextToCopy] = useState(fragment.contents);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  return (
    <div className="code-block">
      <div className="text-copier">
        <div
          className={`text-copier__flash ${
            copied
              ? "text-copier__flash--active"
              : "text-copier__flash--inactive"
          }`}
        >
          copied to clipboard
        </div>
        <CopyToClipboard onCopy={() => setCopied(true)} text={textToCopy}>
          <div className="text-copier__icon" onClick={() => setCopied(true)}>
            <CopyOutlined />
          </div>
        </CopyToClipboard>
      </div>
      <div className="code-block__contents">
        <SyntaxHighlighter
          language={fragment.data.language}
          style={a11yDark}
          wrapLongLines={true}
        >
          {he.decode(fragment.contents)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
