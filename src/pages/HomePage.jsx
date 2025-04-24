
import '../styles/homepage.css'; // تأكدي إن الملف موجود في المسار الصحيح
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import re1 from '../assets/imgs/re1.jpg';
import jrd3 from '../assets/imgs/jrd3.jpg';
import alu1 from '../assets/imgs/alu1.jpg';
import jed1 from '../assets/imgs/jed1.jpg';
import re3 from '../assets/imgs/re3.jpg';
import m2 from '../assets/imgs/m2.jpg';
import alu3 from '../assets/imgs/alu3.jpg';
import f3 from '../assets/imgs/f3.jpg';
import q1 from '../assets/imgs/q1.jpg';
import t1 from '../assets/imgs/t1.jpg';
import a1 from '../assets/imgs/a1.jpg';




export default function HomePage() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);



  const [changingText, setChangingText] = useState("Discover Saudi Arabia's Cultural Treasures");

  useEffect(() => {
    const textList = [
      "Discover Saudi Arabia's Cultural Treasures",
      "Explore history through a digital map",
      "Your guide to cultural landmarks in KSA"
    ];
  
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textList.length;
      setChangingText(textList[textIndex]);
    }, 6000);
  
    const slides = document.querySelectorAll(".hero-slide");
    let slideIndex = 0;
    const slideInterval = setInterval(() => {
      slides.forEach((slide) => slide.classList.remove("active"));
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add("active");
    }, 6000);

  
    return () => {
      clearInterval(textInterval);
      clearInterval(slideInterval);
    };
  }, []);

  useEffect(() => {
    const stackedCards = document.querySelectorAll('.stacked-card');
  
    function updateStackedCards(index) {
      stackedCards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index) card.classList.add('active');
  
        const offset = (i < index) ? (index - i) * -30 : 0;
        card.style.transform = `translateY(${offset}px) scale(${i === index ? 1 : 0.96})`;
        card.style.zIndex = stackedCards.length - Math.abs(i - index);
        card.style.opacity = i === index ? 1 : 0.4;
      });
    }
  
    updateStackedCards(currentIndex);
  
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4);
    }, 4000);
  
    return () => clearInterval(interval);
  }, [currentIndex]);
  


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // ✅ نتأكد إن البوب أب مقفل قبل إضافة الأنميشن
        if (!document.body.classList.contains('popup-open')) {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        }
      });
    }, { threshold: 0.2 });
  
    const fadeUpElements = document.querySelectorAll('.fade-up');
    fadeUpElements.forEach((el) => observer.observe(el));
  
    return () => {
      fadeUpElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!document.body.classList.contains('popup-open')) {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        }
      });
    }, { threshold: 0.3 });
  
    const elements = document.querySelectorAll('.from-left, .from-right');
    elements.forEach((el) => observer.observe(el));
  
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  
  
  

  return (
    <>
      <header className="header">
        <div className="logo">
          <span>
            مرشد <span className="divider">|</span> Murshid
          </span>
        </div>
        <div className="auth-buttons header-icons">
          <div className="icon-circle">
            <a href="translation_page.html" title="تغيير اللغة">
              <img src="https://cdn-icons-png.flaticon.com/512/484/484582.png" alt="تغيير اللغة" />
            </a>
          </div>
          <div className="icon-circle" onClick={() => navigate('/login')} title="تسجيل الدخول">
  <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="تسجيل الدخول" />
</div>

          <div className="icon-circle" onClick={() => setShowContact(true)} title="تواصل معنا">
  <img src="https://cdn-icons-png.flaticon.com/512/597/597177.png" alt="تواصل معنا" />
</div>

        </div>
      </header>

      <main>

      <div className="hero">
      <div className="hero-slide active" style={{ backgroundImage: `url(${re1})` }}></div>
<div className="hero-slide" style={{ backgroundImage: `url(${jrd3})` }}></div>
<div className="hero-slide" style={{ backgroundImage: `url(${alu1})` }}></div>


        <div className="hero-overlay"></div>

      <div className="hero-text">
  <h1 id="changing-text">{changingText}</h1>

  {/* فصل الزرار في div منفصل بعد العنوان يثبت مكانها */}
  <div className="hero-btns">
    <button className="btn explore">Explore</button>
    <button className="btn learn" onClick={() => setShowModal(true)}>
  About Murshid
</button>

  </div>
</div>

      </div>

      <div
  className="explore-popup"
  id="explorePopup"
  onClick={(e) => {
    if (e.target.classList.contains("explore-popup")) {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("explorePopup").classList.remove("show");
      document.body.classList.remove("popup-open");
    }
  }}
>
  <span
    className="explore-close"
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("explorePopup").classList.remove("show");
      document.body.classList.remove("popup-open");
      window.scrollTo({ top: scrollPos, behavior: "auto" });

    }}
  >
    &times;
  </span>
  <div className="explore-image" id="popupImage"></div>

  <div className="explore-popup-content">
    <h2 id="popupTitle"></h2>
    <p id="popupDescription"></p>
  </div>
