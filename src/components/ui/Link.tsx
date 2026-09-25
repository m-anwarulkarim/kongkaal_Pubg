import { type AnchorHTMLAttributes, forwardRef } from 'react'
import { Link as TanStackLink } from '@tanstack/react-router'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  prefetch?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, prefetch = true, className = '', onClick, ...props }, ref) => {
    const isExternal =
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('wa.me')

    const isHash = href.startsWith('#')

    // Handle smooth scroll for anchor hash links
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (onClick) onClick(e)

      if (isHash && href !== '#') {
        const targetId = href.replace('#', '')
        const elem = document.getElementById(targetId)
        if (elem) {
          e.preventDefault()
          elem.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={className}
          {...props}
        >
          {children}
        </a>
      )
    }

    if (!isHash && href.startsWith('/')) {
      return (
        <TanStackLink
          to={href as any}
          preload={prefetch ? 'intent' : false}
          onClick={handleClick}
          className={className}
          {...props}
        >
          {children}
        </TanStackLink>
      )
    }

    return (
      <a ref={ref} href={href} onClick={handleClick} className={className} {...props}>
        {children}
      </a>
    )
  }
)

Link.displayName = 'CustomLink'
export default Link
