/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import "./style.css";
import { ethers } from "ethers";

const SenderTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { wallets, setWallets, isConnected, walletAddress } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = wallets && wallets.slice(indexOfFirstItem, indexOfLastItem);
  }, [wallets, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const uploadWallet = async (e) => {
    try {
      const file = e.target.files[0]; // Get the uploaded file
      if (!file) {
        console.error("No file selected");
        return;
      }

      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = event.target.result; // Read file content

        // Split the content by newlines to handle rows
        const rows = data.split(/\r?\n/); // Split by newlines (handles both \n and \r\n)

        // Flatten rows into a single array of addresses
        const dataArray = rows
          .map((row) => row.split(",")) // Split each row by commas
          .flat() // Flatten the array of arrays into a single array
          .map((item) => item.trim()) // Trim whitespace from each item
          .filter((item) => item !== ""); // Remove empty items

        // Validate addresses (example: check if they are non-empty and match a specific format)
        const isValidAddress = (address) => {
          // Example validation: check if the address is a valid string (customize as needed)
          return address.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(address); // Example: Ethereum address format
        };

        const resultArr = dataArray.filter((item) => isValidAddress(item)); // Keep only valid addresses
        setWallets(resultArr); // Update state with valid addresses
      };

      reader.readAsText(file); // Read the file as text
    } catch (error) {
      console.error("Error uploading wallet:", error);
    }
  };

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>{isConnected ? "Yes" : "No"}</th>
            <th>{isConnected ? walletAddress : "Wallet Address"}</th>
          </tr>
        </thead>
        <tbody>
        {wallets && wallets.length > 0 ? (
          wallets.map((e, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td style={{ wordBreak: "break-word" }}>{e}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="2">No data</td>
          </tr>
        )}
      </tbody>
      </Table>

      {/* <Pagination>
        {[
          ...Array(Math.ceil(wallets && wallets.length / itemPerPage)).key(),
        ].map(
          // eslint-disable-next-line array-callback-return
          (number) => {
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>;
          }
        )}
      </Pagination> */}

      <div className="tableButton">
        <Button
          className="uploadButton"
          disabled={!isConnected}
          onClick={uploadWallet}
        >
          Upload file
          <input
          type="file"
          accept=".csv"
          onChange={uploadWallet}
          style={{ display: "block", marginBottom: "10px" }}
        />
        </Button>
        {/* <InputGroup className="addButton">
          <Form.Control
            placeholder="New Wallet Address"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            aria-disabled={!isConnected}
          />
          <Button variant="primary" id="button-addon2" disabled={!isConnected}>
            Add
          </Button>
        </InputGroup> */}
      </div>
    </div>
  );
};

export default SenderTable;
