// Google sheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet')
require('dotenv').config()

// File handling package
const fs = require('fs')

// spreadsheet key is the long id in the sheets URL
// const RESPONSES_SHEET_ID = '1x2BWpHXf1yjRC1ffC6P2-RaHhCb1g81mOpcUkVBi0sE'; // test import node
const RESPONSES_SHEET_ID = '18luYPKfAXvdTctng458fHUrz911ZeZmlM3E00xJ7lvs' // Copia de New Framework - API Details Planner

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID)

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('googleCredentials.json'))

const getContractRoles = async () => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  })

  await doc.loadInfo()

  // get Service Contract rows
  const serviceContractSheet =
    doc.sheetsByTitle['SC - Master (ServiceContract)']
  await serviceContractSheet.loadHeaderRow()
  const serviceContractRows = await serviceContractSheet.getRows()
  const serviceContractData = serviceContractRows.map(row => ({
    name: row['Name'],
    apiFieldName: row['API Field Name'],
    get: row['Partner Needs this Information (API GET)'],
    put: row['Allow Partner to Push Updates to Sunrun via API'],
  }))

  const serviceContractEventSheet =
    doc.sheetsByTitle['SCE - Master (Service_Contract_Event__c)']
  const serviceContractEventRows = await serviceContractEventSheet.getRows()
  const serviceContractEventData = serviceContractEventRows.map(row => ({
    name: row['Name'],
    apiFieldName: row['API Field Name'],
    get: row['Partner Needs this Information (API GET)'],
    put: row['Allow Partner to Push Updates to Sunrun via API'],
  }))

  serviceContractData.push(...serviceContractEventData)

  const partnerData = {
    contracts: {
      get: serviceContractData
        .filter(row => row.get === 'Yes')
        .filter(row => row.apiFieldName !== '')
        .map(row => row.apiFieldName),
      put: serviceContractData
        .filter(row => row.put === 'Yes')
        .filter(row => row.apiFieldName !== '')
        .map(row => row.apiFieldName),
    },
  }
  fs.writeFileSync('partner.json', JSON.stringify(partnerData, null, 2))
}

getContractRoles()

const addRow = async rows => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  })

  await doc.loadInfo()

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0]

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    await sheet.addRow(row)
  }
}

let rows = [
  {
    email: 'email@email.com',
    user_name: 'ramesh',
    password: 'abcd@1234',
  },
  {
    email: 'email@gmail.com',
    user_name: 'dilip',
    password: 'abcd@1234',
  },
]

// addRow(rows);

const updateRow = async (keyValue, oldValue, newValue) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  })

  await doc.loadInfo()

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0]

  let rows = await sheet.getRows()

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    if (row[keyValue] === oldValue) {
      rows[index][keyValue] = newValue
      await rows[index].save()
      break
    }
  }
}

// updateRow('email', 'email@gmail.com', 'ramesh@ramesh.com')

const deleteRow = async (keyValue, thisValue) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  })

  await doc.loadInfo()

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0]

  let rows = await sheet.getRows()

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    if (row[keyValue] === thisValue) {
      await rows[index].delete()
      break
    }
  }
}

// deleteRow('email', 'ramesh@ramesh.com')
