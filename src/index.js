import AdmZip from "adm-zip"
import iconv from "iconv-lite"
import xml2js from "xml2js"
import fetch from "node-fetch"

const prepareBICDataForDBWhrite = async () => {
  const response = await fetch("http://www.cbr.ru/s/newbik")
  const arrayBufferFromZip = await response.arrayBuffer()
  const bufferFromZip = Buffer.from(arrayBufferFromZip)
  const zipArchive = new AdmZip(bufferFromZip)
  const zipEntries = zipArchive.getEntries()
  let xmlData
  for (const entry of zipEntries) {
    xmlData = entry.getData().toString("binary")
  }
  const decodedXmlData = iconv
    .decode(Buffer.from(xmlData, "binary"), "cp1251")
    .toString()
  const parser = new xml2js.Parser({ explicitArray: false })
  const parsedXml = await parser.parseStringPromise(decodedXmlData)

  const bicDirectoryEntries = parsedXml.ED807.BICDirectoryEntry

  const result = []

  for (const entry of bicDirectoryEntries) {
    const bic = entry["$"].BIC
    const name = entry.ParticipantInfo["$"].NameP
    const accounts = entry.Accounts

    if (accounts && Array.isArray(accounts)) {
      for (const account of accounts) {
        const corrAccount = account["$"].Account
        result.push({ bic, name, corrAccount })
      }
    }
  }

  return result
}

prepareBICDataForDBWhrite()
