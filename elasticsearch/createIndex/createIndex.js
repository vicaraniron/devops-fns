'use strict'

const AWS = require('aws-sdk')
const creds = new AWS.EnvironmentCredentials('AWS')

module.exports.createIndex = (event, context, callback) => {
  const mapper = {
    mappings: {
      partnerLocationGeoDistance: {
        properties: {
          address: {
            type: 'nested',
            properties: {
              addressLine1: {
                type: 'keyword'
              },
              addressLine2: {
                type: 'keyword'
              },
              city: {
                type: 'keyword'
              },
              postalCode: {
                type: 'keyword'
              },
              province: {
                type: 'keyword'
              },
              provinceCode: {
                type: 'keyword'
              }
            }
          },
          id: {
            type: 'keyword'
          },
          location: {
            type: 'geo_point'
          },
          locationCode: {
            type: 'keyword'
          },
          partnerId: {
            type: 'keyword'
          },
          phone: {
            type: 'keyword'
          },
          sponsorCode: {
            type: 'keyword'
          },
          sponsorName: {
            type: 'keyword'
          },
          storeName: {
            type: 'keyword'
          }
        }
      }
    }
  }

  const endpoint = new AWS.Endpoint(process.env.elasticsearchUrl)

  const req = new AWS.HttpRequest(endpoint)
  req.method = 'PUT'
  req.path = '/partner-location'
  req.region = 'us-east-1'
  req.body = JSON.stringify(mapper)
  req.headers['presigned-expires'] = 'false'
  req.headers['Host'] = endpoint.host

  // Sign the request (Sigv4)
  const signer = new AWS.Signers.V4(req, 'es')
  signer.addAuthorization(creds, new Date())

  // Post document to ES
  const send = new AWS.NodeHttpClient()
  send.handleRequest(req, null, function (httpResp) {
    let body = ''
    httpResp.on('data', function (chunk) {
      body += chunk
    })
    httpResp.on('end', function (chunk) {
      console.log({
        body: body
      })
      callback(null, {
        statusCode: 200,
        body: body
      })
    })
  }, function (err) {
    console.log('Error: ' + err)
    callback(err)
  })
}
