import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'

// @payloadcms/ui imports its stylesheets from JavaScript; stub them so Node can load the client entry.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.css') || url.endsWith('.scss')) {
      return { format: 'module', shortCircuit: true, source: 'export default {};' }
    }

    return nextLoad(url, context)
  },
})

const { iconField, payloadIconPicker } = await import('payload-icon-picker')
const client = await import('payload-icon-picker/client')
const rsc = await import('payload-icon-picker/rsc')
const { validateIconValue } = await import('../dist/validation.js')

const icon = { name: 'Compass', svg: '<svg viewBox="0 0 24 24"></svg>' }
const validationArguments = { req: { t: (key) => key } }

test('package entry points keep their public exports', () => {
  assert.equal(typeof iconField, 'function')
  assert.equal(typeof payloadIconPicker, 'function')
  assert.equal(typeof client.IconCell, 'function')
  assert.equal(typeof client.IconPackProvider, 'function')
  assert.equal(typeof client.IconPicker, 'function')
  assert.equal(typeof client.IconRenderer, 'function')
  assert.deepEqual(Object.keys(rsc), [])
})

test('iconField describes the stored icon with a Payload v4 JSON schema', () => {
  const field = iconField()
  const manyField = iconField({ hasMany: true })

  assert.equal(field.name, 'icon')
  assert.equal(field.type, 'json')
  assert.equal(field.typescriptSchema, undefined)
  assert.deepEqual(field.jsonSchema.fileMatch, ['payload-icon-picker://icon.json'])
  assert.equal(field.jsonSchema.uri, 'payload-icon-picker://icon.json')
  assert.deepEqual(field.jsonSchema.schema.required, ['name', 'svg'])
  assert.equal(manyField.jsonSchema.schema.type, 'array')
  assert.deepEqual(manyField.jsonSchema.schema.items, field.jsonSchema.schema)
})

test('iconField validates single and multiple icon values', async () => {
  const field = iconField({ required: true })
  const optionalField = iconField()
  const manyField = iconField({ hasMany: true })
  const requiredManyField = iconField({ hasMany: true, required: true })

  assert.equal(await field.validate(icon, validationArguments), true)
  assert.equal(await field.validate(null, validationArguments), 'validation:required')
  assert.equal(await field.validate({ ...icon, legacy: true }, validationArguments), 'validation:invalidInput')
  assert.equal(await field.validate({ name: 'Compass', svg: 42 }, validationArguments), 'validation:invalidInput')
  assert.equal(await optionalField.validate(null, validationArguments), true)
  assert.equal(await manyField.validate([icon], validationArguments), true)
  assert.equal(await manyField.validate([icon, null], validationArguments), 'validation:invalidInput')
  assert.equal(await manyField.validate(icon, validationArguments), 'validation:invalidInput')
  assert.equal(await requiredManyField.validate([], validationArguments), 'validation:required')
})

test('validateIconValue falls back to English messages', () => {
  assert.equal(validateIconValue(undefined), true)
  assert.equal(validateIconValue(undefined, { required: true }), 'This field is required.')
  assert.equal(validateIconValue('Compass'), 'Select a valid icon.')
})

test('required reaches the admin field from iconField and plugin options', () => {
  const field = iconField({ required: true })

  assert.equal(field.required, true)
  assert.equal(field.admin.components.Field.clientProps.required, true)
  assert.equal(field.admin.components.Field.path, 'payload-icon-picker/client#IconPicker')

  const config = payloadIconPicker({
    collections: { pages: { required: true }, posts: true },
    required: false,
  })({
    collections: [
      { slug: 'pages', fields: [] },
      { slug: 'posts', fields: [] },
    ],
  })
  const [pagesIcon] = config.collections[0].fields
  const [postsIcon] = config.collections[1].fields

  assert.equal(pagesIcon.required, true)
  assert.equal(postsIcon.required, false)
})
