function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo">
                🌱 <span>FinSight</span>
            </div>

            <p className="menu-title">MENU</p>

            <nav>
                <a className="menu-item active">
                    🏠
                    <span>Dashboard</span>
                </a>

                <a className="menu-item">
                    📚
                    <span>Learn</span>
                </a>

                <a className="menu-item">
                    🔎
                    <span>Explore</span>
                </a>

                <a className="menu-item">
                    💼
                    <span>Portfolio</span>
                </a>

                <a className="menu-item">
                    🎮
                    <span>Simulator</span>
                </a>

                <a className="menu-item">
                    🧠
                    <span>AI Lab</span>
                </a>

                <a className="menu-item">
                    🔔
                    <span>Alerts</span>
                </a>
            </nav>

            <div className="sidebar-bottom">
                <div className="learning-box">
                    <span>🌱</span>

                    <div>
                        <strong>Learning Mode</strong>
                        <small>Beginner</small>
                    </div>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;