# API Details Planner - Google Sheet to JSON converter

## Google Account setup

1. Go to Google Cloud Platform: 
Google Cloud Platform https://console.cloud.google.com
2. In the menu icon at the top left, click on APIs & Services > Credentials
3. Click + CREATE CREDENTIALS > Service account.
4. Type a name for the service account and click create and continue, and select the role Project > Owner.
5. Then click in the service account, go to keys, and click Add Key >> Create new key >> JSON.
6. Download the JSON file and save it in the root of the project with the name googleCredentials.json.
7. Go to APIS & Services > Enabled APIs and services, click "+Enable APIs and Services" and search for Google Sheets API and enable it.
8. Share the Google Sheet with the email address of the service account you created in step 3.

## Env variables: 
with the downloaded JSON credentials file, you can either use this file or setup env variables with the following values:

```GOOGLE_CLIENT_EMAIL``` (Google Credentials from Google Cloud Platform)

```GOOGLE_PRIVATE_KEY``` (Google Credentials from Google Cloud Platform)

Additionally, it's required to add the following env variables:

```GOOGLE_SHEET_ID``` it's part of the google sheet url: e.g:
- https://docs.google.com/spreadsheets/d/```1X2X3X4X5X6X7X8X9X```/edit#gid=0

## Caveat

- It is required that every header (first row in the sheet) must have a unique name, otherwise the script will fail.
- The script takes the header names and google sheet names to gather the data from the sheet. If the header name or google sheet name is not the same as the code, the script will fail.

## Installation

```npm install```

## Usage

You can run this script every time you would like to update partner.json file based on Google Sheet data.
```npm start``` or ```node converter.js```


