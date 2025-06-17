import forge from "node-forge";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create certificates directory if it doesn't exist
const certsDir = path.join(__dirname, "../certificates");
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Generate a new key pair
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

// Set certificate details
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [
  {
    name: "commonName",
    value: "localhost",
  },
  {
    name: "countryName",
    value: "US",
  },
  {
    shortName: "ST",
    value: "State",
  },
  {
    name: "localityName",
    value: "City",
  },
  {
    name: "organizationName",
    value: "Development",
  },
  {
    shortName: "OU",
    value: "Development",
  },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Self-sign the certificate
cert.sign(keys.privateKey);

// Convert to PEM format
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const certPem = forge.pki.certificateToPem(cert);

// Save the files
fs.writeFileSync(path.join(certsDir, "key.pem"), privateKeyPem);
fs.writeFileSync(path.join(certsDir, "cert.pem"), certPem);

console.log(
  "Certificates generated successfully in the certificates directory!"
);
