import React, { useState } from "react";
import styled from "styled-components";

// request stuff
const REQUEST_URI = { pattern: "Request URI=", code: "REQUEST_URI", label: "Request URI" };
const REQUEST_METHOD = { pattern: "Request method=", code: "REQUEST_METHOD", label: "Request method" };
const REQUEST_PARAMS = { pattern: "Request parameters=", code: "REQUEST_PARAMS", label: "Request params" };
const REQUEST_HEADERS = { pattern: "Request headers=", code: "REQUEST_HEADERS", label: "Request headers" };
const REQUEST_BODY = { pattern: "Request body={", code: "REQUEST_BODY", label: "Request body" }; // multi line

// response stuff
const RESPONSE_STATUS = { pattern: "Respose status=", code: "RESPONSE_STATUS", label: "Response status" };
const RESPONSE_HEADERS = { pattern: "Respose headers=", code: "RESPONSE_HEADERS", label: "Response headers" };
const RESPONSE_BODY = { pattern: "Responce body={", code: "RESPONSE_BODY", label: "Response body", multiline: true };

const TextArea = styled.textarea`
  width: 100%;
  height: 250px;
  padding: 8px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 2px;
  background-color: #f8f8f8;
  font-size: 10px;
`;

const Button = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 2px;
`;

const LogInfoHeader = styled.div`
  background-color: #777;
  color: white;
  cursor: pointer;
  padding: 18px;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
`;

const LogList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 8px 0;
`;

const ListItem = styled.li`
  border-radius: 2px;
  border: 2px solid #ccc;
  margin-bottom: 4px;
`;

const LogValue = styled.div`
  padding: 8px;
`;

function App() {
  const [logValue, setLogValue] = useState("");
  const [parsedLogValue, setParsedLogValue] = useState([]);

  const updateLogValue = e => setLogValue(e.target.value);

  const getSingleLineNetworkData = line => {
    if (!line || line.trim() === "") return null;
    if (line.startsWith(REQUEST_URI.pattern))
      return { ...REQUEST_URI, value: line.substring(REQUEST_URI.pattern.length) };
    if (line.startsWith(REQUEST_METHOD.pattern))
      return { ...REQUEST_METHOD, value: line.substring(REQUEST_METHOD.pattern.length) };
    if (line.startsWith(REQUEST_PARAMS.pattern))
      return { ...REQUEST_PARAMS, value: line.substring(REQUEST_PARAMS.pattern.length) };
    if (line.startsWith(REQUEST_HEADERS.pattern))
      return { ...REQUEST_HEADERS, value: line.substring(REQUEST_HEADERS.pattern.length) };
    if (line.startsWith(RESPONSE_STATUS.pattern))
      return { ...RESPONSE_STATUS, value: line.substring(RESPONSE_STATUS.pattern.length) };
    if (line.startsWith(RESPONSE_HEADERS.pattern))
      return { ...RESPONSE_HEADERS, value: line.substring(RESPONSE_HEADERS.pattern.length) };
    return null;
  };

  const parseLogAsync = async () => {
    const lines = logValue.split("\n");
    if (lines.length === 0) return [];
    const res = [];
    let parsingBody = false;
    let bodyString = "";
    let bodyRes = {};
    lines.forEach(line => {
      if (parsingBody) {
        if (line === "}") {
          parsingBody = false;
          bodyString += "}";
          // debugger;
          res.push({ ...bodyRes, value: JSON.parse(bodyString) });
        } else bodyString += line;
      } else if (line.startsWith(REQUEST_BODY.pattern) || line.startsWith(RESPONSE_BODY.pattern)) {
        bodyString = "{";
        bodyRes = line.startsWith(REQUEST_BODY.pattern) ? { ...REQUEST_BODY } : { ...RESPONSE_BODY };
        parsingBody = true;
      } else {
        const networkData = getSingleLineNetworkData(line);
        if (networkData) res.push(networkData);
      }
    });
    return res;
  };

  const parseLog = () => {
    parseLogAsync().then(parsedLogValue => setParsedLogValue(parsedLogValue));
  };

  return (
    <div>
      <TextArea onChange={updateLogValue} onPaste={updateLogValue} />
      <Button onClick={parseLog}>Parse log</Button>
      <LogList>
        {parsedLogValue.map((logValue, index) => (
          <ListItem key={index}>
            <LogInfoHeader>{logValue.label}</LogInfoHeader>
            <LogValue>
              <code>
                <pre>{JSON.stringify(logValue.value, undefined, 2)}</pre>
              </code>
            </LogValue>
          </ListItem>
        ))}
      </LogList>
    </div>
  );
}

export default App;
