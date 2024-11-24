import Icons from "./Icons"
import styles from "./NavSidebar.module.css"

export default function NavSidebar() {
    return (
        <div className={styles.navSidebar}>
            <Icons name="home" size={34}></Icons>
            <Icons name="goal" size={34}></Icons>
            <Icons name="profile" size={34}></Icons>
            <Icons name="history" size={34}></Icons>
        </div>
    );
}