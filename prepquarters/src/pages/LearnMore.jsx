function LearnMore() {
  return (
    <main className="learn-more-page">

      {/* Hero */}
      <section className="learn-hero">
        <p className="section-label">ABOUT PREPQUARTERS</p>

        <h1>
          Prepare with clarity.
          <br />
          Perform with confidence.
        </h1>

        <p className="hero-description">
          PrepQuarters combines realistic interview practice, guided
          preparation, and AI-assisted insights in one focused experience
          built to help you prepare more effectively.
        </p>
      </section>


      {/* Our Approach */}
      <section className="learn-section">
        <div className="section-number">01</div>

        <div className="section-content">
          <p className="section-label">OUR APPROACH</p>

          <h2>Make every practice session count.</h2>

          <p>
            Instead of simply answering question after question, PrepQuarters
            helps you understand what you are practicing, where you can
            improve, and what to work on next.
          </p>
        </div>
      </section>


      {/* How It Works */}
      <section className="learn-section experience-section">
        <div className="section-number">02</div>

        <div className="section-content">
          <p className="section-label">HOW IT WORKS</p>

          <h2>A simple path from practice to progress.</h2>

          <div className="experience-grid">

            <article className="learn-card">
              <span>01</span>
              <h3>Set Your Goal</h3>
              <p>
                Pick an interview category, topic, and difficulty that fits
                what you want to practice.
              </p>
            </article>

            <article className="learn-card">
              <span>02</span>
              <h3>Take the Challenge</h3>
              <p>
                Answer realistic questions designed to simulate an interview
                environment.
              </p>
            </article>

            <article className="learn-card">
              <span>03</span>
              <h3>Understand Your Results</h3>
              <p>
                Review feedback and identify the parts of your responses that
                deserve more attention.
              </p>
            </article>

            <article className="learn-card">
              <span>04</span>
              <h3>Keep Improving</h3>
              <p>
                Return to practice, build consistency, and track your
                development over time.
              </p>
            </article>

          </div>
        </div>
      </section>


      {/* Why PrepQuarters */}
      <section className="learn-section">
        <div className="section-number">03</div>

        <div className="section-content">
          <p className="section-label">WHY PREPQUARTERS</p>

          <h2>More than a question bank.</h2>

          <div className="why-grid">

            <article className="learn-card">
              <h3>Targeted Practice</h3>
              <p>
                Focus your sessions around the skills, topics, and interview
                types you actually want to improve.
              </p>
            </article>

            <article className="learn-card">
              <h3>AI-Assisted Insights</h3>
              <p>
                Get useful feedback that can help you think about your
                responses from a different perspective.
              </p>
            </article>

            <article className="learn-card">
              <h3>Visible Progress</h3>
              <p>
                Keep an eye on your practice activity and discover areas where
                additional preparation could help.
              </p>
            </article>

            <article className="learn-card">
              <h3>Your Preparation, Your Pace</h3>
              <p>
                Practice when you are ready and adjust your preparation as
                your goals develop.
              </p>
            </article>

          </div>
        </div>
      </section>


      {/* Technology */}
      <section className="learn-section technology-section">
        <div className="section-number">04</div>

        <div className="section-content">
          <p className="section-label">THE TECHNOLOGY</p>

          <h2>Technology that supports the learner.</h2>

          <p>
            PrepQuarters is designed around AI-assisted practice rather than
            replacing the learner. The goal is to provide useful guidance,
            structured practice, and insights while keeping you in control of
            your preparation.
          </p>
        </div>
      </section>


      {/* Mission */}
      <section className="mission-section">
        <p className="section-label">OUR MISSION</p>

        <h2>
          Turn interview anxiety
          <br />
          into preparation.
        </h2>

        <p>
          We believe preparation becomes more manageable when you have a clear
          place to practice, reflect, and try again. PrepQuarters aims to make
          that process more organized, approachable, and useful.
        </p>
      </section>


      {/* Final CTA */}
     <section className="learn-cta">
  <p className="section-label">YOUR NEXT STEP</p>

  <h2>Ready to put your preparation to work?</h2>

  <p>
    Build your confidence through focused practice,
    meaningful feedback, and consistent preparation.
  </p>
</section>

    </main>
  );
}

export default LearnMore;