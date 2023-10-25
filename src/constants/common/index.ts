const env = process.env

const { NODE_ENV, IS_TS } = env

export const envFilePath = `.${NODE_ENV}.env`

export const isTs = IS_TS
