#!/bin/bash

# Check if a domain was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi

DOMAIN=$1

# Create directories for storing keys and certificates
mkdir -p ./nginx/certs
cd ./nginx/certs

# Get dhparams
curl -o dhparam https://ssl-config.mozilla.org/ffdhe2048.txt

# Step 1: Create a Root Certificate Authority (CA)
echo "Generating Root CA..."
openssl genrsa -out rootCA.key 2048
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem -subj "/C=US/ST=$DOMAIN/L=$DOMAIN/O=$DOMAIN Inc/OU=IT Department/CN=$DOMAIN Root CA"

# Step 2: Create an Intermediate Certificate Authority (CA)
echo "Generating Intermediate CA..."
openssl genrsa -out intermediateCA.key 2048
openssl req -new -key intermediateCA.key -out intermediateCA.csr -subj "/C=US/ST=$DOMAIN/L=$DOMAIN/O=$DOMAIN/OU=IT Department/CN=$DOMAIN Intermediate CA"
openssl x509 -req -in intermediateCA.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out intermediateCA.pem -days 500 -sha256 -extfile <(echo -e "basicConstraints=CA:TRUE\nkeyUsage = critical, cRLSign, keyCertSign\nauthorityKeyIdentifier=keyid:always,issuer")

# Step 3: Create a Certificate for the Domain
echo "Generating certificate for domain: $DOMAIN"
openssl genrsa -out $DOMAIN.key 2048
openssl req -new -key $DOMAIN.key -out $DOMAIN.csr -subj "/C=US/ST=$DOMAIN/L=$DOMAIN/O=$DOMAIN Inc/OU=IT Department/CN=$DOMAIN"

# Create a configuration file for the domain certificate
cat > $DOMAIN.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
EOF

openssl x509 -req -in $DOMAIN.csr -CA intermediateCA.pem -CAkey intermediateCA.key -CAcreateserial -out $DOMAIN.pem -days 375 -sha256 -extfile $DOMAIN.ext

# Step 4: Concatenate the Certificates to Form the Chain
cat $DOMAIN.pem intermediateCA.pem rootCA.pem > fullchain.pem

# Step 5: Verify the Certificate Chain
openssl verify -CAfile rootCA.pem -untrusted intermediateCA.pem $DOMAIN.pem

# Output the result
echo "Certificate chain generated:"
echo "Private Key: ./nginx/certs/$DOMAIN.key"
echo "Certificate: ./nginx/certs/$DOMAIN.pem"
echo "Certificate Chain: ./nginx/certs/fullchain.pem"

# Clean up temporary files
rm $DOMAIN.csr $DOMAIN.ext intermediateCA.csr rootCA.srl intermediateCA.srl

echo "Done."
