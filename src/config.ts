import fs from 'fs'
import Joi from '@hapi/joi'
// import { fatal } from './log'

type Config = {
  chats: string[],
  init: {
    type: 'init',
    username: string,
    paperkey: string
  } | {
    // NOTE: With this setting watcher doesn't collect user's own messages
    type: 'initFromRunningService'
  },
  watcher: {
    enabled: boolean,
    timeout: number // seconds
  },
  eol: string,
  attachments: {
    addStub: boolean // Adds '[Attachment <filename>]' to the caption
  },
  // incremental: {|
  //   enabled: boolean,
  //   sessionFile: string
  // |},
    // "incremental": {
    //   "enabled": true,
    //   "sessionFile": "keybase-export.session"
    // },
  elasticsearch: {
    enabled: boolean,
    indexPattern: string,
    config: Record<string, any> // ElasticSearch config
  },
  jsonl: {
    enabled: boolean,
    file: string
  }
}

const schema = Joi.object().keys({
  chats: Joi.array().items(Joi.string()),
  init: Joi.alternatives(
    Joi.object().keys({
      type: Joi.string().valid('init'),
      username: Joi.string(),
      paperkey: Joi.string()
    }),
    Joi.object().keys({
      type: Joi.string().valid('initFromRunningService')
    })
  ),
  watcher: Joi.object().keys({
    enabled: Joi.boolean(),
    timeout: Joi.number()
  }),
  eol: Joi.string(),
  // incremental: Joi.object().keys({
  //   enabled: Joi.boolean(),
  //   sessionFile: Joi.string()
  // }),
  attachments: Joi.object().keys({
    addStub: Joi.boolean()
  }),
  elasticsearch: Joi.object().keys({
    enabled: Joi.boolean(),
    indexPattern: Joi.string(),
    config: Joi.object()
  }),
  jsonl: Joi.object().keys({
    enabled: Joi.boolean(),
    file: Joi.string()
  })
}).unknown(true)

// const configPath = process.argv[2] || 'config.example.json'
const configPath = process.argv[2] || 'config.json'

const untrustedConfig = JSON.parse(fs.readFileSync(configPath).toString())

const result = schema.validate(untrustedConfig)

if (result.error) throw result.error

export const config: Config = result.value