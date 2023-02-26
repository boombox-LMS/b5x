import React, { useState, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import he from "he";
import styled from "styled-components/macro";
import { muiTheme } from "../../theme";

const FlashMessageWrapper = styled.div`
  position: absolute;
  width: 300px;
  text-align: right;
  top: -33px;
  right: 0px;
  font-size: 0.9em;
  font-style: italic;
  color: ${muiTheme.palette.secondary.main};
  transition: 0.4s;
  opacity: ${(props) => (props.isActive ? 100 : 0)}%;
`;

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
    >
      <TextCopierWrapper>
        <FlashMessageWrapper isActive={copied}>
          copied to clipboard
        </FlashMessageWrapper>
        <CopyToClipboard onCopy={() => setCopied(true)} text={textToCopy}>
          <TextCopierIconWrapper onClick={() => setCopied(true)}>
            <CopyOutlined />
          </TextCopierIconWrapper>
        </CopyToClipboard>
      </TextCopierWrapper>
      <div>
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
