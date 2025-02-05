'use client'
import Link from 'next/link'
import Icons from "./Icons"
import styles from "./NavSidebar.module.css"

export default function NavSidebar() {
    return (
        <div className={styles.navSidebar}>
            <Link href="/">
                <Icons name="home" size={34} />
            </Link>
            <Link href="/profile">
                <Icons name="profile" size={34} />
            </Link>
            <Link href="/history">
                <Icons name="history" size={34} />
            </Link>
        </div>
    )
}