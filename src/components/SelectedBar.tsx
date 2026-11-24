'use client'

import { Button } from '@payloadcms/ui'
import React from 'react'

interface SelectedBarProps {
  icons: Record<string, React.ComponentType<any>>
  onRemove: (name: string) => void
  selectedNames: string[]
}

export const SelectedBar: React.FC<SelectedBarProps> = ({ icons, onRemove, selectedNames }) => {
  if (selectedNames.length === 0) {
    return null
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        Selected ({selectedNames.length}) — Click to remove:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {selectedNames.map((name) => {
          const IconComponent = icons?.[name]
          return (
            <Button
              buttonStyle="secondary"
              icon={IconComponent && <IconComponent />}
              iconPosition="left"
              key={`selected-${name}`}
              margin={false}
              onClick={() => onRemove(name)}
              type="button"
            >
              <span>{name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
