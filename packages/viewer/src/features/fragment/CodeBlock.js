import React, { useState, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import he from "he";
import styled from "styled-components/macro";

/*
.code-block .text-copier .text-copier__flash {
  position: absolute;
  width: 300px;
  text-align: right;
  top: -33px;
  right: 0px;
  font-size: 0.9em;
  font-style: italic;
  color: var(--pop);
  transition: 0.4s;
}

.text-copier__flash--active {
  opacity: 100%;
}

.text-copier__flash--inactive {
  opacity: 0%;
}

*/

const TextCopierWrapper = styled.div`
  position: absolute;
  right: 3px;
  top: 6px;
`;

const TextCopierIconWrapper = styled.div`
  color: white;
  font-size: 1.2em;
  padding: 0px 3px;
  border-radius: 2px;
  opacity: 70%;
`;

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
    <div
      css={`
        position: relative;
      `}
      className="code-block"
    >
      <TextCopierWrapper className="text-copier">
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
          <TextCopierIconWrapper onClick={() => setCopied(true)}>
            <CopyOutlined />
          </TextCopierIconWrapper>
        </CopyToClipboard>
      </TextCopierWrapper>
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
