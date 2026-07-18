import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import  "./Landingpage.css";

 

const stats = [
  { value: "2.4K+", label: "Active swappers" },
  { value: "180+", label: "Skills listed" },
  { value: "4.8★", label: "Avg. rating" },
  { value: "₹0",   label: "To get started" },
];

const cards = [
  { initial: "R", name: "Ritika Sharma", meta: "Teaches: Graphic Design", tag: "TEACHES" },
  { initial: "A", name: "Arjun Mehta",   meta: "Teaches: Python & Data",  tag: "SWAPS"   },
  { initial: "P", name: "Priya Nair",    meta: "Teaches: Hindi Speaking", tag: "MATCHES" },
];

const trustTags = [
  "UI/UX Design","Python Programming","Guitar Lessons","Digital Marketing",
  "Hindi Speaking","Excel & Finance","Photography","Web Development","Yoga & Wellness",
];
function Landingpage(){
   const navigate = useNavigate();
  return (
    <>
      
      <div className="ss-root">

         <section className="ss-hero">

          
          <div className="ss-hero-left">
            <span className="ss-eyebrow">Connect · Learn · Teach</span>

            <h1 className="ss-h1">
              Trade what<br />
              you <em>know,</em><br />
              learn what<br />
              you <em>don't.</em>
            </h1>

            <p className="ss-desc">
              SkillSwap matches people by what they can teach and what they want to learn.
              No money changes hands — only knowledge.
            </p>

            <div className="ss-actions">
              <button className="ss-btn-primary"  onClick={()=>navigate('/login')}>Find Your Match →</button>
              
            </div>

            <div className="ss-stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="ss-stat-value">{s.value}</div>
                  <div className="ss-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

         
          <div className="ss-hero-right">
            <div className="ss-monogram">S</div>

            <div className="ss-card-stack">
              {cards.map((card, i) => (
                <>
                  {i > 0 && (
                    <div className="ss-connector" key={`conn-${i}`}>
                      <div className="ss-swap-icon">⇅</div>
                    </div>
                  )}
                  <div className="ss-swap-card" key={card.name}>
                    <div className="ss-avatar">{card.initial}</div>
                    <div>
                      <div className="ss-card-name">{card.name}</div>
                      <div className="ss-card-meta">{card.meta}</div>
                    </div>
                    <span className="ss-card-tag">{card.tag}</span>
                  </div>
                </>
              ))}
            </div>

            <div className="ss-badge">
              <div className="ss-badge-icon">🔁</div>
              <div>
                <div className="ss-badge-top">New match found!</div>
                <div className="ss-badge-bottom">2 min ago · Design ↔ Dev</div>
              </div>
            </div>
          </div>

        </section>

        <div className="ss-trust">
          <span className="ss-trust-label">Skills traded</span>
          <div className="ss-trust-tags">
            {trustTags.map((t) => (
              <span className="ss-trust-tag" key={t}>{t}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
export default Landingpage