</div>


      <h2 className="section-title fade-section animate">Explore Top Cities</h2>

      <div className="stacked-horizontal-container fade-section animate">
  {[{
    title: "Jeddah",
    desc: "Explore the historic streets and coral houses of Al-Balad.",
    img: jed1,
    city: "Jeddah"
  }, {
    title: "Riyadh",
    desc: "Discover the vibrant capital full of history and modernity.",
    img: re3,
    city: "Riyadh"
  }, {
    title: "Madinah",
    desc: "Experience the spiritual heart of Islam and explore historic sites in Madinah.",
    img: m2,
    city: "Madinah"
  }, {
    title: "AlUla",
    desc: "Experience breathtaking desert landscapes and ancient tombs of Hegra.",
    img: alu3,
    city: "AlUla"
  }].map((city, i) => (
    <div
      key={i}
      className={`stacked-card fade-up ${i === currentIndex ? 'active' : ''}`}
      onClick={() => {
        const nextIndex = (i + 1) % 4;
        setCurrentIndex(nextIndex);
      }}
    >
      
      <div className="content-side">
        <h3>{city.title}</h3>
        <p>{city.desc}</p>
        <button onClick={(e) => {
          e.stopPropagation(); // 🔒 تمنع انتقال الكليك للكرت
          window.location.href = `map.html?city=${city.city}`;
        }}>
          Explore
        </button>
      </div>
      <img className="img-side" src={city.img} alt={city.title} />
    </div>
  ))}
</div>

<section className="why-murshid-timeline fade-up">
  <h2 className="section-title">Why Murshid?</h2>
  <div className="timeline-icons">
    <div className="timeline-item">
      <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Map Icon" />
      <h3>Interactive Map</h3>
      <p>Navigate cultural sites across Saudi Arabia with ease using our intuitive digital map.</p>
    </div>

    <div className="timeline-item">
      <img src="https://cdn-icons-png.flaticon.com/512/2983/2983956.png" alt="Archive Icon" />
      <h3>Heritage Documentation</h3>
      <p>Accurate historical information curated from trusted sources and experts.</p>
    </div>

    <div className="timeline-item">
      <img src="https://cdn-icons-png.flaticon.com/512/1589/1589593.png" alt="Language Icon" />
      <h3>Multi-language Support</h3>
      <p>Murshid is accessible in both Arabic and English to reach a wider audience.</p>
    </div>

    <div className="timeline-item">
      <img src="https://cdn-icons-png.flaticon.com/512/2989/2989988.png" alt="Collaboration Icon" />
      <h3>Open Collaboration</h3>
      <p>Users can suggest edits and contribute directly to the platform.</p>
    </div>
  </div>
</section>


<section className="hidden-saudi">
  <h2 className="section-title">Explore the Hidden Saudi</h2>
  <div className="hidden-cards">
    {[
      {
        title: "Faifa Mountains",
        desc: "Terraced green hills in Jazan.",
        fullDesc: "Located in the Jazan region, Faifa Mountains are known for their lush green terraces, cool breezes, and unique circular houses stacked along steep slopes — making them one of Saudi Arabia’s most picturesque highlands.",
        image: f3

      },
      {
        title: "Al-Qarah Mountain",
        desc: "Cool caves in Al-Ahsa.",
        fullDesc: "A natural wonder in Al-Ahsa, this mountain features surreal rock formations and naturally cooled caves historically used for shelter and gatherings. The caves offer a refreshing escape from the desert heat.",
        image: q1
      },
      {
        title: "Tayeb Ism",
        desc: "Cliffs by the Red Sea.",
        fullDesc: "A breathtaking natural site near the Red Sea in Tabuk. It features towering granite cliffs divided by a narrow canyon, with freshwater streams and palm groves.",
        image: t1
      },
      {
        title: "Dhee Ain Village",
        desc: "Marble homes in Al-Baha.",
        fullDesc: "Built from white marble stones, this 400-year-old village in Al-Baha sits atop a rocky hill with natural spring water flowing beneath it.",
        image: a1
      }
    ].map((place, i) => (
      <div
        key={i}
        className={`hidden-card ${i < 2 ? 'from-left' : 'from-right'}`}
        style={{ backgroundImage: `url(${place.image})` }}
        onClick={() => {
          document.getElementById("popupImage").style.backgroundImage = `url(${place.image})`;


          document.getElementById("popupTitle").textContent = place.title;
          document.getElementById("popupDescription").textContent = place.fullDesc;
          setScrollPos(window.scrollY); 
          document.getElementById("explorePopup").classList.add("show");
          document.body.classList.add("popup-open"); 
        }}
      >
        <div className="card-overlay">
          <h3>{place.title}</h3>
          <p>{place.desc}</p>
        </div>
      </div>
    ))}
  </div>
</section>



{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
      <h2>About Murshid</h2>
      <p>Murshid is an open cultural platform that aims to document and showcase Saudi Arabia’s rich cultural and historical landmarks through interactive maps and user collaboration.</p>
      <p>It allows users to explore cities, contribute with content, and connect with the heritage of the Kingdom in a modern, digital way.</p>
    </div>
  </div>
  
)}



</main>

<footer>
  <p>© 2025 Murshid Platform — All rights reserved.</p>
  <p>
    <a href="#">Privacy Policy</a> | <a href="#">Contact Us</a>
  </p>
</footer>

{showContact && (
  <div className="modal-overlay" onClick={() => setShowContact(false)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <span className="close-btn" onClick={() => setShowContact(false)}>&times;</span>
      <h2>Contact Us</h2>
      <p>📧 Email us at:</p>
      <p style={{ fontWeight: 'bold', color: '#004b3f' }}>no-reply@murshid.com</p>
    </div>
  </div>
)}

</>

    
  );
}
