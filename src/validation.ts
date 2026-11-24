export type ValidateIconValueOptions = {
  hasMany?: boolean
  invalidMessage?: string
  required?: boolean
  requiredMessage?: string
}

const isIconValue = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const keys = Object.keys(value)

  return (
    keys.length === 2 &&
    keys.includes('name') &&
    keys.includes('svg') &&
    typeof (value as Record<string, unknown>).name === 'string' &&
    typeof (value as Record<string, unknown>).svg === 'string'
  )
}

export const validateIconValue: (
  value: unknown,
  options?: ValidateIconValueOptions,
) => true | string = (
  value,
  {
    hasMany = false,
    invalidMessage = 'Select a valid icon.',
    required = false,
    requiredMessage = 'This field is required.',
  } = {},
) => {
  const isEmpty =
    value === null || value === undefined || (hasMany && Array.isArray(value) && value.length === 0)

  if (isEmpty) {
    return required ? requiredMessage : true
  }

  if (hasMany) {
    return Array.isArray(value) && value.every(isIconValue) ? true : invalidMessage
  }

  return isIconValue(value) ? true : invalidMessage
}
