require("dotenv").config();
const { query } = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/v1/serialnumbers", async (req, res) => {
  const results = await query('SELECT DISTINCT "Serial_Number" FROM readings;');
  const uniqueSerialNumbers = results.rows.map((row) => {
    return row.Serial_Number;
  });
  res.status(200).json({
    total: uniqueSerialNumbers.length,
    data: uniqueSerialNumbers,
  });
});

app.get("/api/v1/deviceids", async (req, res) => {
  const results = await query('SELECT DISTINCT "Device_ID" FROM readings;');
  const uniqueDeviceIds = results.rows.map((row) => {
    return row.Device_ID;
  });
  res.status(200).json({
    total: uniqueDeviceIds.length,
    data: uniqueDeviceIds,
  });
});

app.get("/api/v1/chartdata", async (req, res) => {
  const { sn, dvcid } = req.query;

  let results;

  if (!sn && dvcid) {
    results = await query(
      `SELECT "Wattage", "DateTime" FROM readings WHERE "Device_ID"=$1`,
      [dvcid]
    );
  } else if (sn && !dvcid) {
    results = await query(
      `SELECT "Wattage", "DateTime" FROM readings WHERE "Serial_Number"=$1`,
      [sn]
    );
  } else {
    results = await query(
      `SELECT "Wattage", "DateTime" FROM readings WHERE "Serial_Number"=$1 AND "Device_ID"=$2`,
      [sn, dvcid]
    );
  }

  res.status(200).json({
    total: results.rows.length,
    data: results.rows,
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
