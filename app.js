// Google sheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet')
require('dotenv').config()

// File handling package
const fs = require('fs')

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = process.env.GOOGLE_SHEET_ID // Framework - API Details Planner - Google Sheet ID
console.log('RESPONSES_SHEET_ID', RESPONSES_SHEET_ID)

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID)

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('googleCredentials.json'))

const obtainMappers = async () => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  })

  await doc.loadInfo()

  const contracts = {}
  const partner = {
    contracts: {
      patch: [],
    },
  }
  const patch = []

  // get Service Contract rows
  const serviceContractSheet = doc.sheetsByTitle['Contract Requirements']
  await serviceContractSheet.loadHeaderRow()
  const serviceContractRows = await serviceContractSheet.getRows()
  const serviceContractData = serviceContractRows
    .map(row => ({
      object: row['Object'],
      name: row['Name'],
      apiFieldName: row['API Field Name'],
      get: row['Partner Needs this Information (API GET)'],
      put: row['Allow Partner to Push Updates to Sunrun via API'],
    }))
    .filter(value => value.get === 'Yes')
  serviceContractData.forEach(row => {
    if (row.object.endsWith('__c')) {
      contracts[`Service_Contract_Event__r.${row.name}`] = row.apiFieldName
    } else {
      contracts[row.name] = row.apiFieldName
    }
  })
  // console.log('serviceContractData: ', serviceContractData)
  // console.log('Records count: ', serviceContractData.length)

  fs.writeFileSync('contracts.json', JSON.stringify(contracts, null, 2))

  // patch Service Contract rows

  const serviceContractPatchData = serviceContractRows
    .map(row => ({
      object: row['Object'],
      name: row['Name'],
      apiFieldName: row['API Field Name'],
      get: row['Partner Needs this Information (API GET)'],
      put: row['Allow Partner to Push Updates to Sunrun via API'],
    }))
    .filter(value => value.get === 'Yes' && value.put === 'Yes')

  serviceContractPatchData.forEach(row => patch.push(row.apiFieldName))
  console.log('patch: ', patch)

  partner.contracts.patch = patch
  fs.writeFileSync('partner.json', JSON.stringify(partner, null, 2))

  // const serviceContractEventSheet =
  //   doc.sheetsByTitle['SCE - Master (Service_Contract_Event__c)']
  // const serviceContractEventRows = await serviceContractEventSheet.getRows()
  // const serviceContractEventData = serviceContractEventRows.map(row => ({
  //   name: row['Name'],
  //   apiFieldName: row['API Field Name'],
  //   get: row['Partner Needs this Information (API GET)'],
  //   put: row['Allow Partner to Push Updates to Sunrun via API'],
  // }))

  // serviceContractData.push(...serviceContractEventData)

  // const partnerData = {
  //   contracts: {
  //     get: serviceContractData
  //       .filter(row => row.get === 'Yes')
  //       .filter(row => row.apiFieldName !== '')
  //       .map(row => row.apiFieldName),
  //     put: serviceContractData
  //       .filter(row => row.put === 'Yes')
  //       .filter(row => row.apiFieldName !== '')
  //       .map(row => row.apiFieldName),
  //   },
  // }
  // fs.writeFileSync('partner.json', JSON.stringify(partnerData, null, 2))
}

obtainMappers()
