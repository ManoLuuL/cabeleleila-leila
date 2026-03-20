import { Link } from "react-router-dom";
import { motion } from 'framer-motion'
import type { NavLinkProps } from "./types";

export const NavLink = (props: NavLinkProps) => {
    const { to, label, icon, active } = props

    return (
        <Link
            to={to}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? 'text-pink-700' : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                }`}
        >
            {active && (
                <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-pink-100 rounded-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
            )}
            <span className="relative flex items-center gap-1.5">
                {icon}
                {label}
            </span>
        </Link>
    )
}