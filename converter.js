// Google sheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet')
require('dotenv').config()

// File handling package
const fs = require('fs')

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = process.env.GOOGLE_SHEET_ID // Framework - API Details Planner - Google Sheet ID

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