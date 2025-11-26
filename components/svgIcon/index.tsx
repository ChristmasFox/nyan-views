import SvgIcons from '@/icon'

import React, { FC, SVGProps } from 'react'

interface SvgIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  iconName?: string;
  width?: string;
  height?: string;
  fill?: string;
  className?: string
}

const SvgIcon: FC<SvgIconProps> = ({
  name,
  width = '1em',
  height = '1em',
  fill = 'currentColor',
  className = '',
  ...props
}) => {
  const IconComponent = SvgIcons[name]

  if (!IconComponent) {
    console.warn(`SvgIcon: Icon with name "${name}" not found.`)
    return null
  }

  return (
    <IconComponent
      width={width}
      height={height}
      fill={fill}
      className={`inline-block align-[-0.15em] ${className}`}
      {...props}
    />
  )
}

export default SvgIcon
