import fs from "node:fs"
import AdmZip from "adm-zip"
import iconv from "iconv-lite"
import xml2js from "xml2js"
import { pipeline } from "node:stream"
import { promisify } from "node:util"
import fetch from "node-fetch"

const zipPath = "./zipAchive.zip"

const downlodAndSave = async () => {
  const streamPipeline = promisify(pipeline)

  const response = await fetch("http://www.cbr.ru/s/newbik")

  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`)

  return await streamPipeline(response.body, fs.createWriteStream(zipPath))
}

const extractAndRead = async () => {
  const zip = new AdmZip(zipPath)
  zip.extractAllTo("./")
  const nameOfExtractedFile = zip.getEntries().reduce((acc, entry) => {
    acc = entry.entryName
    return acc
  }, "")
  const xmlData = fs.readFileSync(`./${nameOfExtractedFile}`)
  const decodedData = iconv.decode(xmlData, "cp1251")
  const parser = new xml2js.Parser({ explicitArray: false })
  const parsedXml = await parser.parseStringPromise(decodedData)
  console.log(parsedXml)
}

const getXmlData = () => {
  downlodAndSave().then(() => extractAndRead())
}

getXmlData()
