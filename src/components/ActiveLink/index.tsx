import Link, { LinkProps } from 'next/link'
import { ReactElement, cloneElement } from 'react'

import { useRouter } from 'next/dist/client/router'

interface ActiveLinkProps extends LinkProps {
  children: ReactElement
  activeClassName: string
}

export function ActiveLink({
  children,
  activeClassName,
  ...nextLinkProps
}: ActiveLinkProps) {
  const { asPath } = useRouter()

  const className = asPath === nextLinkProps.href ? activeClassName : ''

  return (
    <Link {...nextLinkProps}>
      {cloneElement(children, {
        className,
      })}
    </Link>
  )
}
