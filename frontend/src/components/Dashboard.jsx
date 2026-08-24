function Dashboard() {
    return (
        <div className="dashboard">

            {/* Welcome section */}
            <section className="welcome-section">
                <div>
                    <p className="small-label">YOUR INVESTMENT JOURNEY</p>

                    <h1>
                        Good morning 👋
                    </h1>

                    <p className="welcome-text">
                        Let's learn something new about investing today.
                    </p>
                </div>

                <div className="level-badge">
                    🌱 Beginner Investor
                </div>
            </section>


            {/* Learning progress */}
            <section className="progress-card">

                <div className="progress-header">
                    <div>
                        <p className="small-label">YOUR LEARNING PROGRESS</p>

                        <h2>
                            You're getting smarter!
                        </h2>
                    </div>

                    <strong>72%</strong>
                </div>

                <div className="progress-bar">
                    <div className="progress-fill"></div>
                </div>

                <p className="progress-text">
                    You've completed 7 of 10 beginner lessons.
                </p>

            </section>


            {/* Market + lesson */}
            <section className="dashboard-grid">

                <div className="market-card">

                    <div className="card-heading">
                        <div>
                            <p className="small-label">MARKET TODAY</p>
                            <h2>What's happening?</h2>
                        </div>

                        <span className="market-icon">
              📈
            </span>
                    </div>


                    <div className="market-row">
                        <div>
                            <strong>NIFTY 50</strong>
                            <span>National index</span>
                        </div>

                        <div className="market-positive">
                            +0.82%
                        </div>
                    </div>


                    <div className="market-row">
                        <div>
                            <strong>SENSEX</strong>
                            <span>Market index</span>
                        </div>

                        <div className="market-positive">
                            +0.67%
                        </div>
                    </div>


                    <button className="learn-button">
                        Why did the market move? →
                    </button>

                </div>


                <div className="lesson-card">

          <span className="lesson-icon">
            💡
          </span>

                    <p className="small-label">
                        TODAY'S LESSON
                    </p>

                    <h2>
                        What exactly is a stock?
                    </h2>

                    <p>
                        Learn the basic idea behind owning a tiny
                        piece of a company.
                    </p>

                    <button className="lesson-button">
                        Learn in 30 seconds →
                    </button>

                </div>

            </section>


            {/* Popular stocks */}
            <section className="stocks-section">

                <div className="section-heading">

                    <div>
                        <p className="small-label">
                            EXPLORE
                        </p>

                        <h2>
                            Popular stocks
                        </h2>
                    </div>

                    <button className="view-button">
                        View all →
                    </button>

                </div>


                <div className="stock-grid">

                    <div className="stock-card">
                        <div className="stock-top">
                            <span className="stock-logo">T</span>

                            <div>
                                <strong>TCS</strong>
                                <span>Tata Consultancy Services</span>
                            </div>
                        </div>

                        <h3>₹3,210.20</h3>

                        <span className="market-positive">
              +0.82% today
            </span>
                    </div>


                    <div className="stock-card">
                        <div className="stock-top">
                            <span className="stock-logo">I</span>

                            <div>
                                <strong>INFY</strong>
                                <span>Infosys</span>
                            </div>
                        </div>

                        <h3>₹1,542.35</h3>

                        <span className="market-negative">
              -0.31% today
            </span>
                    </div>


                    <div className="stock-card">
                        <div className="stock-top">
                            <span className="stock-logo">R</span>

                            <div>
                                <strong>RELIANCE</strong>
                                <span>Reliance Industries</span>
                            </div>
                        </div>

                        <h3>₹1,450.50</h3>

                        <span className="market-positive">
              +1.24% today
            </span>
                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;